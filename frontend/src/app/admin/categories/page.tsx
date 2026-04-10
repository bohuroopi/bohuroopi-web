"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Search, X, Loader2, FolderOpen, GripVertical, Save, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";
import api from "@/lib/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);   // unsaved order changes
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Drag state — all via refs to avoid re-renders mid-drag
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: { url: "", public_id: "" },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        image: category.image || { url: "", public_id: "" },
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", image: { url: "", public_id: "" } });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This might affect products linked to it.")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try {
      setUploadingImg(true);
      const data = new FormData();
      data.append("images", e.target.files[0]); // Changed from "image" to "images" to match backend
      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success && res.data.images?.length > 0) {
         setFormData({ ...formData, image: res.data.images[0] }); // Access the first image from the array
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload image. Please check file size/format.");
    } finally {
      setUploadingImg(false);
    }
  };

  // ── Drag handlers ──────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    // ghost image styling
    (e.currentTarget as HTMLElement).style.opacity = "0.4";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    // clear hover highlight
    document.querySelectorAll("[data-drag-row]").forEach((el) => {
      (el as HTMLElement).style.borderTop = "";
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOverIndex.current = index;

    // visual drop indicator
    document.querySelectorAll("[data-drag-row]").forEach((el, i) => {
      (el as HTMLElement).style.borderTop = i === index ? "2px solid #e91e8c" : "";
    });
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;

    const updated = [...categories];
    const [moved] = updated.splice(from, 1);
    updated.splice(dropIndex, 0, moved);

    setCategories(updated);
    setIsDirty(true);
    setSaved(false);

    // clear visual
    document.querySelectorAll("[data-drag-row]").forEach((el) => {
      (el as HTMLElement).style.borderTop = "";
    });
  };

  // ── Save order to backend ───────────────────────────────

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      const orderedIds = categories.map((c) => c._id);
      await api.put("/categories/reorder", { orderedIds });
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Reorder Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = searchTerm
    ? categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : categories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Categories</h1>
          <p className="text-gray-500 text-sm">Organize your product catalogue · drag rows to reorder</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Save Order button — shows only when there are unsaved changes */}
          {isDirty && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-all shadow-md shadow-amber-200 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Order
            </button>
          )}
          {saved && !isDirty && (
            <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Order saved
            </span>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="bg-myntra-pink text-white px-6 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-lg shadow-pink-200 hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm transition-all focus:border-myntra-pink outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-100">
            {categories.length} Categories
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
                  <th className="px-3 py-4 w-8"></th>{/* grip */}
                  <th className="px-4 py-4 w-10 text-center text-gray-300">#</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat, index) => (
                  <tr
                    key={cat._id}
                    data-drag-row
                    draggable={!searchTerm}        // disable drag when filtering
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className="hover:bg-gray-50/70 transition-colors group"
                    style={{ cursor: searchTerm ? "default" : "grab" }}
                  >
                    {/* Grip handle */}
                    <td className="pl-4 pr-1 py-4">
                      <GripVertical
                        className={`h-4 w-4 transition-colors ${
                          searchTerm
                            ? "text-gray-200"
                            : "text-gray-300 group-hover:text-myntra-pink"
                        }`}
                      />
                    </td>
                    {/* Order number */}
                    <td className="px-2 py-4 text-center">
                      <span className="text-[11px] font-bold text-gray-300">{index + 1}</span>
                    </td>
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden flex-shrink-0">
                          {cat.image?.url ? (
                             <img src={cat.image.url} alt={cat.name} className="h-full w-full object-cover" />
                          ) : (
                             <FolderOpen className="h-5 w-5" />
                          )}
                        </div>
                        <p className="font-bold text-myntra-dark">{cat.name}</p>
                      </div>
                    </td>
                    {/* Slug */}
                    <td className="px-6 py-4">
                      <span className="text-gray-500 font-mono text-xs">{cat.slug}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-myntra-dark">
                {editingCategory ? "Update Category" : "New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                    Category Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                      setFormData({ ...formData, name, slug });
                    }}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none shadow-sm"
                    placeholder="e.g. Gold Bangles"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                    Slug (URL endpoint)
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none shadow-sm font-mono text-gray-500"
                    placeholder="auto-generated"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2 mt-4">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                    Category Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                     {formData.image?.url ? (
                       <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-200">
                         <img src={formData.image.url} className="h-full w-full object-cover" alt="Category" />
                         <button 
                           type="button"
                           onClick={() => setFormData({...formData, image: {url:"", public_id:""}})}
                           className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow hover:text-red-500 transition-colors"
                         >
                            <X className="h-3 w-3" />
                         </button>
                       </div>
                     ) : (
                       <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                         {uploadingImg ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                       </div>
                     )}
                     <div className="flex-grow">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-myntra-dark text-xs font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center w-fit gap-2 border border-gray-200 shadow-sm">
                           <Upload className="h-4 w-4" />
                           {uploadingImg ? "Uploading..." : "Upload Photo"}
                           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Recommended: Square format (e.g. 500x500px)</p>
                     </div>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-myntra-dark text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-[0.98]"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
