"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, Bell, Zap, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/axios";
import { getImageUrl } from "@/lib/imageUtils";

export default function GlobalPopup() {
  const [popup, setPopup] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const res = await api.get("/popups/active");
        if (res.data.success && res.data.popup) {
          const p = res.data.popup;
          // Check if it's already shown in this session? 
          // For now, let's show it once per page load.
          setPopup(p);
          setTimeout(() => setIsVisible(true), 3000); // Delay for 3 seconds
        }
      } catch (err) {
        console.error("Fetch Active Popup Error:", err);
      }
    };

    fetchActivePopup();
  }, []);

  if (!popup) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
            className="absolute inset-0 bg-myntra-dark/70 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Image Section as Link */}
            {popup.imageUrl && (
              <div className="w-full aspect-[3/4] bg-gray-100 relative overflow-hidden group">
                <Link 
                  href={popup.link || "#"} 
                  onClick={() => setIsVisible(false)}
                  className="block w-full h-full"
                >
                  <img src={getImageUrl(popup.imageUrl)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Promotion" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </Link>
              </div>
            )}

            {/* Close Button */}
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-all text-white shadow-sm z-10"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
