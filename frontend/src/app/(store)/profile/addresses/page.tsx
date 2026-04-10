"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User, Package, Settings, Heart, MapPin, Loader2, Plus, Trash2, Home, Briefcase, Edit2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

export default function ProfileAddresses() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [defaultLoading, setDefaultLoading] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    zip: "",
    street: "",
    state: "",
    city: "",
    type: "Home"
  });

  useEffect(() => {
    useAuthStore.persist.onFinishHydration(() => {
      if (!useAuthStore.getState().isAuthenticated) router.push("/login?redirect=/profile/addresses");
      else fetchAddresses();
    });
    if (useAuthStore.persist.hasHydrated()) {
      if (!useAuthStore.getState().isAuthenticated) router.push("/login?redirect=/profile/addresses");
      else fetchAddresses();
    }
  }, [router]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/users/addresses");
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (index: number) => {
    const addr = addresses[index];
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      zip: addr.zip || "",
      street: addr.street || "",
      state: addr.state || "",
      city: addr.city || "",
      type: addr.type || "Home"
    });
    setEditingIndex(index);
    setIsAddingNew(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        zip: formData.zip,
        street: formData.street,
        state: formData.state,
        city: formData.city,
        type: formData.type,
        country: "India",
        isDefault: editingIndex !== null ? addresses[editingIndex].isDefault : addresses.length === 0
      };

      let res;
      if (editingIndex !== null) {
        res = await api.put(`/users/addresses/${editingIndex}`, payload);
      } else {
        res = await api.post("/users/addresses", payload);
      }

      if (res.data.success) {
        setAddresses(res.data.addresses);
        setIsAddingNew(false);
        setEditingIndex(null);
        setFormData({ fullName: "", phone: "", zip: "", street: "", state: "", city: "", type: "Home" });
      }
    } catch (err: any) {
       alert(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm("Remove this address?")) return;
    try {
      setDeleteLoading(index);
      const res = await api.delete(`/users/addresses/${index}`);
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      alert("Failed to delete address");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSetDefault = async (index: number) => {
    if (addresses[index].isDefault) return;
    try {
      setDefaultLoading(index);
      const res = await api.put(`/users/addresses/${index}/default`);
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      alert("Failed to update default address");
    } finally {
      setDefaultLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 text-myntra-pink animate-spin" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-[14px] text-myntra-dark mb-6">
        <span className="text-gray-400">Home /</span> <span className="font-bold">Account</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-myntra-light-gray rounded-full overflow-hidden flex items-center justify-center shadow-inner mb-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <h3 className="font-bold text-[16px] text-myntra-dark">{user?.name}</h3>
            {user?.phone && <p className="text-[13px] text-gray-500 font-medium mt-1">{user.phone}</p>}
            {user?.email && <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>}
          </div>

          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            <Link href="/profile" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <Settings className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Profile Details</span>
            </Link>
            <Link href="/profile/orders" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <Package className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Orders & Returns</span>
            </Link>
            <Link href="/profile/addresses" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-pink bg-pink-50/30">
              <MapPin className="h-5 w-5" /><span className="font-bold text-[14px]">Saved Addresses</span>
            </Link>
            <Link href="/wishlist" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <Heart className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Wishlist</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-red-500 text-left">
              <LogOut className="h-5 w-5" /><span className="font-bold text-[14px]">Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow bg-white border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-myntra-dark">Saved Addresses</h2>
            {!isAddingNew && (
                <button 
                  onClick={() => { setIsAddingNew(true); setEditingIndex(null); setFormData({ fullName: "", phone: "", zip: "", street: "", state: "", city: "", type: "Home" }); }} 
                  className="flex items-center space-x-2 text-[13px] text-myntra-pink font-bold border border-myntra-pink px-4 py-2 rounded-md hover:bg-pink-50 transition-colors"
                >
                  <Plus className="h-4 w-4" /><span>Add New Address</span>
                </button>
            )}
          </div>

          {isAddingNew && (
             <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
                <h3 className="text-[16px] font-bold text-myntra-dark mb-4 uppercase tracking-wide">{editingIndex !== null ? 'Edit Address' : 'Add New Address'}</h3>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Name" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                        <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Mobile No." className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="zip" required value={formData.zip} onChange={handleChange} placeholder="Pin Code" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                        <input type="text" name="state" required value={formData.state} onChange={handleChange} placeholder="Locality / Town / State" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                    </div>
                    <input type="text" name="street" required value={formData.street} onChange={handleChange} placeholder="Address (House No, Building, Street, Area)" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                    <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="City / District" className="w-full border border-gray-300 rounded-md p-3 outline-none focus:border-myntra-pink text-[14px]" />
                    
                    <div className="pt-2">
                        <p className="text-[12px] text-gray-500 mb-2">Type of Address</p>
                        <div className="flex space-x-4">
                            <button type="button" onClick={() => setFormData({...formData, type: "Home"})} className={`border rounded-full px-4 py-1 text-[12px] font-bold ${formData.type === 'Home' ? 'border-myntra-dark text-myntra-dark' : 'border-gray-300 text-gray-500 hover:border-myntra-dark'}`}>Home</button>
                            <button type="button" onClick={() => setFormData({...formData, type: "Office"})} className={`border rounded-full px-4 py-1 text-[12px] font-bold ${formData.type === 'Office' ? 'border-myntra-dark text-myntra-dark' : 'border-gray-300 text-gray-500 hover:border-myntra-dark'}`}>Office</button>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                       <button type="submit" disabled={saveLoading} className="bg-myntra-pink text-white font-bold text-[14px] px-8 py-3 rounded-md hover:bg-pink-600 transition disabled:opacity-70 flex items-center">
                          {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} {editingIndex !== null ? 'Update Address' : 'Save Address'}
                       </button>
                       <button type="button" onClick={() => { setIsAddingNew(false); setEditingIndex(null); }} className="text-gray-500 font-bold text-[14px] px-4 hover:text-myntra-dark">Cancel</button>
                    </div>
                </form>
             </div>
          )}

          {addresses.length === 0 && !isAddingNew ? (
             <div className="text-center py-10">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold mb-4">No addresses saved yet.</p>
                <button onClick={() => setIsAddingNew(true)} className="text-myntra-pink font-bold border border-myntra-pink px-6 py-2 rounded-md hover:bg-pink-50 transition">Add New Address</button>
             </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                   <div key={idx} className={`border rounded-lg p-5 relative group hover:shadow-sm transition-shadow ${addr.isDefault ? 'border-pink-200 bg-pink-50/10' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-center justify-between mb-3">
                         <div className="bg-white border border-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2 py-1 rounded-sm flex items-center space-x-1 shadow-sm">
                            {addr.type === 'Office' ? <Briefcase className="h-3 w-3"/> : <Home className="h-3 w-3"/>}
                            <span>{addr.type || 'Home'}</span>
                         </div>
                         {addr.isDefault ? (
                            <span className="text-myntra-pink text-[10px] font-bold uppercase border border-pink-200 bg-pink-50 px-2 py-1 rounded-sm flex items-center space-x-1">
                               <CheckCircle2 className="h-3 w-3" />
                               <span>Default</span>
                            </span>
                         ) : (
                            <button 
                              onClick={() => handleSetDefault(idx)} 
                              disabled={defaultLoading === idx}
                              className="text-[10px] font-bold text-gray-400 uppercase py-1 px-2 hover:bg-gray-100 rounded transition flex items-center space-x-1"
                            >
                               {defaultLoading === idx ? <Loader2 className="h-3 w-3 animate-spin"/> : null}
                               <span>Set as Default</span>
                            </button>
                         )}
                      </div>

                      <div className="mb-2">
                         <span className="font-bold text-[14px] text-myntra-dark mr-3">{addr.fullName}</span>
                         <span className="text-[12px] font-bold text-gray-500">{addr.phone}</span>
                      </div>
                      
                      <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                         {addr.street}<br/>
                         {addr.state && `${addr.state}, `}{addr.city}<br/>
                         {addr.country} - <span className="font-bold text-myntra-dark">{addr.zip}</span>
                      </p>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                         <button onClick={() => handleEdit(idx)} className="text-[12px] font-bold text-myntra-pink flex items-center space-x-1 hover:underline">
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                         </button>
                         <button onClick={() => handleDeleteAddress(idx)} disabled={deleteLoading === idx} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                            {deleteLoading === idx ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
