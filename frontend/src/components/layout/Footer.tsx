"use client";

import Link from "next/link";
import { MessageCircle, Camera, Forward, CheckCircle2, RefreshCw, Play } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const Footer = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, setRes] = await Promise.all([
          api.get("/categories"),
          api.get("/settings")
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.categories.slice(0, 6));
        }
        if (setRes.data.success) {
          setSettings(setRes.data.settings);
        }
      } catch (err) {
        console.error("Footer Fetch Error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="bg-[#FAFBFC] border-t border-gray-200 pt-16 pb-8 text-myntra-dark">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Quick Links 1 - Dynamic Categories */}
          <div>
            <h4 className="font-bold mb-4 uppercase text-[11px] tracking-wide text-myntra-dark underline decoration-myntra-pink underline-offset-4">Online Shopping</h4>
            <ul className="space-y-2 text-[13px] text-myntra-gray">
              {categories.map((cat) => (
                <li key={cat._id}><Link href={`/category/${cat.slug}`} className="hover:text-myntra-pink transition-colors capitalize">{cat.name}</Link></li>
              ))}
              <li><Link href="/" className="hover:text-myntra-pink transition-colors font-bold">Shop All</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="font-bold mb-4 uppercase text-[11px] tracking-wide text-myntra-dark">Customer Policies</h4>
            <ul className="space-y-2 text-[13px] text-myntra-gray">
              <li><Link href="/contact" className="hover:font-bold">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:font-bold">FAQ</Link></li>
              <li><Link href="/tac" className="hover:font-bold">T&C</Link></li>
              <li><Link href="/terms" className="hover:font-bold">Terms Of Use</Link></li>
              <li><Link href="/track-order" className="hover:font-bold">Track Orders</Link></li>
              <li><Link href="/shipping" className="hover:font-bold">Shipping</Link></li>
              <li><Link href="/cancellation" className="hover:font-bold">Cancellation</Link></li>
              <li><Link href="/returns" className="hover:font-bold">Returns</Link></li>
            </ul>
          </div>

          {/* Badges */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start space-x-4">
               <div><CheckCircle2 className="h-10 w-10 text-myntra-dark" /></div>
               <div>
                  <p className="text-[14px]">
                     <span className="font-bold">100% ORIGINAL</span> guarantee for all products at {settings?.storeName || 'bohuroopi.com'}
                  </p>
               </div>
            </div>
            <div className="flex items-start space-x-4">
               <div><RefreshCw className="h-10 w-10 text-myntra-dark" /></div>
               <div>
                  <p className="text-[14px]">
                     <span className="font-bold">Return within 14days</span> of receiving your order
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Socials & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
            <div className="flex space-x-4 items-center">
              <span className="text-[12px] font-bold text-myntra-dark">KEEP IN TOUCH</span>
              {settings?.socialLinks?.instagram && (
                <Link href={settings.socialLinks.instagram} target="_blank"><Camera className="h-5 w-5 text-myntra-gray hover:text-myntra-dark cursor-pointer" /></Link>
              )}
              {settings?.socialLinks?.facebook && (
                <Link href={settings.socialLinks.facebook} target="_blank"><MessageCircle className="h-5 w-5 text-myntra-gray hover:text-myntra-dark cursor-pointer" /></Link>
              )}
              {settings?.socialLinks?.twitter && (
                <Link href={settings.socialLinks.twitter} target="_blank"><Forward className="h-5 w-5 text-myntra-gray hover:text-myntra-dark cursor-pointer" /></Link>
              )}
              {settings?.socialLinks?.youtube && (
                <Link href={settings.socialLinks.youtube} target="_blank"><Play className="h-5 w-5 text-myntra-gray hover:text-myntra-dark cursor-pointer" /></Link>
              )}
            </div>
           <div className="mt-4 md:mt-0 text-[13px] text-myntra-gray text-center">
              © 2026 {settings?.storeName || 'www.bohuroopi.com'}. All rights reserved.
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
