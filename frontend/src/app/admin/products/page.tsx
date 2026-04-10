"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Search, X, Loader2, Tag } from "lucide-react";
import api from "@/lib/axios";

const PRESET_OCCASIONS = [
  "Bridal", "Party", "Casual", "Festive", "Engagement", "Office Wear", "Gifting",
];

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    shortDescription: "",
    images: [] as { url: string; public_id: string }[],
    price: 0,
    discountPrice: 0,
    longDescription: "",
    weight: "",
    primaryMaterial: "",
    colorFinish: "",
    occasion: [] as string[],
  });

  const [uploading, setUploading] = useState(false);

  // Custom occasion input
  const [occasionInput, setOccasionInput] = useState("");
  const occasionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const blankForm = () => ({
    name: "",
    slug: "",
    category: "",
    shortDescription: "",
    images: [] as { url: string; public_id: string }[],
    price: 0,
    discountPrice: 0,
    longDescription: "",
    weight: "",
    primaryMaterial: "",
    colorFinish: "",
    occasion: [] as string[],
  });

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name ?? "",
        slug: product.slug ?? "",
        category: product.category?._id ?? "",
        shortDescription: product.shortDescription ?? product.description ?? "",
        images: product.images ?? [],
        price: product.price ?? 0,
        discountPrice: product.discountPrice ?? 0,
        longDescription: product.longDescription ?? "",
        weight: product.weight ?? "",
        primaryMaterial: product.primaryMaterial ?? "",
        colorFinish: product.colorFinish ?? "",
        occasion: product.occasion ?? [],
      });
    } else {
      setEditingProduct(null);
      setFormData(blankForm());
    }
    setOccasionInput("");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) data.append("images", files[i]);
    try {
      setUploading(true);
      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.data.images],
        }));
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const imgs = [...prev.images];
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  const toggleOccasion = (tag: string) => {
    setFormData((prev) => {
      const arr = [...prev.occasion];
      const idx = arr.indexOf(tag);
      if (idx > -1) arr.splice(idx, 1);
      else arr.push(tag);
      return { ...prev, occasion: arr };
    });
  };

  const addCustomOccasion = () => {
    const val = occasionInput.trim();
    if (!val) return;
    if (!formData.occasion.includes(val)) {
      setFormData((prev) => ({ ...prev, occasion: [...prev.occasion, val] }));
    }
    setOccasionInput("");
    occasionInputRef.current?.focus();
  };

  const handleOccasionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomOccasion();
    }
  };

  const removeOccasion = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      occasion: prev.occasion.filter((o) => o !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post("/products", formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Product Management</h1>
          <p className="text-gray-500 text-sm">Manage all your products here.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-myntra-pink text-white px-6 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-lg shadow-pink-200 hover:scale-105 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm transition-all focus:border-myntra-pink outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-gray-100">
            Total: {products.length} Items
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
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Pricing</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl border border-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold overflow-hidden shadow-sm">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} className="h-full w-full object-cover" alt={product.name} />
                          ) : (
                            "IMG"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-myntra-dark truncate text-sm">{product.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">
                            SLUG: {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-100">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-myntra-dark">₹{product.price}</span>
                        {product.discountPrice > 0 && (
                          <span className="text-[10px] text-gray-400 line-through italic">
                            MRP: ₹{product.discountPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-blue-100/10"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-100/10"
                          title="Delete"
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
        <div className="fixed inset-0 bg-myntra-dark/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">

            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-lg z-10">
              <div>
                <h2 className="text-2xl font-bold text-myntra-dark tracking-tight">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Fill in all sections to publish this item to the catalogue.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-myntra-dark"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-12 pb-12">

              {/* ── 01. Basic Information ── */}
              <section className="space-y-6">
                <div className="border-l-4 border-myntra-pink pl-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-myntra-dark">
                    01. Basic Information
                  </h3>
                </div>

                {/* Row 1: Display Name + Slug */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Display Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                        setFormData((prev) => ({ ...prev, name, slug }));
                      }}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                      placeholder="e.g. Diamond Studded Gold Bangle"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      URL Identifier (Slug)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        }))
                      }
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none transition-all font-mono placeholder:text-gray-300"
                      placeholder="diamond-gold-bangle"
                    />
                  </div>
                </div>

                {/* Row 2: Category */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none appearance-none bg-white font-medium text-gray-700"
                  >
                    <option value="">Choose Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Short Description */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Product Short Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none resize-none transition-all placeholder:text-gray-300"
                    placeholder="e.g. Premium Handcrafted Series..."
                  />
                </div>
              </section>

              {/* ── 02. Media Assets ── */}
              <section className="space-y-6">
                <div className="border-l-4 border-myntra-pink pl-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-myntra-dark">
                    02. Media Assets
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm"
                    >
                      <img src={img.url} className="h-full w-full object-cover" alt={`Product image ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label
                    className={`relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-myntra-pink hover:bg-pink-50/30 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-myntra-pink" />
                    ) : (
                      <>
                        <Plus className="h-8 w-8 text-gray-300 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">Add Photo</span>
                      </>
                    )}
                    <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
              </section>

              {/* ── 03. Pricing & Variants ── */}
              <section className="space-y-6">
                <div className="border-l-4 border-myntra-pink pl-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-myntra-dark">
                    03. Pricing &amp; Variants
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Base Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none text-lg font-bold placeholder:text-gray-300"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Discounted Price (Optional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.discountPrice || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, discountPrice: Number(e.target.value) }))
                      }
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none text-gray-500 placeholder:text-gray-300"
                      placeholder="Leave blank if no discount"
                    />
                  </div>
                </div>
              </section>

              {/* ── 04. Advance Information ── */}
              <section className="space-y-6">
                <div className="border-l-4 border-myntra-pink pl-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-myntra-dark">
                    04. Advance Information
                  </h3>
                </div>

                {/* Long Description */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Product Long Description
                  </label>
                  <textarea
                    rows={5}
                    value={formData.longDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, longDescription: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none resize-none transition-all placeholder:text-gray-300"
                    placeholder="Describe the material, craftsmanship, and story of this piece..."
                  />
                </div>

                {/* Weight + Primary Material + Color/Finish */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Product Weight
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                      placeholder="e.g. 12g"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Primary Material
                    </label>
                    <input
                      type="text"
                      value={formData.primaryMaterial}
                      onChange={(e) => setFormData((prev) => ({ ...prev, primaryMaterial: e.target.value }))}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                      placeholder="e.g. Handmade"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Color / Finish
                    </label>
                    <input
                      type="text"
                      value={formData.colorFinish}
                      onChange={(e) => setFormData((prev) => ({ ...prev, colorFinish: e.target.value }))}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                      placeholder="e.g. Premium Silver"
                    />
                  </div>
                </div>

                {/* Occasion — choose or add */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Occasion (Tag)
                  </label>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-2">
                    {PRESET_OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => toggleOccasion(occ)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                          formData.occasion.includes(occ)
                            ? "bg-myntra-pink text-white border-myntra-pink"
                            : "bg-white text-gray-400 border-gray-200 hover:border-myntra-pink hover:text-myntra-pink"
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>

                  {/* Custom add row */}
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input
                        ref={occasionInputRef}
                        type="text"
                        value={occasionInput}
                        onChange={(e) => setOccasionInput(e.target.value)}
                        onKeyDown={handleOccasionKeyDown}
                        className="w-full border-2 border-gray-100 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                        placeholder="e.g. Bridal — press Enter or click Add"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addCustomOccasion}
                      className="px-5 py-3 bg-myntra-pink text-white rounded-xl text-[12px] font-bold hover:bg-opacity-90 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected tags (including custom) */}
                  {formData.occasion.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.occasion.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeOccasion(tag)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Submit */}
              <div className="pt-4 sticky bottom-0 bg-white/90 backdrop-blur-md pb-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-myntra-dark text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 text-[14px]"
                >
                  {editingProduct ? "Update Product" : "Publish to Catalogue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
