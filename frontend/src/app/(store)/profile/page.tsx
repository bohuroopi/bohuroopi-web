"use client";

import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import { LogOut, User as UserIcon, Package, Settings, Heart, Edit2, Loader2, Save, X, Camera, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

export default function Profile() {
  const router = useRouter();
  const { user, logout, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", avatar: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    useAuthStore.persist.onFinishHydration(() => {
      if (!useAuthStore.getState().isAuthenticated) router.push("/login?redirect=/profile");
      else setLoading(false);
    });
    if (useAuthStore.persist.hasHydrated()) {
      if (!useAuthStore.getState().isAuthenticated) router.push("/login?redirect=/profile");
      else setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "", avatar: user.avatar || "" });
      setAvatarPreview(null);
    }
  }, [user]);

  const handleLogout = () => { logout(); router.push("/login"); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      setAvatarUploading(true);
      const data = new FormData();
      data.append("images", file);
      const res = await api.post("/upload/customer", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success && res.data.images?.[0]) {
        setFormData(prev => ({ ...prev, avatar: res.data.images[0].url }));
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
      alert("Avatar upload failed. Please try again.");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
      };
      const res = await api.put("/users/profile", payload);
      if (res.data.success) {
        setAuth(
          { _id: res.data._id, name: res.data.name, email: res.data.email, phone: res.data.phone, avatar: res.data.avatar } as AuthUser,
          res.data.token || token!
        );
        setIsEditing(false);
        setAvatarPreview(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 text-myntra-pink animate-spin" /></div>;

  const displayAvatar = avatarPreview || formData.avatar || user?.avatar;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-[14px] text-myntra-dark mb-6">
        <span className="text-gray-400">Home /</span> <span className="font-bold">Account</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="md:w-64 shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
            {/* Avatar */}
            <div className="relative h-20 w-20 mb-4">
              <div className="h-20 w-20 bg-myntra-light-gray rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-7 w-7 bg-myntra-pink text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
            </div>
            <h3 className="font-bold text-[16px] text-myntra-dark">{user?.name}</h3>
            {user?.phone && <p className="text-[13px] text-gray-500 font-medium mt-1">{user.phone}</p>}
            {user?.email && <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>}
          </div>

          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            <Link href="/profile" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-pink bg-pink-50/30">
              <Settings className="h-5 w-5" /><span className="font-bold text-[14px]">Profile Details</span>
            </Link>
            <Link href="/profile/orders" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <Package className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Orders & Returns</span>
            </Link>
            <Link href="/profile/addresses" className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-myntra-dark">
              <MapPin className="h-5 w-5 text-gray-400" /><span className="font-bold text-[14px]">Saved Addresses</span>
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
          {saveSuccess && (
            <div className="mb-6 bg-green-50 text-green-700 text-[13px] font-bold px-4 py-3 rounded-lg border border-green-200 flex items-center space-x-2">
              <span>✓ Profile updated successfully!</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-myntra-dark">Profile Details</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-[14px] text-myntra-pink font-bold border border-myntra-pink px-4 py-2 rounded-md hover:bg-pink-50 transition-colors">
                <Edit2 className="h-4 w-4" /><span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => { setIsEditing(false); setAvatarPreview(null); setFormData({ name: user?.name || "", email: user?.email || "", avatar: user?.avatar || "" }); }}
                  className="flex items-center space-x-1 text-[14px] text-gray-500 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4" /><span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateLoading || avatarUploading}
                  className="flex items-center space-x-1 text-[14px] text-white bg-myntra-pink px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:opacity-70"
                >
                  {updateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5 max-w-lg">
            {/* Name */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Full Name</label>
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-md text-[14px] outline-none focus:border-myntra-pink transition-colors" placeholder="Full Name" />
              ) : (
                <div className="p-3 border border-gray-100 rounded-md text-[14px] text-myntra-dark bg-gray-50">{user?.name || "Not specified"}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Email Address</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-md text-[14px] outline-none focus:border-myntra-pink transition-colors" placeholder="Email Address" />
              ) : (
                <div className="p-3 border border-gray-100 rounded-md text-[14px] text-myntra-dark bg-gray-50">{user?.email || "Not specified"}</div>
              )}
            </div>

            {/* Mobile — read-only always */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Mobile Number</label>
              <div className="p-3 border border-gray-100 rounded-md text-[14px] text-myntra-dark bg-gray-50 flex items-center justify-between">
                <span>{user?.phone || "Not specified"}</span>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Cannot be changed</span>
              </div>
            </div>

            {/* Avatar hint when editing */}
            {isEditing && (
              <div className="pt-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-[12px] text-blue-600 font-medium">
                  📷 Click the <strong>camera icon</strong> on your profile picture in the sidebar to change your photo.
                  {avatarUploading && <span className="block text-myntra-pink mt-1">⏳ Uploading photo...</span>}
                  {avatarPreview && !avatarUploading && <span className="block text-green-600 mt-1">✓ Photo ready — click "Save Changes".</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
