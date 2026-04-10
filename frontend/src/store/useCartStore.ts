import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  mrp: number;
  slug: string;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalMRP: () => number;
  totalDiscount: () => number;
  totalPrice: () => number; // this will be Subtotal
  syncWithBackend: () => Promise<void>;
  
  // Coupon State
  appliedCoupon: { code: string, discountAmount: number } | null;
  applyCouponCode: (coupon: { code: string, discountAmount: number }) => void;
  removeCouponCode: () => void;
  
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i._id === item._id && i.color === item.color && i.size === item.size
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i._id === item._id && i.color === item.color && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id, color) => {
        set({
          items: get().items.filter((i) => !(i._id === id && i.color === color)),
        });
      },
      updateQuantity: (id, quantity, color) => {
        set({
          items: get().items.map((i) =>
            i._id === id && i.color === color ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalMRP: () => get().items.reduce((acc, item) => acc + (item.mrp || item.price) * item.quantity, 0),
      totalDiscount: () => get().items.reduce((acc, item) => acc + ((item.mrp || item.price) - item.price) * item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      syncWithBackend: async () => {
        try {
          const items = get().items;
          const cartData = items.map(item => ({
            product: item._id,
            qty: item.quantity,
            color: item.color,
            size: item.size,
            mrp: item.mrp,
            slug: item.slug
          }));
          
          // Only sync if axios is authorized (token exists)
          // We can check this via useAuthStore or just try the request
          const { default: api } = await import("@/lib/axios");
          await api.post("/users/cart-sync", { cart: cartData });
        } catch (err) {
          console.error("Cart sync failed:", err);
        }
      },
      
      appliedCoupon: null,
      applyCouponCode: (coupon) => set({ appliedCoupon: coupon }),
      removeCouponCode: () => set({ appliedCoupon: null }),
      
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "bohuroopi-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
