"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Ticket, CheckCircle2, Loader2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalMRP, totalDiscount, appliedCoupon, applyCouponCode, removeCouponCode } = useCartStore();
  
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await api.get("/coupons/active");
      if (res.data.success) {
        setActiveCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleApply = async (code: string) => {
    try {
      setApplyingCode(code);
      setCouponError(null);
      const res = await api.post("/coupons/apply", {
        code,
        orderValue: totalPrice()
      });
      if (res.data.success) {
        applyCouponCode({
          code: res.data.coupon.code,
          discountAmount: res.data.discount
        });
        setShowCoupons(false);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Cannot apply this coupon");
    } finally {
      setApplyingCode(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="flex justify-center">
          <ShoppingBag className="h-24 w-24 text-gray-200" />
        </div>
        <h1 className="text-2xl font-bold text-myntra-dark">Hey, it feels so light!</h1>
        <p className="text-myntra-gray max-w-sm mx-auto text-[14px]">There is nothing in your bag. Let's add some items.</p>
        <Link href="/" className="inline-block myntra-pink-btn px-12 py-4 rounded-xl shadow-md mt-4">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 
        In Myntra, the checkout header has:
        Bag -------- Address -------- Payment
      */}
      <div className="flex items-center justify-center space-x-4 mb-8 text-[12px] uppercase font-bold tracking-widest text-myntra-dark">
        <span className="text-myntra-pink">BAG</span>
        <span className="text-gray-300">---------</span>
        <span className="text-gray-400">ADDRESS</span>
        <span className="text-gray-300">---------</span>
        <span className="text-gray-400">PAYMENT</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="md:col-span-2 space-y-4">
          {!appliedCoupon ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-4 mb-4">
              <div className="flex justify-between items-center text-[14px] font-bold text-myntra-dark">
                <div className="flex items-center space-x-2">
                   <Ticket className="h-5 w-5 text-myntra-dark" />
                   <span>Apply Coupons</span>
                </div>
                <button onClick={() => setShowCoupons(!showCoupons)} className="text-myntra-pink border border-myntra-pink px-4 py-1.5 rounded uppercase text-xs hover:bg-pink-50 transition">
                  {showCoupons ? 'Close' : 'View All'}
                </button>
              </div>

              {showCoupons && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                   {loadingCoupons ? (
                      <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-myntra-pink" /></div>
                   ) : activeCoupons.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">No coupons available right now.</p>
                   ) : (
                      <>
                        {couponError && <div className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded mb-2">{couponError}</div>}
                        {activeCoupons.map(coupon => (
                           <div key={coupon.code} className="border border-dashed border-gray-300 bg-gray-50 rounded-lg p-3 flex justify-between items-center hover:border-myntra-pink transition-colors">
                              <div>
                                 <p className="font-black text-myntra-dark tracking-widest uppercase">{coupon.code}</p>
                                 <p className="text-[11px] text-gray-500 mt-0.5">
                                   {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `Flat ₹${coupon.discountAmount} OFF`} 
                                   <span className="font-bold ml-1">On minimum order of ₹{coupon.minPurchase}</span>
                                 </p>
                              </div>
                              <button 
                                onClick={() => handleApply(coupon.code)}
                                disabled={applyingCode === coupon.code || totalPrice() < coupon.minPurchase}
                                className="text-myntra-pink font-bold text-sm uppercase px-3 py-1 disabled:opacity-30 flex items-center"
                              >
                                {applyingCode === coupon.code ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                              </button>
                           </div>
                        ))}
                      </>
                   )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 flex justify-between items-center">
               <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 tracking-wide uppercase">{appliedCoupon.code}</h4>
                    <p className="text-xs font-bold text-emerald-600">Savings: ₹{appliedCoupon.discountAmount}</p>
                  </div>
               </div>
               <button onClick={removeCouponCode} className="text-xs font-bold text-gray-500 hover:text-red-500 uppercase flex items-center">
                 <X className="h-3 w-3 mr-0.5" /> Remove
               </button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-myntra-dark">{items.length} ITEMS</h2>
            </div>
            {items.map((item) => (
              <div key={`${item._id}-${item.color}`} className="flex space-x-6 border-b border-gray-100 py-6 last:border-0 last:pb-0 relative group">
                <Link href={`/product/${item.slug}`} className="relative h-[160px] w-[120px] bg-myntra-light-gray flex items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-sm hover:opacity-90 transition-opacity">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-black uppercase">no image</span>
                  )}
                </Link>

                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <Link href={`/product/${item.slug}`} className="font-bold text-[16px] text-myntra-dark hover:text-myntra-pink transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <button 
                        onClick={() => removeItem(item._id, item.color)} 
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <p className="text-[11px] text-gray-400 font-bold bg-gray-50 w-fit px-2 py-1 rounded-md uppercase tracking-tighter">
                      Color: {item.color || 'Standard'}
                    </p>

                    <div className="flex items-center space-x-3 mt-4 self-end">
                      <span className="font-black text-[18px] text-myntra-dark whitespace-nowrap">₹{item.price * item.quantity}</span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[14px] text-gray-400 line-through decoration-myntra-pink/50">MRP ₹{item.mrp * item.quantity}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-4">
                     <div className="flex items-center border-2 border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1), item.color)} 
                          className="p-2 px-3 text-gray-400 hover:text-myntra-pink hover:bg-pink-50 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-4 text-[14px] font-black text-myntra-dark border-x border-gray-100">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1, item.color)} 
                          className="p-2 px-3 text-gray-400 hover:text-myntra-pink hover:bg-pink-50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/" className="inline-flex items-center space-x-2 text-[14px] font-bold text-myntra-pink hover:underline pt-4 pl-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Right */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-bold text-[14px] text-gray-500 uppercase tracking-wide mb-4">Price Details ({items.length} Items)</h4>

            <div className="space-y-3 text-[14px] text-myntra-dark pb-4 border-b border-gray-200">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹{totalMRP()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount on MRP</span>
                <span className="text-[#03a685] font-medium">-₹{totalDiscount()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between animate-in fade-in text-[#03a685] font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between items-center text-[16px] font-bold text-myntra-dark">
              <span>Total Amount</span>
              <span>₹{Math.max(0, totalPrice() - (appliedCoupon?.discountAmount || 0))}</span>
            </div>

            <Link href="/checkout" className="block w-full text-center mt-6 myntra-pink-btn py-4 rounded-xl uppercase text-[14px]">
              Place Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
