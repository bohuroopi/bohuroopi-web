"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Lock, Truck, ShieldCheck, Loader2, Plus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";


export default function Checkout() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated: _authHydrated } = useAuthStore();
  const { items, totalPrice, totalMRP, totalDiscount, appliedCoupon, _hasHydrated: _cartHydrated } = useCartStore();
  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState("phonepe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    postalCode: "",
    address: "", // maps to street
    locality: "", // maps to state
    city: "",
    country: "India",
  });

  useEffect(() => {
    if (_authHydrated) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/checkout");
      } else {
        fetchAddresses();
        fetchSettings();
        
        // Restore step from session storage if available
        const savedStep = sessionStorage.getItem("checkout_step");
        if (savedStep) setStep(parseInt(savedStep));
      }
    }
  }, [isAuthenticated, _authHydrated, router]);

  useEffect(() => {
    if (step > 1) {
      sessionStorage.setItem("checkout_step", step.toString());
    } else {
      sessionStorage.removeItem("checkout_step");
    }
  }, [step]);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const calculateShipping = () => {
    const subtotal = totalPrice();
    if (!settings) return 0;
    return subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  };

  const calculateFinalTotal = () => {
    const subtotal = totalPrice();
    const shipping = calculateShipping();
    const cod = paymentMethod === 'cod' ? (settings?.codCharges || 0) : 0;
    const couponDisc = appliedCoupon ? appliedCoupon.discountAmount : 0;
    return Math.max(0, subtotal + shipping + cod - couponDisc);
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/users/addresses");
      if (res.data.success) {
        const addrs = res.data.addresses;
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultIdx = addrs.findIndex((a: any) => a.isDefault);
          setSelectedAddressIndex(defaultIdx !== -1 ? defaultIdx : 0);
          setIsAddingNew(false);
        } else {
          setIsAddingNew(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingNew) {
      if (!newAddress.address || !newAddress.postalCode || !newAddress.fullName || !newAddress.phone) {
          setError("Please fill out complete address details");
          return;
      }
      try {
        setLoading(true);
        setError(null);
        const payload = {
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          zip: newAddress.postalCode,
          street: newAddress.address,
          state: newAddress.locality,
          city: newAddress.city,
          country: newAddress.country,
          isDefault: savedAddresses.length === 0
        };
        const res = await api.post("/users/addresses", payload);
        if (res.data.success) {
          const updatedAddresses = res.data.addresses;
          setSavedAddresses(updatedAddresses);
          setSelectedAddressIndex(updatedAddresses.length - 1);
          setIsAddingNew(false);
          setStep(2);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to save address");
      } finally {
        setLoading(false);
      }
    } else {
      if (selectedAddressIndex === null) {
        setError("Please select a delivery address");
        return;
      }
      setStep(2);
    }
  };

  const handlePayNow = async () => {
    if (selectedAddressIndex === null || !savedAddresses[selectedAddressIndex]) {
       setError("No address selected.");
       return;
    }
    const finalAddress = savedAddresses[selectedAddressIndex];

    try {
        setLoading(true);
        setError(null);

        // Format items for DB Schema
        const orderItems = items.map(item => ({
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            image: item.image || "placeholder",
            price: item.price
        }));

        const payload = {
            orderItems,
            shippingAddress: {
                fullName: finalAddress.fullName,
                phone: finalAddress.phone,
                address: `${finalAddress.street}, ${finalAddress.state}`,
                city: finalAddress.city,
                postalCode: finalAddress.zip,
                country: finalAddress.country || 'India'
            },
            paymentMethod,
            discountPrice: appliedCoupon ? appliedCoupon.discountAmount : 0,
            couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            shippingPrice: calculateShipping(),
            codPrice: paymentMethod === 'cod' ? (settings?.codCharges || 0) : 0,
            totalPrice: calculateFinalTotal()
        };

        if (paymentMethod === "cod") {
            const response = await api.post("/orders", payload);
            if (response.data.success) {
                const { useCartStore } = await import("@/store/useCartStore");
                useCartStore.getState().clearCart();
                router.push(`/order-success?id=${response.data.order._id}`);
            } else {
                setError("Failed to create COD order");
            }
        } else {
            const response = await api.post("/payment/phonepe/initiate", payload);
            
            if (response.data.success && response.data.redirectUrl) {
                // Redirect user to PhonePe Pay Page
                window.location.href = response.data.redirectUrl;
            } else {
                setError(response.data.message || "Failed to initiate payment engine");
            }
        }
    } catch (err: any) {
        console.error("Payment Error:", err);
        setError(err.response?.data?.message || "Failed to initiate payment.");
    } finally {
        setLoading(false);
    }
  };

  if (!_authHydrated || !_cartHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-myntra-pink animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
         <h1 className="text-2xl font-bold text-myntra-dark">Bag is empty.</h1>
         <Link href="/" className="text-myntra-pink mt-4 inline-block font-bold hover:underline">Go back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center space-x-4 mb-8 text-[12px] uppercase font-bold tracking-widest text-myntra-dark">
          <span className={step >= 1 ? "text-myntra-pink" : "text-gray-400"}>BAG</span>
          <span className="text-gray-300">---------</span>
          <span className={step >= 1 ? "text-myntra-pink" : "text-gray-400"}>ADDRESS</span>
          <span className="text-gray-300">---------</span>
          <span className={step >= 2 ? "text-myntra-pink" : "text-gray-400"}>PAYMENT</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        <div className="lg:col-span-2 flex-grow space-y-8">
            
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">
                    {error}
                </div>
            )}

            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-[18px] font-bold text-myntra-dark border-b border-gray-100 pb-4">SELECT DELIVERY ADDRESS</h2>
                    
                    {fetchingAddresses ? (
                      <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-myntra-pink animate-spin" /></div>
                    ) : (
                      <div className="space-y-4">
                        {savedAddresses.map((addr, idx) => (
                           <div 
                             key={idx} 
                             onClick={() => { setSelectedAddressIndex(idx); setIsAddingNew(false); }}
                             className={`border rounded-lg p-5 cursor-pointer transition-all relative ${selectedAddressIndex === idx && !isAddingNew ? 'border-myntra-pink bg-pink-50/20' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                           >
                              {selectedAddressIndex === idx && !isAddingNew && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-myntra-pink" />}
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-bold text-[14px] text-myntra-dark">{addr.fullName}</span>
                                {addr.isDefault && <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">Default</span>}
                              </div>
                              <p className="text-[13px] text-gray-600 font-medium leading-relaxed max-w-sm">
                                {addr.street}, {addr.state && `${addr.state}, `} {addr.city}, {addr.country} - <span className="font-bold text-myntra-dark">{addr.zip}</span>
                              </p>
                              <p className="text-[13px] font-bold text-gray-500 mt-2">Mobile: <span className="text-myntra-dark">{addr.phone}</span></p>
                           </div>
                        ))}

                        {!isAddingNew && (
                           <button 
                             onClick={() => { setIsAddingNew(true); setSelectedAddressIndex(null); }}
                             className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 flex items-center justify-center space-x-2 text-myntra-pink font-bold hover:bg-gray-50 transition-colors"
                           >
                              <Plus className="h-5 w-5" />
                              <span>Add New Address</span>
                           </button>
                        )}
                      </div>
                    )}

                    {isAddingNew && !fetchingAddresses && (
                       <form onSubmit={handleAddressSubmit} className="space-y-6 mt-6 border border-gray-200 rounded-lg p-6 bg-white shadow-sm relative">
                          {savedAddresses.length > 0 && (
                            <button type="button" onClick={() => { setIsAddingNew(false); setSelectedAddressIndex(savedAddresses.length > 0 ? 0 : null); }} className="absolute top-4 right-4 text-[12px] font-bold text-gray-400 hover:text-myntra-dark">Cancel</button>
                          )}
                          <h3 className="text-[14px] font-bold text-myntra-dark uppercase tracking-wide">Contact Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input type="text" name="fullName" required value={newAddress.fullName} onChange={handleAddressChange} placeholder="Name" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                              <input type="text" name="phone" required value={newAddress.phone} onChange={handleAddressChange} placeholder="Mobile No." className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                          </div>

                          <h3 className="text-[14px] font-bold text-myntra-dark uppercase tracking-wide pt-2">Address</h3>
                          <div className="space-y-4">
                              <input type="text" name="postalCode" required value={newAddress.postalCode} onChange={handleAddressChange} placeholder="Pin Code" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                              <input type="text" name="address" required value={newAddress.address} onChange={handleAddressChange} placeholder="Address (House No, Building, Street, Area)" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                              <div className="grid grid-cols-2 gap-4">
                                  <input type="text" name="locality" required value={newAddress.locality} onChange={handleAddressChange} placeholder="Locality / Town" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                                  <input type="text" name="city" required value={newAddress.city} onChange={handleAddressChange} placeholder="City / District" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                              </div>
                          </div>
                          
                          <div className="pt-2">
                              <button 
                                  type="submit"
                                  disabled={loading}
                                  className="w-full myntra-pink-btn text-white py-4 font-bold text-[14px] rounded-md shadow-sm uppercase tracking-wide flex items-center justify-center space-x-2 disabled:opacity-70"
                              >
                                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                  <span>Save Address & Continue</span>
                              </button>
                          </div>
                       </form>
                    )}

                    {!isAddingNew && !fetchingAddresses && savedAddresses.length > 0 && (
                      <button 
                          onClick={handleAddressSubmit}
                          className="w-full myntra-pink-btn text-white py-4 font-bold text-[14px] rounded-md shadow-sm uppercase tracking-wide mt-4"
                      >
                          Deliver Here
                      </button>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-[18px] font-bold text-myntra-dark">CHOOSE PAYMENT MODE</h2>
                    
                    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                        <label className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition-all ${paymentMethod === 'phonepe' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center space-x-4">
                                <input type="radio" checked={paymentMethod === 'phonepe'} onChange={() => setPaymentMethod('phonepe')} className="accent-myntra-pink h-4 w-4" />
                                <div className="flex flex-col">
                                   <span className="font-bold text-[14px] text-myntra-dark">PhonePe (UPI, Cards, Wallets)</span>
                                   <span className="text-[12px] text-gray-500">Fast and Secure</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-myntra-pink bg-pink-50 px-2 py-1 rounded-sm">POPULAR</span>
                        </label>
                        
                        <label className={`flex items-center justify-between p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center space-x-4">
                                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-myntra-pink h-4 w-4" />
                                <div className="flex flex-col">
                                   <span className="font-bold text-[14px] text-myntra-dark">Cash on Delivery (Cash/UPI)</span>
                                </div>
                            </div>
                            <Truck className="h-5 w-5 text-gray-400" />
                        </label>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={handlePayNow}
                            disabled={loading}
                            className="w-full myntra-pink-btn text-white py-4 font-bold text-[14px] rounded-md shadow-sm uppercase tracking-wide flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                            <span>{loading ? "Redirecting..." : "Pay Now"}</span>
                        </button>
                        <button onClick={() => setStep(1)} className="w-full mt-4 text-[14px] font-bold text-gray-500 hover:text-myntra-dark">Go back</button>
                    </div>
                </div>
            )}
        </div>

        {/* Dynamic Price Calculations */}
        {(() => {
          const subtotal = totalPrice();
          const shippingFee = settings ? (subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee) : 0;
          const codFee = paymentMethod === 'cod' && settings ? settings.codCharges : 0;
          const finalTotal = subtotal + shippingFee + codFee;

          return (
            <div className="lg:w-80 shrink-0 h-fit space-y-4 lg:sticky lg:top-24 border-l border-gray-200 pl-0 lg:pl-6">
                <h3 className="font-bold text-[14px] text-gray-500 uppercase tracking-wide mb-4">Price Details ({items.length} Items)</h3>
                
                <div className="space-y-3 text-[14px] text-myntra-dark pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span>₹{totalMRP()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount on MRP</span>
                    <span className="text-[#03a685] font-medium">-₹{totalDiscount()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>
                      Shipping Fee 
                      {shippingFee === 0 && <span className="text-[10px] text-myntra-pink font-bold uppercase tracking-tighter ml-1">Free</span>}
                    </span>
                    <span className={shippingFee === 0 ? "text-[#03a685] font-medium" : "font-bold"}>
                      {shippingFee === 0 ? "₹0" : `₹${shippingFee}`}
                    </span>
                  </div>

                  {paymentMethod === 'cod' && codFee > 0 && (
                     <div className="flex justify-between animate-in fade-in duration-300">
                        <span>COD Service Charge</span>
                        <span className="font-bold text-amber-600">₹{codFee}</span>
                     </div>
                  )}

                  {appliedCoupon && (
                     <div className="flex justify-between animate-in fade-in duration-300 text-[#03a685] font-bold">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span>-₹{appliedCoupon.discountAmount}</span>
                     </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-center text-[16px] font-bold text-myntra-dark border-b border-gray-200 pb-4">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
                
                <div className="pt-4 flex items-center space-x-3 text-gray-400">
                    <ShieldCheck className="h-8 w-8" />
                    <p className="text-[12px] font-bold tracking-wide leading-tight">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
                </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
