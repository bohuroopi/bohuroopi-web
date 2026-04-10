"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Mail, Phone, MapPin, Share2, Palette, CreditCard, Loader2, CheckCircle, Plus, Trash2, HelpCircle, MessageCircle } from "lucide-react";
import api from "@/lib/axios";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    supportEmail: "",
    supportPhone: "",
    supportWhatsApp: "",
    officeAddress: "",
    shippingFee: 0,
    freeShippingThreshold: 0,
    socialLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      youtube: "",
    },
    metaDescription: "",
    logoUrl: "",
    faviconUrl: "",
    codCharges: 0,
    faqs: [] as { question: string, answer: string }[],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/settings");
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setFormData({
          storeName: s.storeName || "",
          supportEmail: s.supportEmail || "",
          supportPhone: s.supportPhone || "",
          supportWhatsApp: s.supportWhatsApp || "",
          officeAddress: s.officeAddress || "",
          shippingFee: s.shippingFee || 0,
          freeShippingThreshold: s.freeShippingThreshold || 0,
          socialLinks: {
            instagram: s.socialLinks?.instagram || "",
            facebook: s.socialLinks?.facebook || "",
            twitter: s.socialLinks?.twitter || "",
            youtube: s.socialLinks?.youtube || "",
          },
          metaDescription: s.metaDescription || "",
          logoUrl: s.logoUrl || "",
          faviconUrl: s.faviconUrl || "",
          codCharges: s.codCharges || 0,
          faqs: s.faqs || [],
        });
      }
    } catch (err) {
      console.error("Fetch Settings Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [socialKey]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }]
    }));
  };

  const handleRemoveFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleFAQChange = (index: number, field: string, value: string) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: updatedFAQs }));
  };

  const handleSave = async () => {
    // Basic validation
    for (const faq of formData.faqs) {
      if (!faq.question.trim() || !faq.answer.trim()) {
        alert("Please fill in both the question and answer for all FAQs, or remove the empty ones.");
        return;
      }
    }

    try {
      setSaving(true);
      setSuccess(false);
      const res = await api.put("/settings", formData);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save Settings Error:", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-myntra-pink" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Settings</h1>
          <p className="text-gray-500 text-sm">Configure your store's global preferences</p>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <div className="flex items-center text-emerald-500 text-sm font-bold animate-in fade-in slide-in-from-right-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Saved Successfully
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-myntra-pink text-white px-6 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-lg shadow-pink-200 hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex min-h-[600px]">
        {/* Settings Sidebar */}
        <aside className="w-64 border-r border-gray-100 bg-gray-50/30 p-4 space-y-2">
           <button 
             onClick={() => setActiveTab("general")}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-myntra-pink shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
           >
              <Globe className="h-4 w-4" />
              <span>General</span>
           </button>
           <button 
             onClick={() => setActiveTab("contact")}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'contact' ? 'bg-white text-myntra-pink shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
           >
              <Mail className="h-4 w-4" />
              <span>Contact Details</span>
           </button>
           <button 
             onClick={() => setActiveTab("payments")}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'payments' ? 'bg-white text-myntra-pink shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
           >
              <CreditCard className="h-4 w-4" />
              <span>Payments & Shipping</span>
           </button>
           <button 
             onClick={() => setActiveTab("social")}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'social' ? 'bg-white text-myntra-pink shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
           >
              <Share2 className="h-4 w-4" />
              <span>Social Media</span>
           </button>
           <button 
             onClick={() => setActiveTab("faqs")}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'faqs' ? 'bg-white text-myntra-pink shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
           >
              <HelpCircle className="h-4 w-4" />
              <span>FAQs</span>
           </button>
        </aside>

        {/* Settings Content */}
        <main className="flex-grow p-8 overflow-y-auto">
           {activeTab === 'general' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-myntra-dark border-b pb-2">General Information</h3>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-gray-400 uppercase">Store Name</label>
                         <input 
                           type="text" 
                           name="storeName"
                           value={formData.storeName}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none" 
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-gray-400 uppercase">Meta Description</label>
                         <input 
                            type="text" 
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            placeholder="SEO description for search engines"
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none" 
                         />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Office Address</label>
                      <textarea 
                        rows={3} 
                        name="officeAddress"
                        value={formData.officeAddress}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none resize-none"
                      />
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'contact' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-myntra-dark border-b pb-2">Support Contact</h3>
                <div className="space-y-4">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-50 rounded-lg"><Mail className="h-5 w-5 text-gray-400" /></div>
                      <div className="flex-grow">
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Support Email</label>
                         <input 
                           type="email" 
                           name="supportEmail"
                           value={formData.supportEmail}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-myntra-pink outline-none" 
                         />
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-50 rounded-lg"><Phone className="h-5 w-5 text-gray-400" /></div>
                      <div className="flex-grow">
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Support Phone</label>
                         <input 
                           type="text" 
                           name="supportPhone"
                           value={formData.supportPhone}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-myntra-pink outline-none" 
                         />
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-emerald-50 rounded-lg"><MessageCircle className="h-5 w-5 text-emerald-500" /></div>
                      <div className="flex-grow">
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Support WhatsApp</label>
                         <input 
                           type="text" 
                           name="supportWhatsApp"
                           value={formData.supportWhatsApp}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-myntra-pink outline-none" 
                         />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'payments' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-myntra-dark border-b pb-2">Payments & Logistics</h3>
                <div className="space-y-4">
                   <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-gray-400 uppercase">Base Shipping Fee (₹)</label>
                         <input 
                           type="number" 
                           name="shippingFee"
                           value={formData.shippingFee}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none font-bold" 
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-gray-400 uppercase">Free Shipping Above (₹)</label>
                         <input 
                           type="number" 
                           name="freeShippingThreshold"
                           value={formData.freeShippingThreshold}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none font-bold text-emerald-600" 
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-gray-400 uppercase">COD Service Charge (₹)</label>
                         <input 
                           type="number" 
                           name="codCharges"
                           value={formData.codCharges}
                           onChange={handleChange}
                           className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none font-bold text-amber-600" 
                         />
                      </div>
                   </div>
                </div>
             </div>
           )}


           {activeTab === 'social' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-myntra-dark border-b pb-2">Social Connections</h3>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Instagram URL</label>
                      <input 
                        type="text" 
                        name="social.instagram"
                        value={formData.socialLinks.instagram}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Facebook URL</label>
                      <input 
                        type="text" 
                        name="social.facebook"
                        value={formData.socialLinks.facebook}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">YouTube URL</label>
                      <input 
                        type="text" 
                        name="social.youtube"
                        value={formData.socialLinks.youtube}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-myntra-pink outline-none" 
                      />
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'faqs' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center border-b pb-2">
                   <h3 className="text-lg font-bold text-myntra-dark">Frequently Asked Questions</h3>
                   <button 
                     onClick={handleAddFAQ}
                     className="flex items-center space-x-2 text-xs font-bold text-myntra-pink hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-all"
                   >
                      <Plus className="h-4 w-4" />
                      <span>Add New FAQ</span>
                   </button>
                </div>
                
                <div className="space-y-6">
                   {formData.faqs.length === 0 ? (
                     <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No FAQs added yet</p>
                        <button 
                          onClick={handleAddFAQ}
                          className="mt-4 text-sm font-bold text-myntra-pink hover:underline"
                        >
                          Create your first FAQ
                        </button>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {formData.faqs.map((faq, index) => (
                           <div key={index} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4 relative group transition-all hover:border-gray-200 hover:shadow-sm">
                              <button 
                                onClick={() => handleRemoveFAQ(index)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </button>
                              
                              <div className="space-y-1 pr-10">
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Question {index + 1}</label>
                                 <input 
                                   type="text" 
                                   value={faq.question}
                                   onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                                   placeholder="e.g. What is your return policy?"
                                   className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:border-myntra-pink outline-none font-bold"
                                 />
                              </div>
                              
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Answer</label>
                                 <textarea 
                                   rows={3}
                                   value={faq.answer}
                                   onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                                   placeholder="Provide a clear, detailed answer..."
                                   className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:border-myntra-pink outline-none resize-none"
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
           )}
        </main>
      </div>
    </div>
  );
}


