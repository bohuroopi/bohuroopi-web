"use client";

import { useState, useEffect, useRef } from "react";
import {
  ImageIcon, Plus, LayoutGrid, Monitor, Clock, Edit, Trash2,
  X, CheckCircle, Loader2, Image as LucideImage, Link as LinkIcon,
  GripVertical
} from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { getImageUrl } from "@/lib/imageUtils";

export default function BannersPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [inlineBanners, setInlineBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: "banner" as "hero" | "banner", // Default to banner
    title: "Banner", // Default to Banner (required by backend)
    subtitle: "",
    imageUrl: "",
    link: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/homepage");
      if (res.data.success) {
        const banners = res.data.sections.filter(
          (s: any) => s.type === "hero" || s.type === "banner"
        );
        setSections(banners);
        setHeroBanners(banners.filter((s: any) => s.type === 'hero').sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
        setInlineBanners(banners.filter((s: any) => s.type === 'banner').sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
    } catch (err) {
      console.error("Fetch Banners Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (newOrder: any[], type: 'hero' | 'banner') => {
    // Optimistic update
    if (type === 'hero') setHeroBanners(newOrder);
    else setInlineBanners(newOrder);

    try {
      const orders = newOrder.map((item, index) => ({
        _id: item._id,
        order: index
      }));
      await api.put('/homepage/reorder', { orders });
    } catch (err) {
      console.error("Reorder Error:", err);
      alert("Failed to save new order");
      fetchBanners(); // Rollback
    }
  };

  const handleOpenModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        type: banner.type,
        title: banner.title,
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl || "",
        link: banner.link || "",
        order: banner.order || 0,
        isActive: banner.isActive,
      });
      setIsModalOpen(true);
    }
  };

  const handleOpenNewBanner = (type: "hero" | "banner") => {
    setEditingBanner(null);
    setFormData({
      type,
      title: type === "hero" ? "Main Hero Slide" : "Promotional Banner",
      subtitle: "",
      imageUrl: "",
      link: "",
      order: type === "hero" ? heroBanners.length : inlineBanners.length,
      isActive: true,
    });
    setIsTypeSelectionOpen(false);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
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
      if (editingBanner) {
        await api.put(`/homepage/${editingBanner._id}`, formData);
      } else {
        await api.post("/homepage", formData);
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error("Save Banner Error:", err);
      alert("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await api.delete(`/homepage/${id}`);
        fetchBanners();
      } catch (err) {
        console.error("Delete Banner Error:", err);
      }
    }
  };

  const toggleActive = async (banner: any) => {
    try {
      await api.put(`/homepage/${banner._id}`, { ...banner, isActive: !banner.isActive });
      fetchBanners();
    } catch (err) {
      console.error("Toggle Active Error:", err);
    }
  };

  return (
    <div className="space-y-10 font-sans animate-fade-in pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-myntra-dark tracking-tighter uppercase leading-none">Banners & Hero Assets</h1>
          <div className="h-1 w-20 bg-myntra-pink mt-3 rounded-full"></div>
          <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mt-3">Manage homepage sliders and promotional banners</p>
        </div>
        <button
          onClick={() => setIsTypeSelectionOpen(true)}
          className="bg-myntra-dark text-white px-6 py-3 rounded-xl font-bold text-[13px] flex items-center space-x-2 hover:bg-myntra-pink transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>UPLOAD NEW BANNER</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm border-dashed border-2">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-200" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-myntra-dark uppercase tracking-tight">No Banners Configured</h2>
            <p className="text-[13px] text-gray-400 font-medium max-w-sm mx-auto">
              Manage your promotional visuals. Create your first hero slider or banner to attract customers.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Hero Sliders Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-2">
              <Monitor className="h-5 w-5 text-myntra-pink" />
              <h2 className="text-sm font-black text-myntra-dark uppercase tracking-widest">Main Hero Sliders (16:9 Ratio)</h2>
            </div>
            <Reorder.Group
              axis="y"
              values={heroBanners}
              onReorder={(newOrder) => handleReorder(newOrder, 'hero')}
              className="flex flex-col space-y-4"
            >
              {heroBanners.map((banner, index) => (
                <ReorderableBannerItem
                  key={banner._id}
                  banner={banner}
                  index={index}
                  onEdit={() => handleOpenModal(banner)}
                  onDelete={() => handleDelete(banner._id)}
                  onToggle={() => toggleActive(banner)}
                />
              ))}
            </Reorder.Group>
            {heroBanners.length === 0 && <p className="text-xs text-gray-400 italic">No hero banners added yet.</p>}
          </section>

          {/* Inline Banners Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-2">
              <LayoutGrid className="h-5 w-5 text-myntra-pink" />
              <h2 className="text-sm font-black text-myntra-dark uppercase tracking-widest">Inline Promotional Banners (3:1 Ratio)</h2>
            </div>
            <Reorder.Group
              axis="y"
              values={inlineBanners}
              onReorder={(newOrder) => handleReorder(newOrder, 'banner')}
              className="flex flex-col space-y-4"
            >
              {inlineBanners.map((banner, index) => (
                <ReorderableBannerItem
                  key={banner._id}
                  banner={banner}
                  index={index}
                  onEdit={() => handleOpenModal(banner)}
                  onDelete={() => handleDelete(banner._id)}
                  onToggle={() => toggleActive(banner)}
                />
              ))}
            </Reorder.Group>
            {inlineBanners.length === 0 && <p className="text-xs text-gray-400 italic">No inline banners added yet.</p>}
          </section>
        </div>
      )}

      {/* TYPE SELECTION MODAL */}
      <AnimatePresence>
        {isTypeSelectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTypeSelectionOpen(false)}
              className="absolute inset-0 bg-myntra-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-black text-myntra-dark uppercase tracking-tight">Select Asset Type</h2>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Where should this banner appear on the homepage?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleOpenNewBanner('hero')}
                  className="group relative bg-gray-50 border-2 border-transparent hover:border-myntra-pink p-6 rounded-3xl transition-all flex items-center space-x-6 text-left"
                >
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-myntra-dark group-hover:bg-myntra-pink group-hover:text-white transition-all shadow-sm">
                    <Monitor className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-myntra-dark uppercase tracking-tight">Main Hero Slider</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">appears at the top of the homepage</p>
                  </div>
                </button>

                <button
                  onClick={() => handleOpenNewBanner('banner')}
                  className="group relative bg-gray-50 border-2 border-transparent hover:border-myntra-pink p-6 rounded-3xl transition-all flex items-center space-x-6 text-left"
                >
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-myntra-dark group-hover:bg-myntra-pink group-hover:text-white transition-all shadow-sm">
                    <LayoutGrid className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-myntra-dark uppercase tracking-tight">Promotional Banner</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">appears inline between product grids</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setIsTypeSelectionOpen(false)}
                className="mt-8 text-center w-full text-[11px] font-black text-gray-300 uppercase tracking-widest hover:text-myntra-pink transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATION/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-myntra-dark/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-black text-myntra-dark uppercase tracking-tight">
                    {editingBanner ? 'Update Asset' : 'New Visual Asset'}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your homepage promotional visual</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-myntra-dark hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-myntra-dark uppercase tracking-tight">Banner Configuration</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Focus on visual engagement and redirection</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Banner Visual Asset</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${formData.imageUrl ? 'border-myntra-pink/30 bg-myntra-pink/[0.02]' : 'border-gray-100 hover:border-myntra-pink/50 hover:bg-gray-50'
                      }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-myntra-pink" />
                        <p className="text-[10px] font-black text-myntra-pink uppercase tracking-widest">Uploading...</p>
                      </div>
                    ) : formData.imageUrl ? (
                      <>
                        <div className={`relative w-full rounded-xl overflow-hidden shadow-sm ${formData.type === 'hero' ? 'aspect-[16/9]' : 'aspect-[3/1]'}`}>
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
                          <LucideImage className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-[13px] font-black text-myntra-dark uppercase tracking-tight">Click to Upload Image</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                            {formData.type === 'hero' ? 'Recommended: 16:9 Ratio (e.g. 1920x1080)' : 'Recommended: 3:1 Ratio (e.g. 900x300)'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Redirection Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      type="text" value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 text-sm focus:border-myntra-pink outline-none transition-all font-mono text-blue-600"
                      placeholder="/category/rings"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={saving}
                  className="w-full bg-myntra-dark text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 text-[14px]"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (editingBanner ? 'UPDATE ASSET' : 'PUBLISH VISUAL')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReorderableBannerItem({ banner, index, onEdit, onDelete, onToggle }: { banner: any, index: number, onEdit: any, onDelete: any, onToggle: any }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={banner}
      dragListener={false}
      dragControls={controls}
    >
      <BannerCard
        banner={banner}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        dragControls={controls}
      />
    </Reorder.Item>
  );
}

function BannerCard({ banner, index, onEdit, onDelete, onToggle, dragControls }: {
  banner: any, index: number, onEdit: any, onDelete: any, onToggle: any, dragControls: any
}) {
  const displayTitle = banner.type === 'hero' 
    ? `Hero Slide ${index + 1}` 
    : `Banner ${index + 1}`;
  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="mt-1 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex items-center space-x-4">
            {banner.imageUrl ? (
              <img src={getImageUrl(banner.imageUrl)} alt={banner.title} className="h-14 w-28 object-cover rounded-lg border border-gray-100 shadow-sm" />
            ) : (
              <div className="h-14 w-28 bg-gray-50 flex items-center justify-center text-gray-200 rounded-lg"><ImageIcon className="h-6 w-6" /></div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-myntra-dark line-clamp-1 truncate max-w-[200px] uppercase tracking-tight leading-none">{displayTitle}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${banner.isActive ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-400 text-white'}`}>
                  {banner.isActive ? 'Live' : 'Hidden'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 line-clamp-1">{banner.subtitle || 'Promotional Banner'}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button onClick={onEdit} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit className="h-4 w-4" /></button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono">
          <LinkIcon className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{banner.link || '/'}</span>
        </div>
        <button
          onClick={onToggle}
          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${banner.isActive ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
        >
          {banner.isActive ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
