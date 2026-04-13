"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { getImageUrl } from "@/lib/imageUtils";

interface LiveSearchProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function LiveSearch({ isMobile, onClose }: LiveSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setIsOpen(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(debouncedQuery)}`);
        if (res.data.success) {
          setResults(res.data.products.slice(0, 5)); // Limit recommendations to 5
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleProductClick = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className={`w-full relative bg-white/10 rounded-2xl flex items-center overflow-hidden border border-white/20 backdrop-blur-md shadow-inner ${isMobile ? '' : ''}`}>
        <button type="submit" className={`absolute ${isMobile ? 'right-4 top-1/2 -translate-y-1/2' : 'left-5 z-10'}`}>
          <Search className="h-4 w-4 text-white/70 hover:text-white transition-colors" />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder={isMobile ? "Search products..." : "Search for premium jewellery, collections and more..."}
          className={`w-full bg-transparent outline-none text-white placeholder:text-white/60 font-medium tracking-wide ${isMobile ? 'py-3 pl-4 pr-10 rounded-xl text-[12px]' : 'py-3.5 pl-14 pr-5 text-[13px]'}`}
        />
      </form>

      {/* Dropdown Results */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[400px] flex flex-col">
          {loading ? (
            <div className="p-6 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-myntra-pink" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              <div className="overflow-y-auto w-full">
                {results.map((product) => (
                  <Link 
                    href={`/product/${product.slug}`} 
                    key={product._id}
                    onClick={handleProductClick}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {product.images?.[0] ? (
                        <img src={getImageUrl(product.images[0].url)} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-300">
                           <Search className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] font-bold text-myntra-dark truncate">{product.name}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{product.category?.name || "Product"}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); handleSubmit(); }}
                className="w-full p-3 text-center text-[11px] font-black uppercase text-myntra-pink hover:bg-pink-50 transition-colors tracking-widest border-t border-gray-100"
              >
                See All Results
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-[13px] font-bold text-gray-500">No matching pieces found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
