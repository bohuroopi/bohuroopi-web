"use client";

import { useState } from "react";
import { Phone, Lock, Loader2, ArrowRight, Mail, UserCircle, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const setAuth = useAuthStore((state) => state.setAuth);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Profile Completion
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/users/login-otp", { phone, otp });
      
      if (response.data.success) {
        setAuth(
          { 
            _id: response.data._id, 
            name: response.data.name, 
            phone: response.data.phone, 
            email: response.data.email
          } as AuthUser, 
          response.data.token
        );
        
        if (response.data.isNewUser) {
           setStep(3);
        } else {
           await useWishlistStore.getState().fetchWishlist();
           router.push(redirect); 
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Use 123456.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.put("/users/profile", { name: userName, email: userEmail });
      
      if (response.data.success) {
        setAuth(
          { 
            _id: response.data._id, 
            name: response.data.name, 
            phone: response.data.phone, 
            email: response.data.email 
          } as AuthUser, 
          response.data.token
        );
        await useWishlistStore.getState().fetchWishlist();
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-myntra-pink via-purple-500 to-blue-500"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 border border-gray-100 rounded-[2.5rem] shadow-xl relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-4">
             {step === 3 ? (
                <UserCircle className="h-8 w-8 text-myntra-pink" />
             ) : (
                <Phone className="h-8 w-8 text-myntra-pink" />
             )}
          </div>
          <h2 className="text-3xl font-black text-myntra-dark tracking-tight">
            {step === 1 ? "Welcome Back" : step === 2 ? "Verify Number" : "Last Step!"}
          </h2>
          <p className="text-gray-400 text-[14px] font-medium">
            {step === 1 
               ? "Login with your phone number" 
               : step === 2
                 ? `Enter the 6-digit code sent to ${phone}`
                 : "Tell us a bit about yourself"}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 text-red-600 p-4 rounded-xl text-xs text-center font-bold border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {step === 1 ? (
               <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 border-r border-gray-200 pr-3 mr-3">
                       <span className="text-[14px] font-bold text-gray-500">+91</span>
                    </div>
                    <input 
                      type="tel" 
                      value={phone}
                      maxLength={10}
                      required
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="Phone Number" 
                      className="w-full border-2 border-gray-100 rounded-2xl py-4 pl-20 pr-4 outline-none focus:border-myntra-pink text-[15px] font-bold tracking-wider transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full bg-myntra-dark hover:bg-black text-white py-5 uppercase font-black text-[14px] rounded-2xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                     {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                           <span>Send Verification Code</span>
                           <ArrowRight className="h-5 w-5" />
                        </>
                     )}
                  </button>
               </form>
            ) : step === 2 ? (
               <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
                    <input 
                      type="text" 
                      value={otp}
                      maxLength={6}
                      required
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit OTP" 
                      className="w-full border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-myntra-pink text-[15px] font-bold tracking-[0.5em] transition-all text-center"
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                     <button 
                       type="submit"
                       disabled={loading || otp.length < 6}
                       className="w-full bg-myntra-pink hover:bg-[#ff1e6d] text-white py-5 uppercase font-black text-[14px] rounded-2xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                     >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify & Login</span>}
                     </button>
                     <button 
                       type="button"
                       onClick={() => setStep(1)}
                       className="text-gray-400 text-[12px] font-bold uppercase tracking-widest hover:text-myntra-pink transition-colors underline"
                     >
                        Change Number
                     </button>
                  </div>
               </form>
            ) : (
              <form onSubmit={handleCompleteProfile} className="space-y-4">
                 <div className="space-y-4">
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
                      <input 
                        type="text" 
                        value={userName}
                        required
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Full Name" 
                        className="w-full border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-myntra-pink text-[14px] font-bold transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-myntra-pink transition-colors" />
                      <input 
                        type="email" 
                        value={userEmail}
                        required
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Email Address" 
                        className="w-full border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-myntra-pink text-[14px] font-bold transition-all"
                      />
                    </div>
                 </div>
                 <button 
                    type="submit"
                    disabled={loading || !userName || !userEmail}
                    className="w-full bg-myntra-dark hover:bg-black text-white py-5 uppercase font-black text-[14px] rounded-2xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                     {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Complete Onboarding</span>}
                  </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest pt-4 border-t border-gray-100">
           By continuing, you agree to our <br/>
           <span className="text-myntra-dark underline cursor-pointer">Terms of Service</span> & <span className="text-myntra-dark underline cursor-pointer">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}
