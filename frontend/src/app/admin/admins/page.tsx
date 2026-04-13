"use client";

import { useState, useEffect } from "react";
import {
  Search, User, Mail, Phone, Loader2, X, Plus, Trash2, ShieldCheck, ShieldAlert,
  Hash, ChevronRight, UserPlus, Fingerprint, Shield
} from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'sub_admin';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "sub_admin"
  });
  const [saving, setSaving] = useState(false);

  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => { 
    fetchAdmins(); 
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/admins");
      if (res.data.success) setAdmins(res.data.admins);
    } catch (err: any) { 
      if (err.response?.status === 403) {
        setAccessDenied(true);
      }
      console.error("Fetch Admins Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post("/users/admin/register", formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setFormData({ name: "", email: "", phone: "", role: "sub_admin" });
        fetchAdmins();
      }
    } catch (err: any) {
      console.error("Create Admin Error:", err);
      alert(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === currentUser?._id) {
      alert("You cannot delete yourself!");
      return;
    }
    if (!confirm("Are you sure you want to remove this administrator? They will lose all access immediately.")) return;
    
    try {
      const res = await api.delete(`/users/admins/${id}`);
      if (res.data.success) {
        setSelectedId(null);
        fetchAdmins();
      }
    } catch (err) {
      console.error("Delete Admin Error:", err);
    }
  };

  const filtered = admins.filter(a =>
    [a.name, a.email, a.phone].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedAdmin = admins.find(a => a._id === selectedId);

  // Only show restricted if the backend actually rejected us (403)
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-black text-myntra-dark border-b-2 border-red-500 pb-2">Access Restricted</h2>
        <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest">Only Super Admins can manage other users</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)] animate-fade-in">
      {/* LEFT: Admin List */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        <div className="flex justify-between items-end pb-2">
          <div>
            <h1 className="text-2xl font-black text-myntra-dark tracking-tighter uppercase leading-none">Admin Users</h1>
            <div className="h-1 w-12 bg-myntra-pink mt-3 rounded-full"></div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-3">{admins.length} Total Administrators</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-myntra-dark text-white px-6 py-3 rounded-xl font-bold text-[12px] flex items-center space-x-2 hover:bg-myntra-pink transition-all shadow-lg active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>CREATE NEW ADMIN</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl text-sm focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300 font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filtered.map(a => (
                <button
                  key={a._id}
                  onClick={() => setSelectedId(a._id)}
                  className={`w-full flex items-center justify-between px-6 py-5 border-b border-gray-50 hover:bg-gray-50 transition-all text-left group ${selectedId === a._id ? "bg-pink-50/30 border-l-4 border-l-myntra-pink" : "border-l-4 border-l-transparent"}`}
                >
                  <div className="flex items-center space-x-5">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-[16px] shadow-sm border ${a.role === 'super_admin' ? 'bg-myntra-dark text-white border-myntra-dark' : 'bg-pink-50 text-myntra-pink border-pink-100'}`}>
                      {a.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-black text-myntra-dark text-[15px] uppercase tracking-tight">{a.name}</p>
                        {a.role === 'super_admin' && <ShieldCheck className="h-3.5 w-3.5 text-myntra-pink" />}
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{a.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${a.role === 'super_admin' ? 'bg-myntra-dark text-white border-myntra-dark' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {a.role.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${selectedId === a._id ? "text-myntra-pink translate-x-1" : "text-gray-200 group-hover:text-myntra-pink"}`} />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 grayscale opacity-50">
                  <User className="h-12 w-12 text-gray-200 mb-4" />
                  <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">No Administrators Found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: detail Panel */}
      <AnimatePresence>
        {selectedId && selectedAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col bg-white border border-gray-200 rounded-[2.5rem] shadow-xl w-[480px] shrink-0 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-myntra-dark to-black relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                <Shield className="h-40 w-40 text-white" />
              </div>
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl border border-white/20 shadow-2xl">
                    {selectedAdmin.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedAdmin.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] ${selectedAdmin.role === 'super_admin' ? 'bg-myntra-pink text-white' : 'bg-gray-600 text-gray-300'}`}>
                        {selectedAdmin.role.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Joined {new Date(selectedAdmin.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Contact Details */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50 pb-3">Security Credentials</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:border-myntra-pink transition-colors">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-myntra-pink transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-[14px] font-bold text-myntra-dark">{selectedAdmin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:border-myntra-pink transition-colors">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-myntra-pink transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-[14px] font-bold text-myntra-dark">{selectedAdmin.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Flags */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50 pb-3">System Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                    <Hash className="h-4 w-4 text-gray-400 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal ID</p>
                    <p className="text-[12px] font-mono text-myntra-dark font-bold mt-1 truncate">{selectedAdmin._id}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                    <Fingerprint className="h-4 w-4 text-gray-400 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Two-Factor</p>
                    <p className="text-[12px] text-emerald-600 font-black uppercase mt-1">OTP Enabled</p>
                  </div>
                </div>
              </div>

              {/* Access Levels */}
              <div className="space-y-3">
                 <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50 pb-3">Permission Overview</h3>
                 <div className="grid grid-cols-1 gap-2">
                    {selectedAdmin.role === 'super_admin' ? (
                       <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-[11px] font-black uppercase">Unrestricted System Access</span>
                       </div>
                    ) : (
                       <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                          <ShieldAlert className="h-4 w-4" />
                          <span className="text-[11px] font-black uppercase">Restricted Store Operations</span>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-8 border-t border-gray-100 flex space-x-4 shrink-0 bg-gray-50/50 backdrop-blur-md">
              <button
                disabled={selectedAdmin._id === currentUser?._id}
                onClick={() => handleDeleteAdmin(selectedAdmin._id)}
                className="flex-1 flex items-center justify-center space-x-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-95 border-2 border-red-500/20 disabled:opacity-30 shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Administrator</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE ADMIN MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-myntra-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden p-10"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-myntra-dark uppercase tracking-tighter">Onboard Admin</h2>
                  <div className="h-1.5 w-16 bg-myntra-pink mt-2 rounded-full"></div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-myntra-dark rounded-full transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Legal Name</label>
                    <input
                      type="text" required value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-sm font-bold focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Work Email</label>
                      <input
                        type="email" required value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-sm font-bold focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                        placeholder="email@bohuroopi.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Secure Phone</label>
                      <input
                        type="tel" required value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-sm font-bold focus:border-myntra-pink outline-none transition-all placeholder:text-gray-300"
                        placeholder="+91 99999 99999"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Assign System Role</label>
                    <div className="flex gap-4">
                       <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'super_admin'})}
                        className={`flex-1 p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${formData.role === 'super_admin' ? 'border-myntra-pink bg-pink-50/50 shadow-md' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                       >
                          <ShieldCheck className={`h-8 w-8 ${formData.role === 'super_admin' ? 'text-myntra-pink' : 'text-gray-300'}`} />
                          <div className="text-center">
                             <p className={`text-[12px] font-black uppercase tracking-tight ${formData.role === 'super_admin' ? 'text-myntra-pink' : 'text-gray-600'}`}>Super Admin</p>
                             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Full System Power</p>
                          </div>
                       </button>

                       <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'sub_admin'})}
                        className={`flex-1 p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${formData.role === 'sub_admin' ? 'border-myntra-pink bg-pink-50/50 shadow-md' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                       >
                          <User className={`h-8 w-8 ${formData.role === 'sub_admin' ? 'text-myntra-pink' : 'text-gray-300'}`} />
                          <div className="text-center">
                             <p className={`text-[12px] font-black uppercase tracking-tight ${formData.role === 'sub_admin' ? 'text-myntra-pink' : 'text-gray-600'}`}>Sub Admin</p>
                             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Managerial Access</p>
                          </div>
                       </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit" disabled={saving}
                    className="w-full bg-myntra-dark hover:bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : "PROVISION ACCOUNT"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
