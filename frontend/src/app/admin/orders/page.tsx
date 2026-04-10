"use client";

import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, Truck, Package, X, Loader2, Clock, DollarSign } from "lucide-react";
import api from "@/lib/axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders?status=${statusFilter}`);
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/orders/${id}/status`, { status });
      if (res.data.success) {
        fetchOrders();
        if (selectedOrder?._id === id) {
          setSelectedOrder(res.data.order);
        }
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  const handlePushToShiprocket = async (id: string) => {
    try {
      setShippingLoading(true);
      const res = await api.post(`/orders/${id}/shiprocket`);
      if (res.data.success) {
        alert("Order successfully pushed to Shiprocket!");
        fetchOrders();
        // Update local selectedOrder if it's the one we just shipped
        if (selectedOrder?._id === id) {
          const updatedRes = await api.get(`/orders`);
          const updatedOrder = updatedRes.data.orders.find((o: any) => o._id === id);
          if (updatedOrder) setSelectedOrder(updatedOrder);
        }
      }
    } catch (err: any) {
      console.error("Shiprocket Error:", err);
      alert(err.response?.data?.message || "Failed to push to Shiprocket");
    } finally {
      setShippingLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'delivered': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Orders</h1>
          <p className="text-gray-500 text-sm">Monitor and fulfill your store's sales</p>
        </div>
        <div className="flex space-x-4">
           <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-myntra-dark uppercase">Pending: {orders.filter(o => o.status === 'pending').length}</span>
           </div>
           <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-myntra-dark uppercase">Total: ₹{orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()}</span>
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 gap-4">
           <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search order ID or customer..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm transition-all focus:border-myntra-pink outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Status:</label>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="border border-gray-200 rounded-lg text-sm px-4 py-2 outline-none focus:border-myntra-pink bg-white text-myntra-dark font-medium cursor-pointer shadow-sm"
             >
               <option value="All">All Orders</option>
               <option value="pending">Pending</option>
               <option value="processing">Processing</option>
               <option value="shipped">Shipped</option>
               <option value="delivered">Delivered</option>
               <option value="cancelled">Cancelled</option>
             </select>
           </div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">#{order._id.slice(-8).toUpperCase()}</p>
                       <p className="text-[11px] text-gray-400 uppercase font-bold">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">{order.user?.name || "Guest"}</p>
                       <p className="text-[11px] text-gray-400">{order.user?.phone || order.user?.email || '—'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-myntra-dark">
                       ₹{order.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => setSelectedOrder(order)}
                         className="p-2 text-myntra-pink hover:bg-pink-50 rounded-lg transition-all"
                       >
                          <Eye className="h-5 w-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
           <div className="bg-white h-screen w-full max-w-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <div>
                    <h2 className="text-xl font-bold text-myntra-dark">Order Summary</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">ID: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                 </div>
                 <div className="flex items-center space-x-2">
                    {selectedOrder.shiprocketOrderId && (
                      <div className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                        <Truck className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase">SR: {selectedOrder.shiprocketOrderId}</span>
                      </div>
                    )}
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                      <X className="h-5 w-5" />
                    </button>
                 </div>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-10">
                 {/* Quick Actions */}
                 <div className="space-y-4">
                     {/* Shiprocket Action */}
                     {!selectedOrder.shiprocketOrderId && selectedOrder.status !== 'cancelled' ? (
                       <button 
                         disabled={shippingLoading}
                         onClick={() => handlePushToShiprocket(selectedOrder._id)}
                         className="w-full flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                       >
                          {shippingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Truck className="h-5 w-5" />}
                          <span>Push to Shiprocket</span>
                       </button>
                     ) : selectedOrder.shiprocketOrderId ? (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                           <div className="flex items-center space-x-3 text-blue-700">
                              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Truck className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight">Shiprocket Integrated</p>
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">ID: {selectedOrder.shiprocketOrderId}</p>
                              </div>
                           </div>
                           <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Track Order</button>
                        </div>
                     ) : null}

                     {/* Status Update Actions */}
                     {selectedOrder.status === 'pending' ? (
                       <button 
                         onClick={() => handleUpdateStatus(selectedOrder._id, 'processing')}
                         className="w-full flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-sm bg-myntra-dark text-white hover:bg-black transition-all shadow-md"
                       >
                          <CheckCircle className="h-5 w-5" />
                          <span>Confirm Order</span>
                       </button>
                     ) : (
                       <div className="flex items-center space-x-4">
                          <select
                            value={selectedOrder.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                            className={`flex-grow p-4 rounded-xl font-bold text-sm border-2 outline-none cursor-pointer bg-white transition-all ${
                              selectedOrder.status === 'cancelled' 
                              ? 'border-red-200 text-red-600 cursor-not-allowed bg-red-50' 
                              : 'border-gray-200 text-myntra-dark hover:border-gray-300 focus:border-myntra-dark'
                            }`}
                            disabled={selectedOrder.status === 'cancelled'}
                          >
                            <option value="pending" disabled>Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled" disabled={selectedOrder.status !== 'cancelled'}>Cancelled</option>
                          </select>
                          
                          {selectedOrder.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                              className="flex-shrink-0 flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-sm border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                               <X className="h-5 w-5 relative top-[-1px]" />
                               <span>Cancel Order</span>
                            </button>
                          )}
                       </div>
                     )}
                  </div>

                 {/* Order Items */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Order Items</h3>
                    <div className="space-y-4">
                       {selectedOrder.orderItems?.map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                               <div className="h-14 w-14 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="h-6 w-6 text-gray-400" />
                                  )}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-myntra-dark leading-tight">{item.name}</p>
                                  <p className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                                    Slug: {item.product?.slug || 'deleted-product'}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                               </div>
                            </div>
                            <p className="text-sm font-bold text-myntra-dark">₹{item.quantity * item.price}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Shipping & User Details */}
                 <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Customer</h3>
                        <p className="text-sm font-bold text-myntra-dark mb-0.5">{selectedOrder.user?.name}</p>
                        {selectedOrder.user?._id && (
                           <p className="text-[10px] font-mono text-gray-400 uppercase mb-1">
                             ID: #{selectedOrder.user._id.slice(-8).toUpperCase()}
                           </p>
                        )}
                        <p className="text-[12px] text-gray-600">{selectedOrder.user?.email}</p>
                     </div>
                    <div className="space-y-2">
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Shipping to</h3>
                       <p className="text-sm font-bold text-myntra-dark">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || "Guest User"}</p>
                       {selectedOrder.shippingAddress?.phone && (
                         <p className="text-[11px] font-bold text-myntra-pink">📞 {selectedOrder.shippingAddress.phone}</p>
                       )}
                       <p className="text-[12px] leading-relaxed text-gray-600 pt-1">
                          {selectedOrder.shippingAddress?.address},<br />
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode},<br />
                          {selectedOrder.shippingAddress?.country}
                       </p>
                    </div>
                 </div>

                 {/* Totals */}
                 <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                       <span>Subtotal</span>
                       <span>₹{selectedOrder.orderItems?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0).toLocaleString()}</span>
                    </div>
                    {selectedOrder.discountPrice > 0 && (
                      <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase">
                         <span>Discount</span>
                         <span>-₹{selectedOrder.discountPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                       <span>Shipping</span>
                       <span>₹{(selectedOrder.shippingPrice || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase pt-2 border-t border-gray-100">
                       <span>Payment Mode</span>
                       <span className="text-myntra-dark">{selectedOrder.paymentMethod || 'Not Specified'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-myntra-dark pt-3 border-t border-gray-200">
                       <span>Total Amount</span>
                       <span>₹{selectedOrder.totalPrice.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

