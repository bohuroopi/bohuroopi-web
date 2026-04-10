"use client";

import { useState, useEffect } from "react";
import {
  Search, User, Mail, Phone, Calendar, Loader2, ShoppingBag, Eye, X, Package,
  Trash2, Bell, ShieldCheck, Clock, MapPin, CreditCard, Hash, ChevronRight
} from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  cart: { product: any; qty: number; addedAt?: string }[];
  addresses: { street: string; city: string; state: string; zip: string; country: string; isDefault: boolean }[];
}

interface Order {
  _id: string;
  orderItems: { name: string; quantity: number; price: number; image: string }[];
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  shippingAddress: { address: string; city: string; postalCode: string };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600 border-yellow-100",
  processing: "bg-blue-50 text-blue-600 border-blue-100",
  shipped: "bg-purple-50 text-purple-600 border-purple-100",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
  cancelled: "bg-red-50 text-red-500 border-red-100",
};

function fmt(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(date?: string) {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ user: Customer; orders: Order[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cart" | "orders" | "addresses">("overview");
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: "", message: "" });
  const [notifySending, setNotifySending] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      if (res.data.success) setCustomers(res.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setActiveTab("overview");
    setDetailLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      if (res.data.success) setDetail(res.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer and all their data?")) return;
    try {
      await api.delete(`/users/${id}`);
      setSelectedId(null);
      setDetail(null);
      fetchCustomers();
    } catch (err) { console.error(err); }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setNotifySending(true);
    try {
      await api.post(`/users/${selectedId}/notify`, notifyForm);
      setNotifySuccess(true);
      setTimeout(() => { setNotifyModal(false); setNotifySuccess(false); setNotifyForm({ title: "", message: "" }); }, 2000);
    } catch (err) { console.error(err); }
    finally { setNotifySending(false); }
  };

  const filtered = customers.filter(c =>
    [c.name, c.phone, c.email].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)]">
      {/* LEFT: Customer List */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-myntra-dark">Customers</h1>
            <p className="text-gray-400 text-sm">{customers.length} registered accounts</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-myntra-pink outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {filtered.map(c => (
                <button
                  key={c._id}
                  onClick={() => openDetail(c._id)}
                  className={`w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left group ${selectedId === c._id ? "bg-pink-50/50 border-l-2 border-l-myntra-pink" : ""}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-myntra-pink font-black text-[15px]">
                      {c.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-myntra-dark text-[14px]">{c.name}</p>
                      <p className="text-[12px] text-gray-400 font-medium">{c.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300 group-hover:text-myntra-pink transition-colors">
                    {c.cart?.length > 0 && (
                      <span className="text-[11px] font-bold text-myntra-pink bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">{c.cart.length} in bag</span>
                    )}
                    <span className="text-[11px] text-gray-400">{fmt(c.createdAt)}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <User className="h-10 w-10 text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm font-bold">No customers found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Detail Panel */}
      <div className={`flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${selectedId ? "w-[520px] shrink-0" : "w-0 opacity-0 pointer-events-none"}`}>
        {detailLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-myntra-pink" />
          </div>
        ) : detail ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-myntra-dark to-[#2a1a3e] flex items-start justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 bg-myntra-pink/20 rounded-2xl flex items-center justify-center text-myntra-pink font-black text-2xl border border-myntra-pink/20">
                  {detail.user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{detail.user.name}</h2>
                  <p className="text-[11px] text-gray-400 font-mono">ID: {detail.user._id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-[13px] font-bold truncate">{detail.user.phone || "—"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-[13px] truncate">{detail.user.email || "—"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-[12px]">Joined {fmt(detail.user.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-[12px]">Login {detail.user.lastLogin ? fmtTime(detail.user.lastLogin) : "—"}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0">
              {(["overview", "cart", "orders", "addresses"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === tab ? "border-myntra-pink text-myntra-pink" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab === "cart" ? `Cart (${detail.user.cart?.length || 0})` :
                    tab === "orders" ? `Orders (${detail.orders?.length || 0})` :
                      tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                          <p className="text-2xl font-black text-myntra-dark">{detail.user.cart?.length || 0}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">In Bag</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                          <p className="text-2xl font-black text-myntra-dark">{detail.orders?.length || 0}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Orders</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                          <p className="text-2xl font-black text-myntra-dark">
                            ₹{detail.orders?.reduce((s, o) => s + o.totalPrice, 0) || 0}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Spent</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer ID</p>
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <Hash className="h-4 w-4 text-gray-300" />
                          <code className="text-[12px] text-gray-600 font-mono">{detail.user._id}</code>
                        </div>
                      </div>

                      {detail.orders?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Latest Order</p>
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                            <div className="flex justify-between items-center">
                              <code className="text-[11px] text-gray-500 font-mono">#{detail.orders[0]._id.slice(-8).toUpperCase()}</code>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${STATUS_COLORS[detail.orders[0].status] || ""}`}>
                                {detail.orders[0].status}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 text-[12px]">{fmtTime(detail.orders[0].createdAt)}</span>
                              <span className="font-black text-myntra-dark">₹{detail.orders[0].totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cart Tab */}
                  {activeTab === "cart" && (
                    <div className="space-y-3">
                      {detail.user.cart?.length > 0 ? detail.user.cart.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 bg-white border rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                              {item.product?.images?.[0]?.url ? (
                                <img src={item.product.images[0].url} className="h-full w-full object-cover" alt="" />
                              ) : (
                                <Package className="h-5 w-5 text-gray-200" />
                              )}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-myntra-dark leading-snug line-clamp-1">{item.product?.name || "Deleted Product"}</p>
                              <p className="text-[11px] text-gray-400">Qty {item.qty} · ₹{item.product?.price}</p>
                              {item.addedAt && <p className="text-[10px] text-gray-300 mt-0.5">Added {fmtTime(item.addedAt)}</p>}
                            </div>
                          </div>
                          <p className="font-black text-myntra-pink text-[14px] shrink-0">₹{(item.product?.price || 0) * item.qty}</p>
                        </div>
                      )) : (
                        <div className="py-16 text-center">
                          <ShoppingBag className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm font-bold">Cart is empty</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === "orders" && (
                    <div className="space-y-3">
                      {detail.orders?.length > 0 ? detail.orders.map(order => (
                        <div key={order._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <code className="text-[11px] font-bold text-gray-500">#{order._id.slice(-10).toUpperCase()}</code>
                              <p className="text-[11px] text-gray-400 mt-0.5">{fmtTime(order.createdAt)}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${STATUS_COLORS[order.status] || ""}`}>
                                {order.status}
                              </span>
                              {order.isPaid && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase">Paid</span>}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {order.orderItems.slice(0, 2).map((item, i) => (
                              <div key={i} className="flex justify-between text-[12px]">
                                <span className="text-gray-600 truncate max-w-[200px]">{item.name} × {item.quantity}</span>
                                <span className="font-bold text-myntra-dark shrink-0">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <p className="text-[11px] text-gray-400">+{order.orderItems.length - 2} more items</p>
                            )}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <div className="flex items-center space-x-1 text-gray-400">
                              <MapPin className="h-3 w-3" />
                              <span className="text-[11px] truncate max-w-[160px]">{order.shippingAddress?.city || "—"}</span>
                            </div>
                            <span className="font-black text-myntra-dark">₹{order.totalPrice}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="py-16 text-center">
                          <CreditCard className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm font-bold">No orders yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Addresses Tab */}
                  {activeTab === "addresses" && (
                    <div className="space-y-3">
                      {detail.user.addresses?.length > 0 ? detail.user.addresses.map((addr, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <MapPin className="h-4 w-4 text-myntra-pink mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[13px] font-bold text-myntra-dark">{addr.street}</p>
                                <p className="text-[12px] text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                                <p className="text-[12px] text-gray-400">{addr.country}</p>
                              </div>
                            </div>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold text-myntra-pink bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 uppercase">Default</span>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="py-16 text-center">
                          <MapPin className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm font-bold">No saved addresses</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-gray-100 flex space-x-3 shrink-0 bg-gray-50/50">
              <button
                onClick={() => setNotifyModal(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-myntra-dark hover:bg-black text-white py-3 rounded-xl font-bold text-[13px] transition-all active:scale-95"
              >
                <Bell className="h-4 w-4" />
                <span>Send Notification</span>
              </button>
              <button
                onClick={() => handleDelete(selectedId!)}
                className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-500 py-3 px-4 rounded-xl font-bold text-[13px] transition-all active:scale-95 border border-red-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Notification Modal */}
      <AnimatePresence>
        {notifyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-myntra-dark">Send Notification</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-0.5">to {detail?.user.name}</p>
                </div>
                <button onClick={() => { setNotifyModal(false); setNotifySuccess(false); }} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSendNotification} className="p-8 space-y-4">
                {notifySuccess ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="font-bold text-emerald-600">Notification Sent!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                      <input
                        type="text" required value={notifyForm.title}
                        onChange={e => setNotifyForm({ ...notifyForm, title: e.target.value })}
                        placeholder="e.g. Special Offer for You!"
                        className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-myntra-pink transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Message</label>
                      <textarea
                        required value={notifyForm.message}
                        onChange={e => setNotifyForm({ ...notifyForm, message: e.target.value })}
                        placeholder="Write your message here..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-myntra-pink transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit" disabled={notifySending}
                      className="w-full bg-myntra-dark hover:bg-black text-white py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {notifySending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <><Bell className="h-4 w-4" /><span>Send Now</span></>
                      )}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
