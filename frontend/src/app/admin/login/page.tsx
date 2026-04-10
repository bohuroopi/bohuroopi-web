"use client";

import { useState } from "react";
import { Lock, Mail, Loader2, ShieldCheck, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function AdminLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/users/admin/login", { email, password });
      
      if (response.data.success) {
        setAuth(
          { 
            _id: response.data._id, 
            name: response.data.name, 
            email: response.data.email
          } as AuthUser, 
          response.data.token
        );
        router.push("/"); // Redirect to admin dashboard
      } else {

        setError(response.data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden font-sans">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-myntra-pink/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-myntra-pink/20 rounded-2xl mb-2">
            <ShieldCheck className="h-10 w-10 text-myntra-pink" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 text-sm">Secure access for Bohuroopi administrators</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm text-center font-medium mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-myntra-pink transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bohuroopi.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-myntra-pink text-white text-[15px] transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Secret Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-myntra-pink transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-myntra-pink text-white text-[15px] transition-all placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-myntra-pink hover:bg-[#f72c5c] text-white py-5 rounded-2xl font-bold text-[15px] transition-all border-none active:scale-[0.98] shadow-lg shadow-myntra-pink/20 flex items-center justify-center space-x-3 disabled:opacity-50"
          >
             {loading ? (
               <Loader2 className="h-5 w-5 animate-spin" />
             ) : (
               <span>Authorize Access</span>
             )}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-white/5 pt-8">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Systems Status: <span className="text-emerald-500">Online</span></p>
        </div>
      </motion.div>
    </div>
  );
}
