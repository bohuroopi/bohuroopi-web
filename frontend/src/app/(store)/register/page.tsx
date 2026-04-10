"use client";

import { useState } from "react";
import { Lock, Mail, User, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function Register() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/users/register", { 
        name: formData.name,
        email: formData.email, 
        password: formData.password 
      });
      
      if (response.data.success) {
        setAuth(
          { 
            _id: response.data._id, 
            name: response.data.name, 
            email: response.data.email, 
            role: response.data.role 
          }, 
          response.data.token
        );
        router.push("/");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-myntra-light-gray">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full space-y-8 bg-white p-12 border border-gray-100 shadow-sm rounded-3xl relative"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-myntra-dark">Create Account</h2>
          <p className="text-gray-500 text-[14px]">Join Bohuroopi to start shopping</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name" 
                className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-3 outline-none focus:border-myntra-pink text-[14px] font-sans"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address" 
                className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-3 outline-none focus:border-myntra-pink text-[14px] font-sans"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password" 
                className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-3 outline-none focus:border-myntra-pink text-[14px] font-sans"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
              <input 
                type="password" 
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password" 
                className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-3 outline-none focus:border-myntra-pink text-[14px] font-sans"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="accent-myntra-pink h-4 w-4" 
              />
              <span className="text-[12px] font-bold text-gray-500 hover:text-myntra-dark transition-colors">
                 I agree to the <span className="text-myntra-pink hover:underline">Terms of Service</span> and <span className="text-myntra-pink hover:underline">Privacy Policy</span>
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
               <input type="checkbox" className="accent-myntra-pink h-4 w-4" />
               <span className="text-[12px] font-bold text-gray-500 hover:text-myntra-dark transition-colors">
                  Join the newsletter for exclusive member-only offers
               </span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full myntra-pink-btn py-4 uppercase font-bold text-[14px] rounded-xl shadow-sm flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {loading && <Loader2 className="h-4 w-4 animate-spin" />}
             <span>{loading ? 'Creating Account...' : 'Create My Account'}</span>
          </button>
        </form>

        <div className="pt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-[12px] text-gray-500 font-bold">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Encrypted & Private</span>
            </div>
            <p className="mt-8 text-[14px] text-gray-500">
               Already have an account? <Link href="/login" className="text-myntra-pink font-bold hover:underline ml-1">Sign In Here</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
