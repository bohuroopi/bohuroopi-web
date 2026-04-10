"use client";

import { useState, useEffect, useRef } from "react";
import Hero from "@/components/ui/Hero";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { Loader2, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { getImageUrl } from "@/lib/imageUtils";

export default function Home() {
  const [allSections, setAllSections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, categoriesRes] = await Promise.all([
          api.get("/homepage"),
          api.get("/categories")
        ]);

        if (sectionsRes.data.success) {
          setAllSections(sectionsRes.data.sections);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
      </div>
    );
  }

  // Filter sections by type
  const heroSlides = allSections.filter(s => s.type === 'hero' && s.isActive);
  const displaySections = allSections.filter(s => s.type !== 'hero' && s.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* 1. Hero Banner (Dynamic) */}
      <Hero slides={heroSlides} />

      {/* 2. Static Shop By Category Header & Grid (Can be made dynamic too) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-black text-myntra-dark tracking-[0.2em] uppercase leading-none">Shop By Category</h2>
            <div className="h-1 w-20 bg-myntra-pink mt-3 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-10 pb-6 scrollbar-hide py-4 font-sans uppercase tracking-[0.1em] font-black text-gray-500">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/category/${cat.slug}`}>
              <motion.div whileHover={{ y: -8 }} className="flex flex-col items-center group min-w-[110px] cursor-pointer">
                <div className="h-28 w-28 rounded-full border-[3px] border-pink-50 p-1 group-hover:border-myntra-pink transition-all shadow-sm bg-white overflow-hidden flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-pink-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-full w-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center text-gray-300">
                    {cat.image?.url ? (
                      <img src={cat.image.url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
                    ) : (
                      <span className="text-3xl font-bold uppercase">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-[11px] font-black text-myntra-dark text-center w-full truncate px-2 group-hover:text-myntra-pink transition-colors">{cat.name}</h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Dynamic CMS Sections (Mixed Types) */}
      <div className="flex flex-col gap-24">
        {displaySections.map((section) => (
          <div key={section._id}>
            {section.type === 'products' ? (
              <DynamicSlider section={section} />
            ) : section.type === 'banner' ? (
              <HomeBanner banner={section} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline Banner Component
function HomeBanner({ banner }: { banner: any }) {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full group">
       <Link href={banner.link || "/"}>
          <div className="relative aspect-[3/1] w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:scale-[1.01] duration-500">
            {banner.imageUrl ? (
              <img src={getImageUrl(banner.imageUrl)} alt={banner.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-gray-100 to-gray-200" />
            )}
          </div>
       </Link>
    </section>
  );
}

// Sub-component for dynamic product sliders
function DynamicSlider({ section }: { section: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (section.selectionType === 'category') {
          params.categories = section.items.join(',');
        } else {
          params.ids = section.items.join(',');
        }
        
        const res = await api.get("/products", { params });
        if (res.data.success) {
          // Maintain manual order if manual selection
          if (section.selectionType === 'manual') {
            const sorted = section.items.map((id: string) => 
              res.data.products.find((p: any) => p._id === id)
            ).filter(Boolean);
            setProducts(sorted);
          } else {
            setProducts(res.data.products);
          }
        }
      } catch (err) {
        console.error("Slider Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (section.items?.length > 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [section]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full group/slider">
       <div className="flex justify-between items-end mb-8">
          <div className="max-w-xl">
             <h2 className="text-2xl font-black text-myntra-dark tracking-tighter uppercase leading-none">{section.title}</h2>
             <div className="h-1 w-20 bg-myntra-pink mt-3 rounded-full"></div>
             {section.subtitle && (
               <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mt-3">{section.subtitle}</p>
             )}
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover/slider:opacity-100 transition-opacity hidden sm:flex">
             <button onClick={() => scroll('left')} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition-all shadow-sm">
                <ChevronLeft className="h-4 w-4" />
             </button>
             <button onClick={() => scroll('right')} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition-all shadow-sm">
                <ChevronRight className="h-4 w-4" />
             </button>
          </div>
       </div>

       <div className="relative">
          {loading ? (
             <div className="h-40 flex items-center justify-center bg-gray-50 rounded-3xl">
                <Loader2 className="h-6 w-6 animate-spin text-myntra-pink" />
             </div>
          ) : (
             <div 
               ref={scrollRef}
               className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide py-2"
             >
                {products.map((p) => (
                   <div key={p._id} className="w-[180px] sm:w-[220px] md:w-[250px] lg:w-[300px] shrink-0">
                      <ProductCard product={p} />
                   </div>
                ))}
             </div>
          )}
       </div>
    </section>
  );
}
