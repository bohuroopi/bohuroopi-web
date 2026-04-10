"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Layout, X, Loader2,
  ShoppingBag, Lock, Search, Check, ChevronDown,
  Monitor, LayoutGrid, GripVertical, Image as ImageIcon, Info
} from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";

// All sections are now manageable for positioning
const MANAGEABLE_TYPES = ["hero", "categories", "products", "banner"] as const;

export default function AdminHomepage() {
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: "products",
    selectionType: "manual" as "manual" | "category",
    title: "",
    subtitle: "",
    order: 0,
    isActive: true,
    items: [] as string[],
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, productsRes, categoriesRes] = await Promise.all([
        api.get("/homepage"),
        api.get("/products"),
        api.get("/categories")
      ]);
      if (sectionsRes.data.success) setSections(sectionsRes.data.sections);
      if (productsRes.data.success) setProducts(productsRes.data.products);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (section: any = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        type: section.type,
        selectionType: section.selectionType || "manual",
        title: section.title,
        subtitle: section.subtitle || "",
        order: section.order || 0,
        isActive: section.isActive ?? true,
        items: section.items || [],
      });
    } else {
      setEditingSection(null);
      setFormData({
        type: "products",
        selectionType: "manual",
        title: "",
        subtitle: "",
        order: sections.length,
        isActive: true,
        items: [],
      });
    }
    setSearchQuery("");
    setIsModalOpen(true);
  };

  const handleReorder = async (newDraggableOrder: any[]) => {
    const heroSections = sections.filter(s => s.type === 'hero');
    const updatedFullSections = [...heroSections, ...newDraggableOrder];
    
    // Optimistic update
    setSections(updatedFullSections);

    try {
      const orders = updatedFullSections.map((section, index) => ({
        _id: section._id,
        order: index
      }));
      await api.put("/homepage/reorder", { orders });
    } catch (err) {
      console.error("Reorder Error:", err);
      // alert("Failed to save layout order");
      fetchInitialData(); // Rollback
    }
  };

  const toggleItem = (id: string) => {
    setFormData(prev => {
      const items = [...prev.items];
      const index = items.indexOf(id);
      if (index > -1) {
        items.splice(index, 1);
      } else {
        items.push(id);
      }
      return { ...prev, items };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await api.put(`/homepage/${editingSection._id}`, formData);
      } else {
        await api.post("/homepage", formData);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await api.delete(`/homepage/${id}`);
        fetchInitialData();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const filteredItems = (formData.selectionType === "manual" ? products : categories).filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Homepage Management</h1>
          <p className="text-gray-500 text-sm">Add dynamic product sliders in the Homepage</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-myntra-pink text-white px-6 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-lg shadow-pink-200 hover:scale-105 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Add Section</span>
        </button>
      </div>

      {loading ? (
        <div className="p-20 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section Layout Rendering */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                <Layout className="h-3.5 w-3.5" />
                <span>Homepage Layout Structure</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Drag icons to reorder draggable sections</span>
            </div>

            {sections.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <p className="text-gray-400 font-bold text-sm">No sections configured</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fixed Hero Sections */}
                {sections.filter(s => s.type === 'hero').map((section, index) => (
                  <StaticSectionItem
                    key={section._id}
                    section={section}
                    displayTitle={`Hero Slide ${index + 1}`}
                    onEdit={() => handleOpenModal(section)}
                    onDelete={() => handleDelete(section._id)}
                  />
                ))}

                {/* Draggable Other Sections */}
                <Reorder.Group
                  axis="y"
                  values={sections.filter(s => s.type !== 'hero')}
                  onReorder={handleReorder}
                  className="space-y-4"
                >
                  {(() => {
                    let bannerIndex = 0;
                    return sections.filter(s => s.type !== 'hero').map((section) => {
                      let displayTitle = section.title;
                      if (section.type === 'banner') {
                        displayTitle = `Banner ${++bannerIndex}`;
                      }
                      return (
                        <ReorderableSectionItem
                          key={section._id}
                          section={section}
                          displayTitle={displayTitle}
                          onEdit={() => handleOpenModal(section)}
                          onDelete={() => handleDelete(section._id)}
                        />
                      );
                    });
                  })()}
                </Reorder.Group>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-myntra-dark tracking-tight uppercase">
                  {editingSection ? "Update Slider" : "Add New Slider"}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure homepage product section</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full transition-all text-gray-400 shadow-sm border border-transparent hover:border-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 space-y-8">
              {/* Header Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Section Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Best Sellers"
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-lg font-black text-myntra-dark focus:border-myntra-pink outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Section Tagline (Optional)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Trendy pieces loved by everyone"
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium text-gray-600 focus:border-myntra-pink outline-none transition-all"
                  />
                </div>
              </div>

              {/* Selection Type & Order */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Selection Logic</label>
                  <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-2xl relative">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, selectionType: 'manual', items: [] })}
                      className={`relative z-10 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${formData.selectionType === 'manual' ? 'bg-white text-myntra-pink shadow-sm' : 'text-gray-400'}`}
                    >
                      Pick Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, selectionType: 'category', items: [] })}
                      className={`relative z-10 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${formData.selectionType === 'category' ? 'bg-white text-myntra-pink shadow-sm' : 'text-gray-400'}`}
                    >
                      By Category
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-black focus:border-myntra-pink outline-none"
                  />
                </div>
              </div>

              {/* Multi-Select Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Choose {formData.selectionType === 'manual' ? 'Specific Products' : 'Categories'}
                  </h3>
                  <span className="text-[10px] font-black text-myntra-pink bg-pink-50 px-2 py-1 rounded">
                    {formData.items.length} Selected
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${formData.selectionType === 'manual' ? 'products' : 'categories'}...`}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-myntra-pink outline-none shadow-inner bg-gray-50/30"
                  />
                </div>

                {/* Selection Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredItems.map((item) => {
                    const isSelected = formData.items.includes(item._id);
                    return (
                      <div
                        key={item._id}
                        onClick={() => toggleItem(item._id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'border-myntra-pink bg-pink-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                            {(item.images?.[0]?.url || item.image?.url) ? (
                              <img src={item.images?.[0]?.url || item.image.url} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <span className="text-[10px] text-gray-300 font-bold">{item.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className={`text-[12px] font-bold truncate max-w-[150px] ${isSelected ? 'text-myntra-pink' : 'text-gray-600'}`}>{item.name}</span>
                        </div>
                        {isSelected ? (
                          <div className="bg-myntra-pink rounded-full p-1 shadow-sm">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <Plus className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-myntra-dark text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98]"
                >
                  Publish Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaticSectionItem({ section, displayTitle, onEdit, onDelete }: { section: any, displayTitle: string, onEdit: any, onDelete: any }) {
  const { getIcon, getLabel, getColorClass } = useSectionStyles(section);

  return (
    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl overflow-hidden shadow-sm p-6 opacity-90">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-5">
          <div className="p-2 bg-gray-50 text-gray-300 rounded-lg cursor-not-allowed">
            <Lock className="h-5 w-5" />
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${getColorClass()}`}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-myntra-dark uppercase tracking-tight leading-none text-sm">{displayTitle}</h3>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-sm">Fixed Item</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{getLabel()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onDelete}
            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
            title="Remove from Homepage"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReorderableSectionItem({ section, displayTitle, onEdit, onDelete }: { section: any, displayTitle: string, onEdit: any, onDelete: any }) {
  const controls = useDragControls();
  const { getIcon, getLabel, getColorClass } = useSectionStyles(section);

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group p-6 active:scale-[1.01] active:shadow-lg"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-5">
          <div
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-myntra-pink/10 hover:text-myntra-pink rounded-lg transition-colors text-gray-400"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${getColorClass()}`}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-myntra-dark uppercase tracking-tight leading-none text-sm">{displayTitle}</h3>
              {(!section.isActive) && (
                 <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-gray-400 text-white">Hidden</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{getLabel()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {section.type === 'products' ? (
            <button
               onClick={onEdit}
               className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
               title="Configure Slider Content"
            >
              <Edit className="h-4.5 w-4.5" />
            </button>
          ) : (
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mr-2">Managed in Banners Menu</span>
          )}
          
          <button
            onClick={onDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Remove from Homepage"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

function useSectionStyles(section: any) {
  const getIcon = () => {
    switch (section.type) {
      case 'hero': return <Monitor className="h-5 w-5" />;
      case 'categories': return <LayoutGrid className="h-5 w-5" />;
      case 'banner': return <ImageIcon className="h-5 w-5" />;
      case 'products': return <ShoppingBag className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (section.type) {
      case 'hero': return 'Main Slider (Fixed)';
      case 'categories': return 'Category Grid Section';
      case 'banner': return 'Inline Banner Section';
      case 'products': return 'Product Slider Section';
      default: return 'Homepage Section';
    }
  };

  const getColorClass = () => {
    switch (section.type) {
      case 'hero': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'categories': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'banner': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'products': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return { getIcon, getLabel, getColorClass };
}
