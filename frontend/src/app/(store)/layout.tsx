"use client";

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import GlobalPopup from "@/components/ui/GlobalPopup";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = useCartStore((state) => state.items);
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      syncWithBackend();
    }
  }, [items, user, syncWithBackend]);

  return (
    <>
      <Navbar />
      <GlobalPopup />
      <main className="pt-20 min-h-screen bg-white">
        {children}
      </main>
      <Footer />
    </>
  );
}
