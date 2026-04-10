"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/imageUtils";

interface HeroProps {
  slides: any[];
}

const Hero = ({ slides }: HeroProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <section className="relative w-full mt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="relative aspect-video w-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center">
              <h2 className="text-white text-2xl font-bold">Welcome to Bohuroopi</h2>
           </div>
        </div>
      </section>
    );
  }

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[current];

  return (
    <section className="relative w-full mt-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] shadow-xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {activeSlide.link ? (
                <Link href={activeSlide.link} className="block w-full h-full relative">
                  {activeSlide.imageUrl ? (
                    <img 
                      src={getImageUrl(activeSlide.imageUrl)} 
                      alt={activeSlide.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-myntra-pink to-purple-600" />
                  )}
                  {/* Subtle hover effect to indicate link */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </Link>
              ) : (
                <div className="w-full h-full">
                  {activeSlide.imageUrl ? (
                    <img 
                      src={getImageUrl(activeSlide.imageUrl)} 
                      alt={activeSlide.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-myntra-pink to-purple-600" />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {slides.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-myntra-dark z-20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-myntra-dark z-20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`h-1.5 transition-all rounded-full ${current === idx ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
