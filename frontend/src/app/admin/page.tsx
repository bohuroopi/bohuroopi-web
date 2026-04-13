"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight, Clock, ExternalLink, Tag, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function AdminDashboard() {
   const router = useRouter();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            setLoading(true);
            const res = await api.get("/dashboard/stats");
            if (res.data.success) {
               setData(res.data);
            }
         } catch (err: any) {
            console.error("Dashboard Stats Error:", err);
            setError("Failed to fetch dashboard data. Please check your connection.");
         } finally {
            setLoading(false);
         }
      };
      fetchStats();
   }, []);

   if (loading) {
      return (
         <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Loading Store Insights...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center space-y-4">
               <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
               <h3 className="text-lg font-bold text-red-700">Analytics Error</h3>
               <p className="text-sm text-red-600">{error}</p>
               <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-widest hover:bg-red-700 transition-colors"
               >
                  Retry Fetch
               </button>
            </div>
         </div>
      );
   }

   const { stats, recentOrders } = data;

   const statCards = [
      { name: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
      { name: "Total Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
      { name: "Total Users", value: stats.totalCustomers.toLocaleString(), icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
      { name: "Inventory Items", value: stats.inventoryCount.toLocaleString(), icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
   ];

   const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
         case 'delivered': return 'bg-emerald-50 text-emerald-600';
         case 'processing': return 'bg-blue-50 text-blue-600';
         case 'shipped': return 'bg-purple-50 text-purple-600';
         case 'cancelled': return 'bg-red-50 text-red-600';
         case 'cancel_requested': return 'bg-orange-50 text-orange-600';
         default: return 'bg-gray-50 text-gray-600';
      }
   };

   return (
      <div className="space-y-10 font-sans">
         {/* Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => (
               <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
               >
                  <div className="space-y-1">
                     <p className="text-[11px] uppercase font-bold tracking-wider text-gray-500">{stat.name}</p>
                     <h3 className="text-2xl font-bold text-myntra-dark">{stat.value}</h3>
                     <div className="flex items-center space-x-1">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500">Live</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-tighter">Real-time update</span>
                     </div>
                  </div>
                  <div className={`p-4 rounded-full ${stat.bg}`}>
                     <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Main Content Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Table */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8 space-y-6 shadow-sm">
               <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-myntra-dark uppercase">Recent Orders</h3>
                  <Link href="/admin/orders" className="text-[11px] uppercase font-bold text-myntra-pink hover:text-myntra-dark transition-colors flex items-center">
                     View All Orders <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                        <tr>
                           <th className="py-4 font-bold">Order ID</th>
                           <th className="py-4 font-bold">Customer</th>
                           <th className="py-4 font-bold">Date</th>
                           <th className="py-4 font-bold">Amount</th>
                           <th className="py-4 font-bold">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                           <tr
                              key={order.id}
                              onClick={() => router.push(`/admin/orders`)}
                              className="hover:bg-gray-50 transition-colors cursor-pointer group"
                           >
                              <td className="py-5 font-bold text-myntra-dark group-hover:text-myntra-pink transition-colors truncate max-w-[120px]">
                                 #{order.id.slice(-6).toUpperCase()}
                              </td>
                              <td className="py-5 text-gray-600 font-medium">{order.customer}</td>
                              <td className="py-5 text-gray-500 text-[13px]">
                                 {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-5 text-myntra-dark font-bold">₹{order.amount.toLocaleString('en-IN')}</td>
                              <td className="py-5">
                                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                 </span>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={5} className="py-10 text-center text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                                 No orders found in database
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* System Activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8 shadow-sm">
               <h3 className="text-lg font-bold text-myntra-dark uppercase">Quick Actions</h3>
               <div className="grid grid-cols-2 gap-4">
                  <button
                     onClick={() => router.push("/products")}
                     className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-myntra-pink hover:border-myntra-pink hover:text-white transition-all group shadow-sm"
                  >
                     <Package className="h-6 w-6 mb-2 text-myntra-pink group-hover:text-white group-hover:scale-110 transition-transform" />
                     <span className="text-[11px] font-bold">PRODUCTS</span>
                  </button>
                  <button
                     onClick={() => router.push("/coupons")}
                     className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-myntra-pink hover:border-myntra-pink hover:text-white transition-all group shadow-sm"
                  >
                     <Tag className="h-6 w-6 mb-2 text-myntra-pink group-hover:text-white group-hover:scale-110 transition-transform" />
                     <span className="text-[11px] font-bold">COUPONS</span>
                  </button>
               </div>

               <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">System Information</h4>
                  <div className="space-y-4">
                     <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Server Status</p>
                        <div className="flex items-center space-x-2">
                           <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                           <p className="text-[12px] font-bold text-myntra-dark">API Node v2.4.0 <span className="text-emerald-600 tracking-tighter ml-1">Healthy</span></p>
                        </div>
                     </div>
                     <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
                        <p className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1">Database</p>
                        <div className="flex items-center space-x-2">
                           <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                           <p className="text-[12px] font-bold text-myntra-dark">Atlas Cluster <span className="text-emerald-600 tracking-tighter ml-1">Connected</span></p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

