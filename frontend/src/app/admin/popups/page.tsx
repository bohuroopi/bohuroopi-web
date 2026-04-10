"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Play, MessageSquare, Zap, Clock, Plus, Edit, Trash2, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Link as LinkIcon, Eye } from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/imageUtils";

export default function PopupsPage() {
  const [popups, setPopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    imageUrl: "",
    link: "",
    isActive: false,
    title: "Popup", // Default title for backend
  });

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/popups");
      if (res.data.success) {
        setPopups(res.data.popups);
      }
    } catch (err) {
      console.error("Fetch Popups Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (popup: any = null) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData({
        imageUrl: popup.imageUrl || "",
        link: popup.link || "",
        isActive: popup.isActive || false,
        title: popup.title || "Popup",
      });
    } else {
      setEditingPopup(null);
      setFormData({
        imageUrl: "",
        link: "",
        isActive: false,
        title: "Popup",
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    try {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('images', file);

        const res = await api.post('/upload', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success && res.data.images.length > 0) {
            setFormData({ ...formData, imageUrl: res.data.images[0].url });
        }
    } catch (err) {
        console.error("Upload Error:", err);
        alert('Failed to upload image');
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingPopup) {
        await api.put(`/popups/${editingPopup._id}`, formData);
      } else {
        await api.post("/popups", formData);
      }
      setIsModalOpen(false);
      fetchPopups();
    } catch (err) {
      console.error("Save Popup Error:", err);
      alert("Failed to save popup");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (popup: any) => {
    try {
      const newStatus = !popup.isActive;
      const res = await api.put(`/popups/${popup._id}`, { ...popup, isActive: newStatus });
      if (res.data.success) {
        fetchPopups(); // Refresh to show only one active
      }
    } catch (err) {
      console.error("Toggle Active Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this popup?")) {
      try {
        await api.delete(`/popups/${id}`);
        fetchPopups();
      } catch (err) {
        console.error("Delete Popup Error:", err);
      }
    }
  };

  return (
    <div className="space-y-10 font-sans animate-fade-in pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-myntra-dark tracking-tighter uppercase leading-none">Interactions & Popups</h1>
          <div className="h-1 w-20 bg-myntra-pink mt-3 rounded-full"></div>
          <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mt-3">Manage promotional modals and exit-intent triggers</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-myntra-dark text-white px-6 py-3 rounded-xl font-bold text-[13px] flex items-center space-x-2 hover:bg-myntra-pink transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>CREATE NEW CAMPAIGN</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
        </div>
      ) : popups.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm border-dashed border-2">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center">
              <Bell className="h-10 w-10 text-gray-200" />
          </div>
          <div className="space-y-2">
              <h2 className="text-xl font-black text-myntra-dark uppercase tracking-tight">No Active Campaigns</h2>
              <p className="text-[13px] text-gray-400 font-medium max-w-sm mx-auto">
                  Create your first promotional popup to engage visitors with special offers, newsletter signups, or flash sales.
              </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popups.map((popup) => (
            <div key={popup._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden group">
                {popup.imageUrl ? (
                  <img src={getImageUrl(popup.imageUrl)} className="h-full w-full object-cover" alt={popup.title} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-1">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${popup.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                      {popup.isActive ? 'Active' : 'Draft'}
                   </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{popup.link ? 'Active Link' : 'No Link'}</span>
                  </div>
                  <h3 className="text-lg font-black text-myntra-dark leading-tight line-clamp-1">{popup.link || 'Internal Link'}</h3>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenModal(popup)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(popup._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => toggleActive(popup)}
                    className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                        popup.isActive 
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                    }`}
                  >
                    {popup.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-myntra-dark/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-black text-myntra-dark uppercase tracking-tight">
                    {editingPopup ? 'Edit Campaign' : 'New Interaction'}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Design your user engagement overlay</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-myntra-dark hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Destination Link (Optional)</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        <input 
                            type="text" 
                            value={formData.link}
                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 text-sm focus:border-myntra-pink outline-none transition-all font-mono text-blue-600"
                            placeholder="e.g. /category/new-arrivals"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Overlay Image Asset</label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden" 
                      accept="image/*"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                        formData.imageUrl ? 'border-myntra-pink/30 bg-myntra-pink/[0.02]' : 'border-gray-100 hover:border-myntra-pink/50 hover:bg-gray-50'
                      }`}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-myntra-pink" />
                          <p className="text-[10px] font-black text-myntra-pink uppercase tracking-widest">Uploading...</p>
                        </div>
                      ) : formData.imageUrl ? (
                        <>
                          <div className="relative w-full aspect-[3/4] max-h-64 rounded-xl overflow-hidden shadow-sm mx-auto">
                            <img src={getImageUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                               <p className="text-white text-[10px] font-black uppercase tracking-widest">Click to Change</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 truncate w-full text-center px-4">{formData.imageUrl}</p>
                        </>
                      ) : (
                        <>
                          <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] font-black text-myntra-dark uppercase tracking-tight">Upload Popup Image (3:4 Ratio Only)</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Images will be cropped to 3:4 aspect ratio</p>
                          </div>
                        </>
                      )}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${formData.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[13px] font-black text-myntra-dark">GO LIVE IMMEDIATELY</p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase">This will deactivate any other active popup</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                        className={`w-14 h-8 rounded-full transition-all relative ${formData.isActive ? 'bg-myntra-pink' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.isActive ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-myntra-dark text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 text-[14px]"
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (editingPopup ? 'UPDATE INTERACTION' : 'PUBLISH CAMPAIGN')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
