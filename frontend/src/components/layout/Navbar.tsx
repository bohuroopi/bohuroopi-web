"use client";

import Link from "next/link";
import { ShoppingBag, User, Heart, Menu, Loader2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/axios";
import LiveSearch from "@/components/ui/LiveSearch";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { totalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error("Navbar Settings Fetch Error:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-myntra-pink shadow-md h-[80px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mr-8">
            <Link href="/" className="flex items-center">
              <img 
                src={settings?.logoUrl || "/logo.png"} 
                alt={settings?.storeName || "BOHUROOPI"} 
                className="h-[45px]" 
              />
            </Link>
          </div>

          {/* Expanded Search Bar */}
          <div className="hidden md:flex flex-grow justify-center px-4 max-w-3xl">
             <LiveSearch />
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-6 ml-auto">
            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-white">
              <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Search Icon */}
            <Search className="h-5 w-5 text-white cursor-pointer block md:hidden" />

            <Link href="/profile" className="hidden sm:flex flex-col items-center justify-center space-y-1 hover:text-white transition-colors group">
              <User className="h-5 w-5 text-white" />
              <span className="text-[11px] font-bold text-white">Profile</span>
            </Link>

            <Link href="/wishlist" className="hidden sm:flex flex-col items-center justify-center space-y-1 hover:text-white transition-colors group">
              <Heart className="h-5 w-5 text-white" />
              <span className="text-[11px] font-bold text-white">Wishlist</span>
            </Link>

            <Link href="/cart" className="flex flex-col items-center justify-center space-y-1 hover:text-white transition-colors group relative">
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-white" />
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-1 -right-2 bg-white text-myntra-pink text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold shadow-sm">
                    {totalItems()}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-white hidden sm:block">Bag</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-myntra-pink border-t border-white/10 px-4 py-6 shadow-xl absolute w-full backdrop-blur-md"
        >
          <div className="flex flex-col space-y-2 text-[12px] font-black text-white uppercase tracking-widest px-2">
            <div className="py-4 border-b border-white/10 relative">
              <LiveSearch isMobile onClose={() => setIsMenuOpen(false)} />
            </div>
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="py-4 border-b border-white/10">Home</Link>
            <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="py-4 border-b border-white/10">Profile</Link>
            <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="py-4 border-b border-white/10">Wishlist</Link>
            <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="py-4">Bag</Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
