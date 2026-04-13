"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Tag, BarChart3, Settings, Menu, X, LogOut, CheckCircle, Undo2, ShieldCheck, XCircle, Image as ImageIcon, Bell, Monitor, Ticket, Gift, ShoppingBag, Send } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
   const router = useRouter();
   const pathname = usePathname();
   const [isClient, setIsClient] = useState(false);

   // Check if we are on the login page
   const isLoginPage = pathname === "/login";

   useEffect(() => {
      setIsClient(true);

      // Wait for hydration before acting on auth state
      if (isClient && _hasHydrated && !isLoginPage) {
         if (!isAuthenticated) {
            router.push("/login");
         } else if (user?.role !== 'super_admin' && user?.role !== 'sub_admin') {
            // If authenticated but not an admin, redirect to store home
            router.push("/");
         }
      }

      // Redirect to dashboard if already authenticated as admin and on the login page
      if (isClient && _hasHydrated && isLoginPage && isAuthenticated && (user?.role === 'super_admin' || user?.role === 'sub_admin')) {
         router.push("/admin");
      }

   }, [isClient, _hasHydrated, isAuthenticated, user, router, isLoginPage]);

   const handleLogout = () => {
      logout();
      router.push("/login");
   };

   const menuGroups = [
      {
         title: "Overview",
         items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/" },
         ]
      },
      {
         title: "Order Management",
         items: [
            { name: "Orders", icon: ShoppingCart, href: "/orders" },
            { name: "Cancel Requests", icon: XCircle, href: "/cancel-requests" },
            { name: "Return Requests", icon: Undo2, href: "/returns" },
         ]
      },
      {
         title: "Inventory",
         items: [
            { name: "Products", icon: Package, href: "/products" },
            { name: "Categories", icon: Tag, href: "/categories" },
         ]
      },
      {
         title: "Customer Relations",
         items: [
            { name: "Customers", icon: BarChart3, href: "/customers" },
         ]
      },
      {
         title: "Content Management",
         items: [
            { name: "Homepage", icon: Monitor, href: "/homepage" },
            { name: "Banners", icon: ImageIcon, href: "/banners" },
            { name: "Popups", icon: Bell, href: "/popups" },
         ]
      },
      {
         title: "Marketing",
         items: [
            { name: "Coupons", icon: Ticket, href: "/coupons" },
            { name: "Abandoned Carts", icon: ShoppingBag, href: "/abandoned-carts" },
            { name: "Campaigns", icon: Send, href: "/campaigns" },
         ]
      },
      {
         title: "Administration",
         items: [
            { name: "Admin Users", icon: ShieldCheck, href: "/admins" },
            { name: "Settings", icon: Settings, href: "/settings" },
         ]
      }
   ];


   if (!isClient) return null;

   // Render the login page without any layout
   if (isLoginPage) {
      return <>{children}</>;
   }

   return (
      <div className="min-h-screen bg-gray-50 flex font-sans text-myntra-dark">
         {/* Mobile Menu Overlay */}
         {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
               <div className="bg-myntra-dark w-72 h-full flex flex-col p-6 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-10">
                     <Link href="/admin" className="font-bold text-xl text-white">Bohuroopi <span className="text-myntra-pink">Admin</span></Link>
                     <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-myntra-pink">
                        <X className="h-6 w-6" />
                     </button>
                  </div>
                  <div className="flex-grow overflow-y-auto space-y-8 pr-2">
                     {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-3">
                           <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3">{group.title}</h4>
                           <div className="space-y-1">
                              {group.items
                                 .filter(item => {
                                    const isAdminPath = item.href === "/admin/admins";
                                    if (isAdminPath && user?.role !== 'super_admin') return false;
                                    return true;
                                 })
                                 .map(item => (
                                    <Link
                                       key={item.href}
                                       href={item.href}
                                       onClick={() => setIsMobileMenuOpen(false)}
                                       className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${pathname === item.href ? 'bg-myntra-pink text-white shadow-lg' : 'text-gray-400'}`}
                                    >
                                       <item.icon className="h-5 w-5" />
                                       <span className="text-[13px] font-bold">{item.name}</span>
                                    </Link>
                                 ))}
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="pt-6 border-t border-gray-800">
                     <button onClick={handleLogout} className="flex items-center space-x-4 p-3 text-red-400 w-full group">
                        <LogOut className="h-5 w-5" />
                        <span className="text-[14px] font-bold">Log Out</span>
                     </button>
                  </div>
               </div>
            </div>
         )}
         {/* Sidebar for Desktop */}
         <aside className={`bg-myntra-dark text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden`}>
            <div className="p-6 h-20 border-b border-gray-800 flex justify-between items-center shrink-0">
               <Link href="/admin" className={`font-bold text-xl tracking-tight text-white ${!isSidebarOpen && 'hidden'}`}>Bohuroopi <span className="text-myntra-pink">Admin</span></Link>
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:text-myntra-pink transition-colors ml-auto">
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
               </button>
            </div>

            <nav className="flex-grow py-4 px-4 space-y-6 overflow-y-auto custom-scrollbar">
               {menuGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                     {isSidebarOpen && (
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 px-3">
                           {group.title}
                        </h4>
                     )}
                     <div className="space-y-1">
                        {group.items
                           .filter(item => {
                              // Only super_admin can see Admin Users
                              const isAdminPath = item.href === "/admin/admins";
                              if (isAdminPath && user?.role !== 'super_admin') return false;
                              return true;
                           })
                           .map((item) => (
                              <Link
                                 key={item.href}
                                 href={item.href}
                                 onClick={() => setIsMobileMenuOpen(false)}
                                 className={`flex items-center space-x-4 p-3 rounded-xl transition-all group ${pathname === item.href
                                    ? 'bg-myntra-pink text-white shadow-lg shadow-pink-900/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                              >
                                 <item.icon className={`h-5 w-5 shrink-0 ${pathname === item.href ? 'text-white' : 'group-hover:text-myntra-pink transition-colors'}`} />
                                 <span className={`text-[13px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{item.name}</span>
                              </Link>
                           ))}
                     </div>
                     {groupIdx < menuGroups.length - 1 && !isSidebarOpen && <div className="h-px bg-gray-800 mx-2 my-4" />}
                  </div>
               ))}
            </nav>

            <div className="p-4 border-t border-gray-800 shrink-0">
               <button onClick={handleLogout} className="flex items-center space-x-4 p-3 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all w-full group">
                  <LogOut className="h-5 w-5" />
                  <span className={`text-[14px] font-bold ${!isSidebarOpen && 'hidden'}`}>Log Out</span>
               </button>
            </div>
         </aside>

         {/* Main Content Area */}
         <div className="flex-grow flex flex-col min-w-0">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
               <div className="flex items-center space-x-4">
                  <button
                     onClick={() => setIsMobileMenuOpen(true)}
                     className="md:hidden text-myntra-dark p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                     <Menu className="h-6 w-6" />
                  </button>
               </div>

               <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                     <p className="text-[14px] font-bold text-myntra-dark">{user?.name || "Admin User"}</p>
                     <p className="text-[12px] text-emerald-500 font-bold flex items-center justify-end"><CheckCircle className="h-3 w-3 mr-1" /> Active</p>
                  </div>
                  <div className="h-10 w-10 text-[18px] font-bold rounded-full bg-myntra-pink text-white flex items-center justify-center">
                     {user?.name?.[0]?.toUpperCase() || "A"}
                  </div>
               </div>
            </header>

            <main className="p-4 sm:p-8 flex-grow">
               {children}
            </main>
         </div>
      </div>
   );
}
