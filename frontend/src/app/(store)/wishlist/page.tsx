"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { Trash2, Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { items, removeItem, fetchWishlist } = useWishlistStore();
  const { addItem: addCartItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     setMounted(true);
     fetchWishlist();
  }, [fetchWishlist]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-6">
        <div className="flex justify-center">
            <Heart className="h-24 w-24 text-gray-200" />
        </div>
        <h1 className="text-2xl font-bold text-myntra-dark">Your wishlist is lonely and looking for love.</h1>
        <p className="text-myntra-gray max-w-sm mx-auto text-[14px]">Add elements that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
        <Link href="/" className="inline-flex border border-myntra-pink text-myntra-pink font-bold px-12 py-4 rounded-xl shadow-sm mt-4 hover:bg-pink-50 transition-colors">
           CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-[14px] text-myntra-dark font-bold mb-6">
           <Heart className="h-5 w-5 text-myntra-pink" />
           <span>My Wishlist</span>
           <span className="text-gray-400 font-normal">({items.length} Items)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden group">
                    <div className="relative h-64 w-full bg-myntra-light-gray overflow-hidden">
                        <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                        <button 
                            onClick={() => removeItem(item._id)} 
                            className="absolute top-2 right-2 h-8 w-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-4 bg-white space-y-2">
                        <h3 className="font-bold text-[14px] text-myntra-dark truncate">{item.name}</h3>
                        <div className="font-bold text-[14px] text-myntra-dark">₹{item.price}</div>
                        <button 
                            onClick={() => {
                                addCartItem({ ...item, quantity: 1, color: "Standard", size: "Standard" });
                                removeItem(item._id);
                            }}
                            className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-myntra-pink font-bold py-2 rounded-md hover:border-myntra-pink transition-colors text-[14px]"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span>MOVE TO BAG</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
