import axios from 'axios';

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary Warehouse";

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

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
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
 * Create a custom order in Shiprocket
 */
export const createShiprocketOrder = async (order: any) => {
  const jwt = await authenticate();

  const shiprocketData = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split('T')[0],
    pickup_location: SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: order.shippingAddress.fullName || "Customer",
    billing_last_name: "",
    billing_address: order.shippingAddress.address,
    billing_address_2: "",
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.postalCode,
    billing_state: "", // Should ideally come from address
    billing_country: order.shippingAddress.country || "India",
    billing_email: order.user.email || "customer@example.com",
    billing_phone: order.shippingAddress.phone || "0000000000",
    shipping_is_billing: true,
    order_items: order.orderItems.map((item: any) => ({
      name: item.name,
      sku: item.product.toString(),
      units: item.quantity,
      selling_price: item.price,
      hsn: "", // Optional
    })),
    payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: order.totalPrice - order.shippingPrice,
    length: 10, // Default 10cm
    width: 10,  // Default 10cm
    height: 5,   // Default 5cm
    weight: 0.5, // Default 0.5kg
  };

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', shiprocketData, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
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
