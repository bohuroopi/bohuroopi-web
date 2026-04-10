"use client";

import { ShoppingBag, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight, Clock, ExternalLink, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stats = [
  { name: "Total Revenue", value: "₹4,25,900", icon: DollarSign, change: "+12.5%", color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Total Orders", value: "852", icon: ShoppingBag, change: "+8.2%", color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Total Users", value: "1,240", icon: Users, change: "+5.1%", color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Inventory Items", value: "156", icon: Package, change: "-2.4%", color: "text-orange-500", bg: "bg-orange-50" },
];

const recentOrders = [
  { id: "#ORD-1234", customer: "Amrita Singh", date: "29 Mar, 2026", amount: "₹2,499", status: "Delivered" },
  { id: "#ORD-1235", customer: "Rajesh Kumar", date: "29 Mar, 2026", amount: "₹4,899", status: "Processing" },
  { id: "#ORD-1236", customer: "Saira Banu", date: "28 Mar, 2026", amount: "₹1,299", status: "Shipped" },
  { id: "#ORD-1237", customer: "Priya Sharma", date: "28 Mar, 2026", amount: "₹3,450", status: "Pending" },
  { id: "#ORD-1238", customer: "Karan Johar", date: "27 Mar, 2026", amount: "₹8,900", status: "Cancelled" },
];

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <div className="space-y-10 font-sans">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
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
                  {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase transition-transform">vs last month</span>
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
               <Link href="/orders" className="text-[11px] uppercase font-bold text-myntra-pink hover:text-myntra-dark transition-colors flex items-center">
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
                     {recentOrders.map((order) => (
                       <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                          <td className="py-5 font-bold text-myntra-dark group-hover:text-myntra-pink transition-colors">{order.id}</td>
                          <td className="py-5 text-gray-600">{order.customer}</td>
                          <td className="py-5 text-gray-500 text-[13px]">{order.date}</td>
                          <td className="py-5 text-myntra-dark font-bold">{order.amount}</td>
                          <td className="py-5">
                             <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                               order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                               order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                               order.status === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                               order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                             }`}>
                                {order.status}
                             </span>
                          </td>
                       </tr>
                     ))}
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
                  <span className="text-[11px] font-bold">ADD PRODUCT</span>
               </button>
               <button 
                onClick={() => router.push("/categories")}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-myntra-pink hover:border-myntra-pink hover:text-white transition-all group shadow-sm"
               >
                  <Tag className="h-6 w-6 mb-2 text-myntra-pink group-hover:text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold">ADD COUPON</span>
               </button>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-gray-200">
               <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Store Performance</h4>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[11px] font-bold uppercase">
                        <span className="text-gray-600">Checkout Conversion</span>
                        <span className="text-myntra-pink">4.2%</span>
                     </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-myntra-pink rounded-full" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[11px] font-bold uppercase">
                        <span className="text-gray-600">Cart Abandonment</span>
                        <span className="text-orange-500">12%</span>
                     </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-[25%] bg-orange-400 rounded-full" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
