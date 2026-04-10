"use client";

import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, X, Loader2, RefreshCcw, AlertCircle, DollarSign, MessageSquare } from "lucide-react";
import api from "@/lib/axios";

export default function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/returns?status=${statusFilter}`);
      if (res.data.success) setReturns(res.data.returns);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, adminComment?: string, refundAmount?: number) => {
    try {
      const res = await api.put(`/returns/${id}/status`, { status, adminComment, refundAmount });
      if (res.data.success) {
        fetchReturns();
        if (selectedReturn?._id === id) {
          setSelectedReturn(res.data.returnRequest);
        }
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  const filteredReturns = returns.filter(r => 
    r._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.order?._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'refunded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      case 'received': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Return Requests</h1>
          <p className="text-gray-500 text-sm">Manage product returns and customer refunds</p>
        </div>
        <div className="flex space-x-4">
           <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2">
              <RefreshCcw className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-myntra-dark uppercase">Pending: {returns.filter(r => r.status === 'pending').length}</span>
           </div>
           <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-myntra-dark uppercase">Refunded: ₹{returns.filter(r => r.status === 'refunded').reduce((acc, r) => acc + r.refundAmount, 0).toLocaleString()}</span>
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 gap-4">
           <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Return ID, Order ID or Customer..." 
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
               <option value="All">All Requests</option>
               <option value="pending">Pending</option>
               <option value="approved">Approved</option>
               <option value="received">Received</option>
               <option value="refunded">Refunded</option>
               <option value="rejected">Rejected</option>
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
                  <th className="px-6 py-4">Return Details</th>
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReturns.map((ret) => (
                  <tr key={ret._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">#RET-{ret._id.slice(-6).toUpperCase()}</p>
                       <p className="text-[11px] text-gray-400 font-bold uppercase">
                          Requested on {new Date(ret.createdAt).toLocaleDateString()}
                       </p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">#{ret.order?._id.slice(-8).toUpperCase()}</p>
                       <p className="text-[11px] text-gray-400">Order Date: {new Date(ret.order?.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">{ret.user?.name || "Guest"}</p>
                       <p className="text-[11px] text-gray-400">{ret.user?.phone || ret.user?.email || "No contact"}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase ${getStatusColor(ret.status)}`}>
                          {ret.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => setSelectedReturn(ret)}
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

      {/* Return Details Drawer Overlay */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
           <div className="bg-white h-screen w-full max-w-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <div>
                    <h2 className="text-xl font-bold text-myntra-dark">Return Request Summary</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">ID: #RET-{selectedReturn._id.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setSelectedReturn(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                 {/* Admin Actions */}
                 <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Admin Action</h3>
                    
                    {selectedReturn.status === 'pending' ? (
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => handleUpdateStatus(selectedReturn._id, 'approved')}
                            className="flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                          >
                             <CheckCircle className="h-5 w-5" />
                             <span>Approve Return</span>
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(selectedReturn._id, 'rejected')}
                            className="flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-sm bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 transition-all"
                          >
                             <X className="h-5 w-5" />
                             <span>Reject Return</span>
                          </button>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                             <div className="flex items-center space-x-3">
                                <AlertCircle className="h-5 w-5 text-myntra-pink" />
                                <span className="text-sm font-bold text-myntra-dark">Current Status:</span>
                             </div>
                             <select 
                               value={selectedReturn.status}
                               onChange={(e) => handleUpdateStatus(selectedReturn._id, e.target.value)}
                               className="text-sm font-bold text-myntra-pink uppercase outline-none bg-transparent cursor-pointer"
                             >
                                <option value="approved">Approved</option>
                                <option value="received">Received</option>
                                <option value="refunded">Refunded</option>
                                <option value="rejected">Rejected</option>
                             </select>
                          </div>
                          
                          {selectedReturn.status === 'received' && (
                            <button 
                              onClick={() => {
                                 const amount = prompt("Enter Refund Amount (₹):", selectedReturn.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toString());
                                 if(amount) handleUpdateStatus(selectedReturn._id, 'refunded', undefined, parseFloat(amount));
                              }}
                              className="w-full flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md"
                            >
                               <DollarSign className="h-5 w-5" />
                               <span>Process Full Refund</span>
                            </button>
                          )}
                       </div>
                    )}
                 </div>

                 {/* Returned Items */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Items to Return</h3>
                    <div className="space-y-4">
                       {selectedReturn.items?.map((item: any, idx: number) => (
                         <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-center space-x-4">
                               <div className="h-16 w-16 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {item.product?.images?.[0]?.url ? (
                                    <img src={item.product.images[0].url} alt={item.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <RefreshCcw className="h-6 w-6 text-gray-400 animate-spin-slow" />
                                  )}
                               </div>
                               <div className="flex-grow">
                                  <div className="flex justify-between">
                                     <p className="text-sm font-bold text-myntra-dark leading-tight">{item.name}</p>
                                     <p className="text-sm font-bold text-myntra-dark">₹{item.price * item.quantity}</p>
                                  </div>
                                  <p className="text-[10px] font-mono text-gray-400 uppercase mt-1">Slug: {item.product?.slug || 'deleted-product'}</p>
                                  <p className="text-[11px] font-bold text-gray-500 mt-1">Qty to Return: {item.quantity}</p>
                               </div>
                            </div>
                            <div className="flex items-start space-x-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                               <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5" />
                               <div>
                                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Reason for Return</p>
                                  <p className="text-xs text-amber-800 leading-relaxed font-medium mt-0.5">{item.reason}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Financial Summary */}
                 <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                       <span>Estimated Refund</span>
                       <span>₹{selectedReturn.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0).toLocaleString()}</span>
                    </div>
                    {selectedReturn.status === 'refunded' && (
                       <div className="flex justify-between text-lg font-bold text-emerald-600 pt-3 border-t border-gray-200">
                          <span>Actual Refunded</span>
                          <span>- ₹{selectedReturn.refundAmount?.toLocaleString()}</span>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
