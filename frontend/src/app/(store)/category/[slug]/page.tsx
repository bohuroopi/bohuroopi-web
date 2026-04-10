"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Filter, SlidersHorizontal, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch all categories to find the one matching the slug (to get its name/image)
        const catRes = await api.get("/categories");
        const foundCat = catRes.data.categories.find((c: any) => c.slug === slug);
        
        if (!foundCat) {
          setError("Category not found");
          setLoading(false);
          return;
        }
        setCategory(foundCat);

        // 2. Fetch products for this category slug
        const prodRes = await api.get(`/products?category=${slug}`);
        if (prodRes.data.success) {
          setProducts(prodRes.data.products);
        }
      } catch (err: any) {
        console.error("Category Fetch Error:", err);
        setError("Failed to load products for this category.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
        <p className="mt-4 font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Loading Collection...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-black text-myntra-dark mb-4">{error || "COLLECTION NOT FOUND"}</h2>
        <Link href="/" className="myntra-pink-btn px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[11px]">
           Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
           <div className="flex items-center space-x-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
              <Link href="/" className="hover:text-myntra-pink transition-colors">Home</Link>
              <span>/</span>
              <span className="text-myntra-dark">{category.name}</span>
           </div>
           <div>
             <h1 className="text-4xl md:text-5xl font-black text-myntra-dark tracking-tighter uppercase leading-none">{category.name}</h1>
             <div className="h-1.5 w-24 bg-myntra-pink mt-4 rounded-full"></div>
           </div>
           {category.description && (
             <p className="text-gray-500 max-w-2xl font-medium text-[15px] leading-relaxed italic">
               "{category.description}"
             </p>
           )}
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[12px] font-black text-myntra-dark uppercase tracking-widest border border-gray-200 px-5 py-3 rounded-xl hover:border-myntra-pink cursor-pointer transition-all group">
               <SlidersHorizontal className="h-4 w-4 text-myntra-pink" />
               <span>Sort By: Newest</span>
            </div>
            <div className="flex items-center space-x-2 text-[12px] font-black text-myntra-dark uppercase tracking-widest border border-gray-200 px-5 py-3 rounded-xl hover:border-myntra-pink cursor-pointer transition-all">
               <Filter className="h-4 w-4 text-myntra-pink" />
               <span>Filters</span>
            </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 flex items-center justify-between">
          <p className="text-[13px] font-bold text-gray-400">Showing <span className="text-myntra-dark font-black">{products.length}</span> stunning pieces</p>
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="wait">
        {products.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10"
          >
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-gray-50 rounded-[3rem]"
          >
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm">
               <ShoppingBag className="h-10 w-10 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-myntra-dark uppercase tracking-tight">No pieces found here</h3>
              <p className="text-gray-400 font-medium text-[14px]">We are currently crafting new designs for this collection.</p>
            </div>
            <Link href="/" className="myntra-btn-outline px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest">
               Explore Collections
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
