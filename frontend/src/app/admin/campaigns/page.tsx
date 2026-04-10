"use client";

import { useState, useEffect } from "react";
import { Send, Plus, Mail, MessageCircle, Loader2, X, CheckCircle, Clock } from "lucide-react";
import api from "@/lib/axios";

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    type: "email",
    subject: "",
    content: "",
    targetAudience: "all",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get("/campaigns");
      if (res.data.success) setCampaigns(res.data.campaigns);
    } catch (err) {
      console.error("Fetch Campaigns Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (campaign: any = null) => {
    if (campaign && campaign.status !== 'draft') {
      alert("Only draft campaigns can be edited.");
      return;
    }
    
    if (campaign) {
      setFormData({
        _id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        subject: campaign.subject || "",
        content: campaign.content,
        targetAudience: campaign.targetAudience,
      });
    } else {
      setFormData({
        _id: "",
        name: "",
        type: "email",
        subject: "",
        content: "",
        targetAudience: "all",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData };
      if (!payload._id) delete (payload as any)._id;

      if (formData._id) {
        await api.put(`/campaigns/${formData._id}`, payload);
      } else {
        await api.post("/campaigns", payload);
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to dispatch this campaign now? This cannot be undone.")) return;
    try {
      setDispatchingId(id);
      const res = await api.post(`/campaigns/${id}/send`);
      if (res.data.success) {
        alert("Campaign successfully dispatched!");
        fetchCampaigns();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to dispatch campaign");
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myntra-dark">Marketing Campaigns</h1>
          <p className="text-gray-500 text-sm">Create and dispatch Email or WhatsApp newsletters</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-myntra-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-black transition-all shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {loading ? (
          <div className="flex-grow flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-myntra-pink" /></div>
        ) : campaigns.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-16 text-center text-gray-400">
             <Send className="h-12 w-12 text-gray-200 mb-4" />
             <p className="text-lg font-bold text-gray-400/80">No campaigns yet.</p>
             <p className="text-sm">Click "New Campaign" to draft your first broadcast.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Channel & Target</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                       <p className="font-bold text-myntra-dark truncate">{camp.name}</p>
                       <p className="text-[11px] text-gray-500 truncate" title={camp.subject}>{camp.type === 'email' ? camp.subject : 'WhatsApp Message'}</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded bg-gray-100 font-bold text-[10px] uppercase flex items-center border ${camp.type === 'email' ? 'border-blue-200 text-blue-600' : 'border-emerald-200 text-emerald-600'}`}>
                             {camp.type === 'email' ? <Mail className="h-3 w-3 mr-1" /> : <MessageCircle className="h-3 w-3 mr-1" />}
                             {camp.type}
                          </span>
                          <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                            Audience: {camp.targetAudience.replace('_', ' ')}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {camp.status === 'draft' && (
                         <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase w-max flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> Draft
                         </span>
                       )}
                       {camp.status === 'sent' && (
                         <span className="px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-[10px] font-bold uppercase w-max flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Sent
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {camp.status === 'draft' ? (
                          <div className="flex items-center justify-end space-x-2">
                             <button onClick={() => handleOpenModal(camp)} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition">Edit</button>
                             <button 
                               onClick={() => handleDispatch(camp._id)} 
                               disabled={dispatchingId === camp._id}
                               className="text-white font-bold bg-myntra-pink hover:bg-pink-600 px-4 py-1.5 rounded shadow-sm transition disabled:opacity-50 flex items-center"
                             >
                               {dispatchingId === camp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Now"}
                             </button>
                          </div>
                       ) : (
                          <span className="text-xs font-bold text-gray-400">Locked</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h2 className="text-xl font-bold text-myntra-dark">{formData._id ? "Edit Campaign" : "Draft New Campaign"}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                 <form id="campaignForm" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Internal Name *</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink" placeholder="e.g. Diwali Promos" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Channel *</label>
                          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink cursor-pointer font-medium">
                             <option value="email">Email Blast</option>
                             <option value="whatsapp">WhatsApp Message</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Target Audience *</label>
                       <select value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink cursor-pointer font-medium">
                          <option value="all">All Known Customers</option>
                          <option value="past_buyers">Past Buyers Only</option>
                          <option value="abandoned_carts">Users with Abandoned Carts</option>
                          <option value="newsletter_subs">Newsletter Subscribers</option>
                       </select>
                    </div>

                    {formData.type === 'email' && (
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Subject Line *</label>
                          <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink" placeholder="An offer you can't refuse..." />
                       </div>
                    )}

                    <div className="space-y-1 flex-grow">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Message Content *</label>
                       <textarea 
                         required 
                         rows={8}
                         value={formData.content} 
                         onChange={e => setFormData({...formData, content: e.target.value})} 
                         className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-myntra-pink resize-y font-mono text-sm bg-gray-50 focus:bg-white transition-colors" 
                         placeholder={formData.type === 'email' ? "<h1>Hello {{name}}</h1>\n..." : "Hello {{name}},\nWe have a special offer for you..."}
                       />
                       <p className="text-[10px] text-gray-400 pl-1 mt-1">Supports simple templating tags: {'{{name}}'}, {'{{email}}'}.</p>
                    </div>
                 </form>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                 <button type="submit" form="campaignForm" disabled={saving} className="px-6 py-2.5 rounded-xl font-bold bg-myntra-dark text-white hover:bg-black shadow-lg shadow-gray-300 transition-all flex items-center min-w-[120px] justify-center disabled:opacity-50">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Draft"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
