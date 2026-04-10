import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  discountPrice?: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        const items = get().items;
        if (!items.find((i) => i._id === item._id)) {
          // Update local state first for immediate UI feedback
          set({ items: [...items, item] });
          
          // Sync with backend if authenticated
          if (useAuthStore.getState().isAuthenticated) {
            try {
              await api.post(`/users/wishlist/${item._id}`);
            } catch (error) {
              console.error("Failed to sync wishlist addition:", error);
            }
          }
        }
      },
      removeItem: async (id) => {
        // Update local state first
        set({
          items: get().items.filter((i) => i._id !== id),
        });

        // Sync with backend if authenticated
        if (useAuthStore.getState().isAuthenticated) {
          try {
            await api.delete(`/users/wishlist/${id}`);
          } catch (error) {
            console.error("Failed to sync wishlist removal:", error);
          }
        }
      },
      isInWishlist: (id) => {
          return get().items.some(i => i._id === id);
      },
      fetchWishlist: async () => {
        if (useAuthStore.getState().isAuthenticated) {
          try {
            const res = await api.get("/users/wishlist");
            if (res.data.success) {
              // The backend returns populated products
              const backendItems: WishlistItem[] = res.data.wishlist.map((p: any) => ({
                _id: p._id,
                name: p.name,
                price: p.price,
                discountPrice: p.discountPrice,
                image: p.images?.[0]?.url || "placeholder",
                slug: p.slug
              }));
              set({ items: backendItems });
            }
          } catch (error) {
            console.error("Failed to fetch wishlist:", error);
          }
        }
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "bohuroopi-wishlist",
    }
  )
);
