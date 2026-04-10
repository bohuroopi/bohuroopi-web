"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User, Package, Settings, Heart, AlertCircle, RefreshCw, RotateCcw, X, Loader2, ImagePlus, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";

const RETURN_REASONS = [
  "Wrong product received",
  "Product is damaged / defective",
  "Product does not match description",
  "Size/fit issue",
  "Quality not as expected",
  "Changed my mind",
  "Other",
];

interface OrderItem {
  _id: string;
  product: { _id: string; name: string; image: string; };
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
  paymentMethod: string;
}

interface ReturnRequest {
  _id: string;
  order: { _id: string };
  status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded';
  items: { reason: string; name: string }[];
  refundAmount?: number;
  adminComment?: string;
  createdAt: string;
}

const RETURN_STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  pending:  { label: 'Return Pending Review',  classes: 'text-amber-700  bg-amber-50  border-amber-200' },
  approved: { label: 'Return Approved',        classes: 'text-blue-700   bg-blue-50   border-blue-200' },
  received: { label: 'Return Received',        classes: 'text-purple-700 bg-purple-50 border-purple-200' },
  refunded: { label: 'Refund Processed',       classes: 'text-green-700  bg-green-50  border-green-200' },
  rejected: { label: 'Return Rejected',        classes: 'text-red-700    bg-red-50    border-red-200' },
};

export default function ProfileOrders() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myReturns, setMyReturns] = useState<ReturnRequest[]>([]);
  const returnImgRef = useRef<HTMLInputElement>(null);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [activeCancelId, setActiveCancelId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  // Return modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [activeReturnOrderId, setActiveReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [returnImgUploading, setReturnImgUploading] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccessBanner, setReturnSuccessBanner] = useState(false);

  useEffect(() => {
    useAuthStore.persist.onFinishHydration(() => {
      if (!useAuthStore.getState().isAuthenticated) router.push("/login?redirect=/profile/orders");
      else loadData();
    });
    if (useAuthStore.persist.hasHydrated()) {
      if (!useAuthStore.getState().isAuthenticated) router.push("/login?redirect=/profile/orders");
      else loadData();
    }
  }, [router]);

  const loadData = async () => {
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        api.get("/orders/myorders"),
        api.get("/returns/myreturns"),
      ]);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (returnsRes.data.success) setMyReturns(returnsRes.data.returns);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  // Cancel
  const triggerCancel = (id: string) => { setActiveCancelId(id); setCancelModalOpen(true); };
  const handleConfirmCancel = async () => {
    if (!activeCancelId) return;
    try {
      const res = await api.put(`/orders/${activeCancelId}/cancel`);
      if (res.data.success) {
        setOrders(orders.map(o => o._id === activeCancelId ? { ...o, status: 'cancel_requested' } : o));
        setCancelModalOpen(false);
        setSuccessBanner(true);
        setTimeout(() => setSuccessBanner(false), 5000);
      }
    } catch (err) {
      alert("Failed to submit cancellation request");
    }
  };

  // Return
  const getReturnForOrder = (orderId: string) => myReturns.find(r => r.order?._id === orderId);
  const triggerReturn = (orderId: string) => {
    setActiveReturnOrderId(orderId);
    setReturnReason(""); setReturnDescription(""); setReturnImages([]);
    setReturnModalOpen(true);
  };

  const handleReturnImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setReturnImgUploading(true);
      const data = new FormData();
      for (let i = 0; i < files.length; i++) data.append("images", files[i]);
      const res = await api.post("/upload/customer", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) setReturnImages(prev => [...prev, ...res.data.images.map((img: any) => img.url)]);
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setReturnImgUploading(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!activeReturnOrderId || !returnReason) return;
    try {
      setReturnSubmitting(true);
      const res = await api.post("/returns", { orderId: activeReturnOrderId, reason: returnReason, description: returnDescription, images: returnImages });
      if (res.data.success) {
        setReturnModalOpen(false);
        setReturnSuccessBanner(true);
        setTimeout(() => setReturnSuccessBanner(false), 5000);
        // Refresh return list so status appears immediately
        const returnsRes = await api.get("/returns/myreturns");
        if (returnsRes.data.success) setMyReturns(returnsRes.data.returns);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit return request");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'cancel_requested': return 'text-orange-600 bg-orange-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      default: return 'text-myntra-pink bg-pink-50';
    }
  };

  if (loading) return <div className="flex justify-center items-center py-32"><RefreshCw className="h-8 w-8 text-myntra-pink animate-spin" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-[14px] text-myntra-dark mb-6">
        <span className="text-gray-400">Home /</span> <span className="font-bold">Orders</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="md:w-64 shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-myntra-light-gray rounded-full flex items-center justify-center mb-4 text-myntra-dark shadow-inner overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-gray-400" />}
            </div>
            <h3 className="font-bold text-[16px] text-myntra-dark">{user?.name}</h3>
            {user?.phone && <p className="text-[13px] font-medium text-gray-500 mt-1">{user.phone}</p>}
            {user?.email && <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>}
          </div>
          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            <Link href="/profile" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <Settings className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Profile Details</span>
            </Link>
            <Link href="/profile/orders" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-pink bg-pink-50/30">
              <Package className="h-5 w-5" /><span className="font-bold text-[14px]">Orders & Returns</span>
            </Link>
            <Link href="/profile/addresses" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <MapPin className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Saved Addresses</span>
            </Link>
            <Link href="/wishlist" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <Heart className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Wishlist</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-red-500 text-left">
              <LogOut className="h-5 w-5" /><span className="font-bold text-[14px]">Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow bg-white border border-gray-200 p-8 relative">
          {successBanner && (
            <div className="absolute top-0 left-0 right-0 bg-green-50 text-green-700 font-bold p-4 text-[13px] border-b border-green-200 flex items-center justify-center space-x-2 z-10">
              <AlertCircle className="h-4 w-4" /><span>Cancel request submitted — pending admin approval.</span>
            </div>
          )}
          {returnSuccessBanner && (
            <div className="absolute top-0 left-0 right-0 bg-blue-50 text-blue-700 font-bold p-4 text-[13px] border-b border-blue-200 flex items-center justify-center space-x-2 z-10">
              <RotateCcw className="h-4 w-4" /><span>Return request submitted! Our team will review it shortly.</span>
            </div>
          )}

          <h2 className={`text-2xl font-bold text-myntra-dark mb-6 ${(successBanner || returnSuccessBanner) ? 'mt-10' : ''}`}>Orders & Returns</h2>

          {orders.length === 0 ? (
            <div className="text-center py-10 border border-gray-100 rounded-md bg-gray-50">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No orders found.</p>
              <Link href="/" className="text-myntra-pink hover:underline uppercase text-[12px] font-bold mt-2 inline-block">Continue Shopping</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const returnReq = getReturnForOrder(order._id);
                return (
                  <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Order header */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center text-[12px]">
                      <div className="space-x-4 text-gray-500">
                        <span className="uppercase font-bold">Placed: <span className="text-myntra-dark">{new Date(order.createdAt).toLocaleDateString()}</span></span>
                        <span className="uppercase font-bold">Total: <span className="text-myntra-dark">₹{order.totalPrice}</span></span>
                        <span className="uppercase font-bold hidden sm:inline">ID: <span className="text-myntra-dark">{order._id.slice(-8).toUpperCase()}</span></span>
                      </div>
                      <span className={`px-3 py-1 rounded-full uppercase font-bold tracking-wide ${getStatusColor(order.status)}`}>
                        {order.status === 'cancel_requested' ? 'Cancel Requested' : order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-4">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex space-x-4 items-center">
                          <div className="h-20 w-16 bg-myntra-light-gray rounded-md overflow-hidden shrink-0 relative">
                            {item.image
                              ? <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                              : <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px]">NO IMG</div>
                            }
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-bold text-[14px] text-myntra-dark">{item.name}</h4>
                            <p className="text-gray-500 text-[12px] mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-bold text-[14px] text-myntra-dark">₹{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>

                    {/* Return status ribbon — shown if customer has a return for this order */}
                    {returnReq && (
                      <div className={`mx-4 mb-4 p-4 rounded-xl border text-[13px] font-semibold ${RETURN_STATUS_STYLES[returnReq.status]?.classes}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <RotateCcw className="h-4 w-4" />
                            <span>{RETURN_STATUS_STYLES[returnReq.status]?.label ?? returnReq.status}</span>
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wide">
                            Requested {new Date(returnReq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Reason */}
                        {returnReq.items?.[0]?.reason && (
                          <p className="mt-1 text-[12px] opacity-80">Reason: {returnReq.items[0].reason}</p>
                        )}
                        {/* Admin comment */}
                        {returnReq.adminComment && (
                          <p className="mt-1 text-[12px] opacity-80 italic">Admin note: "{returnReq.adminComment}"</p>
                        )}
                        {/* Refund amount */}
                        {returnReq.status === 'refunded' && returnReq.refundAmount && (
                          <p className="mt-1 font-bold text-green-700">Refund: ₹{returnReq.refundAmount}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-gray-100 p-4 bg-white flex justify-end space-x-2">
                      {['pending', 'processing'].includes(order.status) && (
                        <button onClick={() => triggerCancel(order._id)} className="text-[12px] font-bold text-red-500 border border-red-200 px-4 py-2 rounded-md hover:bg-red-50 transition">
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'delivered' && !returnReq && (
                        <button onClick={() => triggerReturn(order._id)} className="text-[12px] font-bold text-blue-600 border border-blue-200 px-4 py-2 rounded-md hover:bg-blue-50 transition flex items-center space-x-1">
                          <RotateCcw className="h-3.5 w-3.5" /><span>Request Return</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-myntra-dark">Cancel Order?</h3>
              <p className="text-[14px] text-gray-500 font-medium">Are you sure you want to request cancellation? This cannot be undone.</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button onClick={() => { setCancelModalOpen(false); setActiveCancelId(null); }} className="flex-1 py-4 font-bold text-[14px] text-gray-500 hover:bg-gray-50 transition">NO, KEEP IT</button>
              <button onClick={handleConfirmCancel} className="flex-1 py-4 font-bold text-[14px] text-red-500 hover:bg-red-50 border-l border-gray-100 transition">YES, CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-myntra-dark">Request Return</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Tell us why you want to return this order</p>
              </div>
              <button onClick={() => setReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Reason for Return *</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-[14px] text-myntra-dark outline-none focus:border-myntra-pink bg-white">
                  <option value="">Select a reason...</option>
                  {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Details (Optional)</label>
                <textarea rows={3} value={returnDescription} onChange={e => setReturnDescription(e.target.value)} placeholder="Describe the issue..." className="w-full border border-gray-200 rounded-lg p-3 text-[14px] text-myntra-dark outline-none focus:border-myntra-pink resize-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Upload Photos (Optional)</label>
                <div className="flex flex-wrap gap-3">
                  {returnImages.map((url, i) => (
                    <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setReturnImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => returnImgRef.current?.click()} disabled={returnImgUploading} className="h-20 w-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-myntra-pink hover:text-myntra-pink transition disabled:opacity-50">
                    {returnImgUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    <span className="text-[10px] mt-1 font-bold">Add Photo</span>
                  </button>
                  <input ref={returnImgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleReturnImageUpload} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button onClick={() => setReturnModalOpen(false)} className="flex-1 border border-gray-200 rounded-lg py-3 text-[14px] font-bold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmitReturn} disabled={!returnReason || returnSubmitting} className="flex-1 bg-myntra-dark text-white rounded-lg py-3 text-[14px] font-bold hover:bg-black transition disabled:opacity-50 flex items-center justify-center space-x-2">
                {returnSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                <span>Submit Return</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
