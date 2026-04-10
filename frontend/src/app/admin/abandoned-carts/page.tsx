"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, Mail, MessageCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/marketing/abandoned-carts");
      if (res.data.success) setCarts(res.data.abandonedCarts);
    } catch (err) {
      console.error("Fetch Abandoned Carts Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (userId: string) => {
    try {
      setRecoveringId(userId);
      const res = await api.post("/marketing/abandoned-carts/recover", { userId });
      if (res.data.success) {
        alert("Recovery message triggered successfully!");
      }
    } catch (err: any) {
      console.error("Recover Cart Error:", err);
      alert(err.response?.data?.message || "Failed to trigger recovery");
    } finally {
      setRecoveringId(null);
    }
  };

  const getCartTotal = (cart: any[]) => {
    return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Abandoned Carts</h1>
          <p className="text-gray-500 text-sm">Recover lost sales by reaching out to users who left items behind</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
           <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by email or phone..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-myntra-pink"
              />
           </div>
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-myntra-pink" /></div>
        ) : carts.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-16 text-center text-gray-400">
             <ShoppingBag className="h-12 w-12 text-gray-200 mb-4" />
             <p className="text-lg font-bold text-gray-400/80">No abandoned carts right now.</p>
             <p className="text-sm">We'll list users here if they add items to their cart without checking out.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Cart Status</th>
                  <th className="px-6 py-4">Time Elapsed</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carts.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold">
                             {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-myntra-dark text-sm">{user.name || "Anonymous User"}</p>
                            <p className="text-[11px] text-gray-500">{user.email || user.phone}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">₹{getCartTotal(user.cart)}</p>
                       <p className="text-[11px] text-gray-500">{user.cart.length} item(s) left behind</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center text-amber-600 font-medium text-xs">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          <span>Last active: {new Date(user.updatedAt).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                       <button 
                         onClick={() => handleRecover(user._id)}
                         disabled={recoveringId === user._id || (!user.email && !user.phone)}
                         className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-xs flex items-center shadow-sm disabled:opacity-50 transition-all"
                       >
                         {recoveringId === user._id ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (<>
                           {user.email ? <Mail className="h-3.5 w-3.5 mr-1.5" /> : <MessageCircle className="h-3.5 w-3.5 mr-1.5" />}
                           Send Reminder
                         </>)}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
