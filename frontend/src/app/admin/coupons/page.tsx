"use client";

import { useState, useEffect } from "react";
import { Ticket, Plus, Search, Edit, Trash2, Loader2, X, CheckCircle } from "lucide-react";
import api from "@/lib/axios";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    _id: "",
    code: "",
    discountType: "percentage",
    discountAmount: 0,
    minPurchase: 0,
    maxDiscount: "",
    expiryDate: "",
    usageLimit: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coupons");
      if (res.data.success) setCoupons(res.data.coupons);
    } catch (err) {
      console.error("Fetch Coupons Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon: any = null) => {
    if (coupon) {
      setFormData({
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount || "",
        expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
      });
    } else {
      setFormData({
        _id: "",
        code: "",
        discountType: "percentage",
        discountAmount: 0,
        minPurchase: 0,
        maxDiscount: "",
        expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // Next week
        usageLimit: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData };
      if (!payload.maxDiscount) delete (payload as any).maxDiscount;
      if (!payload._id) delete (payload as any)._id;

      if (formData._id) {
        await api.put(`/coupons/${formData._id}`, payload);
      } else {
        await api.post("/coupons", payload);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error("Save Coupon Error:", err);
      alert(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error("Delete Coupon Error:", err);
    }
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Coupons & Discounts</h1>
          <p className="text-gray-500 text-sm">Manage promotional codes to drive sales</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-myntra-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-black transition-all shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
           <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search code..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-myntra-pink"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-myntra-pink" /></div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center text-gray-500">No coupons found. Click "Create Coupon" to add one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Conditions</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-pink-50 rounded-lg flex items-center justify-center text-myntra-pink">
                             <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-myntra-dark text-base tracking-widest">{coupon.code}</p>
                            <p className="text-[10px] text-gray-400 uppercase mt-0.5">Exp: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-myntra-dark">
                         {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} OFF`}
                       </p>
                       {coupon.maxDiscount && <p className="text-[11px] text-gray-500">Up to ₹{coupon.maxDiscount}</p>}
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-medium text-gray-600">Min Order: ₹{coupon.minPurchase}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-medium text-gray-600">Used: <span className="font-bold">{coupon.usageCount}</span></p>
                       <p className="text-[11px] text-gray-400">Limit: {coupon.usageLimit || '∞'}</p>
                    </td>
                    <td className="px-6 py-4">
                       {coupon.isActive ? (
                         <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase flex items-center w-max">
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                         </span>
                       ) : (
                         <span className="px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold uppercase w-max">
                            Inactive
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2">
                         <button onClick={() => handleOpenModal(coupon)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                         <button onClick={() => handleDelete(coupon._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h2 className="text-xl font-bold text-myntra-dark">{formData._id ? "Edit Coupon" : "Create New Coupon"}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                 <form id="couponForm" onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Coupon Code *</label>
                       <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink uppercase tracking-widest font-bold" placeholder="e.g. FESTIVE50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Type *</label>
                          <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink cursor-pointer font-medium">
                             <option value="percentage">Percentage (%)</option>
                             <option value="flat">Flat Amount (₹)</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Discount Value *</label>
                          <input type="number" required min="1" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink font-medium" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Min Order Value (₹)</label>
                          <input type="number" min="0" value={formData.minPurchase} onChange={e => setFormData({...formData, minPurchase: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Max Discount (₹)</label>
                          <input type="number" min="0" placeholder="Optional" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink" disabled={formData.discountType === 'flat'} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Expiry Date *</label>
                          <input type="date" required value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Usage Limit</label>
                          <input type="number" min="0" placeholder="0 = Unlimited" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink" />
                       </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                       <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-5 w-5 accent-myntra-pink cursor-pointer rounded" />
                       <label htmlFor="isActive" className="text-sm font-bold text-myntra-dark cursor-pointer">Activate immediately?</label>
                    </div>
                 </form>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                 <button type="submit" form="couponForm" disabled={saving} className="px-6 py-2.5 rounded-xl font-bold bg-myntra-pink text-white hover:bg-[#f72c5c] shadow-lg shadow-pink-200 transition-all flex items-center min-w-[120px] justify-center disabled:opacity-50">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Coupon"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
