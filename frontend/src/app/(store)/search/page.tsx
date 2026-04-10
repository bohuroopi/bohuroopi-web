"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, Filter, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!query.trim()) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const res = await api.get(`/products?search=${encodeURIComponent(query)}`);
        
        if (res.data.success) {
          setProducts(res.data.products);
        } else {
           setError("Failed to load search results.");
        }
      } catch (err: any) {
        console.error("Search Fetch Error:", err);
        setError("Error fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
           <div className="flex items-center space-x-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
              <Link href="/" className="hover:text-myntra-pink transition-colors">Home</Link>
              <span>/</span>
              <span className="text-myntra-dark">Search</span>
           </div>
           <div>
             <h1 className="text-3xl md:text-5xl font-black text-myntra-dark tracking-tighter leading-none">
                {query ? (
                  <>Results for <span className="text-myntra-pink">"{query}"</span></>
                ) : (
                  "Search"
                )}
             </h1>
             <div className="h-1.5 w-24 bg-myntra-pink mt-4 rounded-full"></div>
           </div>
        </div>
        
        {products.length > 0 && (
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
        )}
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
           <p className="mt-4 font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Searching Catalogue...</p>
        </div>
      ) : error ? (
         <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-2xl font-black text-myntra-dark mb-4">{error}</h2>
        </div>
      ) : (
        <>
          {/* Results Count */}
          {query && (
            <div className="mb-8 flex items-center justify-between">
                <p className="text-[13px] font-bold text-gray-400">Found <span className="text-myntra-dark font-black">{products.length}</span> stunning pieces</p>
            </div>
          )}

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
            ) : query ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-gray-50 rounded-[3rem]"
              >
                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                   <Search className="h-10 w-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-myntra-dark uppercase tracking-tight">No Exact Matches</h3>
                  <p className="text-gray-400 font-medium text-[14px]">We couldn't find anything matching "{query}". Try different keywords.</p>
                </div>
                <Link href="/" className="myntra-btn-outline px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest">
                   Explore All Collections
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-gray-50 rounded-[3rem]"
              >
                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                   <Search className="h-10 w-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-myntra-dark uppercase tracking-tight">What are you looking for?</h3>
                  <p className="text-gray-400 font-medium text-[14px]">Start typing above to search our premium collection.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
       </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
