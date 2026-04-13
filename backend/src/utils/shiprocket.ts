import axios from 'axios';

let token: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Authenticate with Shiprocket and get a JWT token
 */
export const authenticate = async () => {
  // Return cached token if valid
  if (token && tokenExpiry && Date.now() < tokenExpiry) {
    return token;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.error("Missing Shiprocket credentials in .env");
    throw new Error('Missing Shiprocket credentials');
  }

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: email,
      password: password,
    });

    if (response.data.token) {
      token = response.data.token;
      // Tokens usually last 10 days, but we'll refresh every 24h to be safe
      tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      return token;
    }
    throw new Error('Failed to get Shiprocket token');
  } catch (error: any) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Validate that the order data doesn't contain placeholders or dummy data
 */
const validateShiprocketData = (order: any) => {
  const placeholders = ["not authorized", "placeholder", "test", "dummy", "unknown"];
  const dummyPincodes = ["000000", "111111", "123456", "400000", "999999"];

  const address = order.shippingAddress;
  const fullName = (address.fullName || "").toLowerCase();
  const street = (address.address || "").toLowerCase();
  const email = (order.user?.email || "").toLowerCase();
  const pincode = (address.postalCode || address.zip || "").replace(/\D/g, '');

  if (placeholders.some(p => fullName.includes(p))) {
    throw new Error(`Invalid Customer Name: "${address.fullName}". Please update with real customer name.`);
  }

  if (placeholders.some(p => email.includes(p)) && !email.includes("customer@example.com")) {
    throw new Error(`Invalid Email: "${order.user?.email}". Please update with real email.`);
  }

  if (placeholders.some(p => street.includes(p))) {
    throw new Error(`Invalid Address: "${address.address}". Please update with complete delivery details.`);
  }

  if (dummyPincodes.includes(pincode)) {
    throw new Error(`Invalid Pincode: "${pincode}". Shiprocket does not accept dummy pincodes.`);
  }

  if (pincode.length !== 6) {
    throw new Error(`Invalid Pincode: "${pincode}". Must be exactly 6 digits.`);
  }
};

/**
 * Create a custom order in Shiprocket
 */
export const createShiprocketOrder = async (order: any) => {
  console.log("Creating Shiprocket Order for ID:", order._id);
  
  if (!order.shippingAddress) {
    throw new Error("Order shipping address is missing");
  }

  // Run the safety filter
  validateShiprocketData(order);

  const jwt = await authenticate();
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";

  // Robust field extraction
  const fullName = order.shippingAddress.fullName || "Customer";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ".";

  const shiprocketData = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()).toISOString().split('T')[0],
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.shippingAddress.address || "No Address Provided",
    billing_address_2: "",
    billing_city: order.shippingAddress.city || "City",
    billing_pincode: (order.shippingAddress.postalCode || order.shippingAddress.zip || "").replace(/\D/g, '').substring(0, 6) || "400001",
    billing_state: order.shippingAddress.state || order.shippingAddress.city || "Maharashtra", 
    billing_country: order.shippingAddress.country || "India",
    billing_email: (order.user && order.user.email) || "customer@example.com",
    billing_phone: (order.shippingAddress.phone || "9999999999").replace(/\D/g, '').substring(0, 10),
    shipping_is_billing: true,
    order_items: (order.orderItems || []).map((item: any) => ({
      name: item.name || "Product",
      sku: item.product ? item.product.toString() : (item._id ? item._id.toString() : "SKU"),
      units: item.quantity || 1,
      selling_price: item.price || 0,
    })),
    payment_method: (order.paymentMethod || "").toLowerCase() === 'cod' ? 'COD' : 'Prepaid',
    sub_total: (order.totalPrice || 0) - (order.shippingPrice || 0),
    length: 10,
    breadth: 10,
    height: 5,
    weight: 0.5,
  };

  console.log("Shiprocket Payload Prepared");

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', shiprocketData, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Shiprocket API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Track an order by its Shiprocket Shipment ID
 */
export const trackShipment = async (shipmentId: string) => {
  const jwt = await authenticate();

  try {
    const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check serviceability for a given pincode
 */
export const checkServiceability = async (deliveryPincode: string, weight: number = 0.5, isCod: boolean = false) => {
  const jwt = await authenticate();
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "700144"; // Defaulting to Kolkata pincode

  try {
    const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
      params: {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: weight,
        cod: isCod ? 1 : 0
      },
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
    throw error;
  }
};
