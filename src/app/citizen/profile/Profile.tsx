'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userProfileApi } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Wallet, Edit2, Check, X,
  Camera, Shield, Package, ArrowRight, Loader2, Sparkles,
  Leaf, Trophy, Users, TrendingUp, Zap, Globe, ChevronDown
} from 'lucide-react';
import Image from 'next/image';

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'AU' },
  { code: '+65', country: 'SG' }
];

const ProfilePage = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await userProfileApi.get();
      if (response.data && response.data.status === 'success') {
        const data = response.data;
        setProfile(data);

        // Split full name
        const nameParts = (data.user.fullName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Extract country code
        let countryCode = '+91';
        let mobile = data.user.mobileNumber || '';
        if (mobile.startsWith('+')) {
          const match = countryCodes.find(c => mobile.startsWith(c.code));
          if (match) {
            countryCode = match.code;
            mobile = mobile.substring(match.code.length);
          }
        }

        setFormData({
          firstName,
          lastName,
          email: data.user.email,
          countryCode,
          mobileNumber: mobile,
          address: data.address?.address || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          pincode: data.address?.pincode || '',
          latitude: data.address?.latitude || null,
          longitude: data.address?.longitude || null
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Validation for numbers
    if (isEditing && (formData.latitude === null || formData.longitude === null)) {
      showToast("Coordinates are required. Use 'Detect Location'.", "info");
      return;
    }

    setIsSaving(true);
    try {
      // Merge name and phone
      const submissionData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        mobileNumber: `${formData.countryCode}${formData.mobileNumber}`
      };

      const response = await userProfileApi.update(submissionData);
      if (response.data && response.data.status === 'success') {
        showToast("Profile identity synchronized!", "success");
        setIsEditing(false);
        fetchProfile(false); // Silent background refresh
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoLocate = async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported", "error");
      return;
    }

    setIsSaving(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        let city = '';
        let state = '';
        let pincode = '';

        feature.context?.forEach((ctx: any) => {
          if (ctx.id.startsWith('postcode')) pincode = ctx.text;
          if (ctx.id.startsWith('place')) city = ctx.text;
          if (ctx.id.startsWith('region')) state = ctx.text;
        });

        // Smart extraction of local address (avoiding city/pincode/country duplication)
        const street = feature.text || '';
        const houseNumber = feature.address || '';
        const localAddress = houseNumber ? `${houseNumber}, ${street}` : street;

        setFormData(prev => ({
          ...prev,
          address: localAddress || prev.address,
          city: city || prev.city,
          state: state || prev.state,
          pincode: pincode || prev.pincode,
          latitude,
          longitude
        }));
        showToast("Address synchronized via GPS!", "success");
      }
    } catch (error) {
      console.error("Auto-locate error:", error);
      showToast("Failed to detect location", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-emerald-800 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Synchronizing Identity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-montserrat pb-20 relative overflow-hidden">
      {/* Background elements to match Home page */}
      {/* Futuristic Green Background Video */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2021/04/12/70860-538805601_large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Emerald Scanning Grid - Refined to match screenshot */}
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Pulsing Emerald Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-emerald-600/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />

      {/* Header Hero Area - Now transparent to show grid */}
      <div className="h-72 bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.4),transparent_70%)]"></div>
        </div>
        {/* Scanning line for the hero strip */}
        <motion.div
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-emerald-400/20 shadow-[0_0_10px_#10b981] z-0 pointer-events-none"
        />
        <div className="absolute -bottom-1 left-0 w-full h-32 bg-gradient-to-t from-[#FDFDFF] via-white/80 to-transparent"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-8 items-start">

          {/* Column 1: Profile Summary & Security (Left) */}
          <div className="xl:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 p-8 border border-emerald-50 relative overflow-hidden group h-full"
            >
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="text-emerald-200" size={24} />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-[2rem] bg-emerald-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl ring-1 ring-emerald-50">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=10b981&color=fff&size=256&font-size=0.33&bold=true`}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-white text-emerald-600 rounded-2xl shadow-lg border border-emerald-50 hover:bg-emerald-50 transition-all group-hover:scale-110">
                    <Camera size={20} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-1">{profile?.user?.fullName}</h2>
                <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mb-6">Citizen Advocate</p>

                <div className="grid grid-cols-1 gap-4 w-full pt-6 border-t border-slate-50">
                  <div className="bg-emerald-50/50 p-5 rounded-3xl text-center">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Eco Score</p>
                    <p className="text-3xl font-black text-emerald-900">1,240</p>
                  </div>
                  <div className="bg-emerald-50/50 p-5 rounded-3xl text-center">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Wallet Hub</p>
                    <p className="text-3xl font-black text-emerald-900">₹{profile?.wallet?.pointsBalance || 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/10"
            >
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <Shield className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Account Security</h3>
                <p className="text-slate-400 text-[10px] leading-relaxed mb-6 italic opacity-70">Data is encrypted under strict e-waste regulations.</p>
                <div className="w-full py-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm text-emerald-400">
                  Identity Verified <Check size={18} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
            </motion.div>


          </div>

          {/* Column 2: Identity & Recent Activity (Center) */}
          <div className="xl:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 p-8 border border-emerald-50 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Identity & Reach</h3>
                  <p className="text-slate-400 font-medium text-sm">Communication channels</p>
                </div>
                <button
                  onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                  disabled={isSaving}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 text-sm ${isEditing
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isEditing ? (
                    <>Save <Check size={18} /></>
                  ) : (
                    <>Modify <Edit2 size={18} /></>
                  )}
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">First Name</label>
                    <div className="relative group">
                      <input
                        disabled={!isEditing}
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full pl-20 pr-6 py-5 rounded-[2rem] border transition-all text-emerald-600 font-bold text-lg ${isEditing ? 'bg-emerald-50/30 border-emerald-200 outline-none ring-4 ring-emerald-500/5 focus:border-emerald-500' : 'bg-slate-50/50 border-transparent'}`}
                      />
                      <User className={`absolute left-7 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-emerald-500' : 'text-slate-300'}`} size={22} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Last Name</label>
                    <div className="relative group">
                      <input
                        disabled={!isEditing}
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full pl-20 pr-6 py-5 rounded-[2rem] border transition-all text-emerald-600 font-bold text-lg ${isEditing ? 'bg-emerald-50/30 border-emerald-200 outline-none ring-4 ring-emerald-500/5 focus:border-emerald-500' : 'bg-slate-50/50 border-transparent'}`}
                      />
                      <User className={`absolute left-7 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-emerald-500' : 'text-slate-300'}`} size={22} />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Electronic Mail</label>
                  <div className="relative group">
                    <input
                      disabled={true}
                      type="email"
                      value={formData.email}
                      className="w-full pl-20 pr-32 py-5 rounded-[2rem] border border-transparent bg-slate-50/50 text-slate-400 font-bold cursor-not-allowed text-lg"
                    />
                    <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">Locked</div>
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Mobile Contact</label>
                  <div className="flex gap-4">
                    <div className="relative">
                      <select
                        disabled={!isEditing}
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        className={`w-40 pl-14 pr-10 py-5 rounded-[2rem] border transition-all text-emerald-600 font-bold text-lg appearance-none cursor-pointer ${isEditing ? 'bg-emerald-50/30 border-emerald-200' : 'bg-slate-50/50 border-transparent'}`}
                      >
                        {countryCodes.map(c => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <Globe className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-emerald-500' : 'text-slate-300'}`} size={20} />
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative group flex-1">
                      <input
                        disabled={!isEditing}
                        type="text"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        className={`w-full pl-20 pr-6 py-5 rounded-[2rem] border transition-all text-emerald-600 font-bold text-lg ${isEditing ? 'bg-emerald-50/30 border-emerald-200 outline-none ring-4 ring-emerald-500/5 focus:border-emerald-500' : 'bg-slate-50/50 border-transparent'}`}
                        placeholder="Phone Number"
                      />
                      <Phone className={`absolute left-7 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-emerald-500' : 'text-slate-300'}`} size={22} />
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Achievement Badges Section */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-[1.5rem] flex flex-col items-center text-center group cursor-pointer hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <Trophy size={22} />
                  </div>
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Rookie Recycler</p>
                  <p className="text-[9px] text-amber-600/80 font-medium">5 Requests Completed</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-[1.5rem] flex flex-col items-center text-center group cursor-pointer hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] opacity-40 grayscale">
                    <Zap size={22} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">High Voltage</p>
                  <p className="text-[9px] text-slate-400 font-medium italic">Level 10 Achievement</p>
                </div>
              </div>

              {/* History Section in Center */}
              <div className="mt-auto pt-8 border-t border-slate-50 space-y-4">
                <div
                  onClick={() => router.push('/citizen/book-recycle/requests')}
                  className="bg-emerald-600 rounded-3xl p-7 text-white flex flex-col justify-between group hover:bg-emerald-700 transition-all cursor-pointer shadow-lg shadow-emerald-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Package className="mb-3 text-emerald-200" size={28} />
                      <h4 className="text-xl font-bold">My Recycles</h4>
                      <p className="text-emerald-100/70 text-[11px] uppercase font-black tracking-widest">View Activity Logs</p>
                    </div>
                    <ArrowRight className="group-hover:translate-x-2 transition-transform opacity-50" size={28} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 3: Logistics & Address (Right) */}
          <div className="xl:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 p-8 border border-emerald-50 h-full"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Pickup Nexus</h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">Logistics coordinates</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Street Address</label>
                  <textarea
                    disabled={!isEditing}
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-8 py-5 rounded-[2rem] border transition-all text-emerald-600 font-bold text-lg resize-none ${isEditing ? 'bg-emerald-50/30 border-emerald-200 outline-none ring-4 ring-emerald-500/5 focus:border-emerald-500' : 'bg-slate-50/50 border-transparent'}`}
                    placeholder="Unit, Floor, Building, Area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1">City</label>
                    <input
                      disabled={!isEditing}
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-6 py-5 rounded-[1.5rem] border transition-all text-emerald-600 font-bold text-lg ${isEditing ? 'bg-emerald-50/30 border-emerald-200 focus:border-emerald-500 outline-none' : 'bg-slate-50/50 border-transparent'}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1">Pincode</label>
                    <input
                      disabled={!isEditing}
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className={`w-full px-6 py-5 rounded-[1.5rem] border transition-all text-emerald-600 font-bold text-lg ${isEditing ? 'bg-emerald-50/30 border-emerald-200 focus:border-emerald-500 outline-none' : 'bg-slate-50/50 border-transparent'}`}
                    />
                  </div>
                  <div className="space-y-3 col-span-2">
                    <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1">State</label>
                    <input
                      disabled={!isEditing}
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`w-full px-6 py-5 rounded-[1.5rem] border transition-all text-emerald-600 font-bold text-lg ${isEditing ? 'bg-emerald-50/30 border-emerald-200 focus:border-emerald-500 outline-none' : 'bg-slate-50/50 border-transparent'}`}
                    />
                  </div>
                </div>

                <div className="pt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-[12px] font-black text-slate-900 uppercase tracking-wider ml-1">Latitude</p>
                      <p className="px-6 py-4 bg-slate-50 rounded-xl text-emerald-700 font-mono text-base border border-slate-100">{formData.latitude || '0.00'}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[12px] font-black text-slate-900 uppercase tracking-wider ml-1">Longitude</p>
                      <p className="px-6 py-4 bg-slate-50 rounded-xl text-emerald-700 font-mono text-base border border-slate-100">{formData.longitude || '0.00'}</p>
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAutoLocate}
                      className="w-full py-4.5 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-3 border border-emerald-200 text-base shadow-sm"
                    >
                      <Sparkles size={20} /> Auto Locate Address
                    </button>
                  )}
                </div>

                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col gap-3"
                  >
                    <button
                      onClick={handleUpdate}
                      disabled={isSaving}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Sync Profile</>}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}
                      className="w-full py-3 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm"
                    >
                      Cancel Changes
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* NEW: Referral Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <Users className="text-emerald-400" size={20} />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">Citizen Network</h3>
                </div>
                <p className="text-emerald-100/60 text-xs leading-relaxed mb-6">Invite fellow citizens and unlock the <b>Premium Recycler</b> badge.</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-white/10 flex items-center justify-center text-[10px] font-bold">+</div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 ml-2">Progress: 66%</p>
                </div>
              </div>
              <TrendingUp className="absolute bottom-[-20px] right-[-20px] text-white/5 w-40 h-40 -rotate-12" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
