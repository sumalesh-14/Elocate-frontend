'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, ArrowRight, User, Building2, MapPin,
  UploadCloud, Plus, Trash2, Phone, Home, ChevronDown, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { setToken, setUser, setUserID, setFullName, setEmail, setMobileNumber, setRole } from '@/lib/sign-in-auth';

interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  initialView?: AuthView;
}

type AuthView = 'login' | 'role-selection' | 'register-citizen' | 'register-intermediary' | 'otp-verify' | 'pending-approval' | 'account-pending';
type LoginMethod = 'password' | 'otp';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface Address { address: string; latitude: number; longitude: number; pincode: string; city: string; state: string; }
interface ServiceArea { address: string; pincode: string; city: string; state: string; }
interface IntermediaryPayload {
  name: string; address: Address; capacity: number; contactNumber: string;
  operatingHours: string; email: string; password: string;
  registrationNumber: string; facilityServiceAreas: ServiceArea[];
}

// ─── Shared Input Component ───────────────────────────────────────────────────
const Field = ({
  label, hint, icon: Icon, rightSlot, children
}: {
  label: string; hint?: React.ReactNode; icon?: React.ElementType;
  rightSlot?: React.ReactNode; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#3a5444]">{label}</label>
      {rightSlot}
    </div>
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0c4b8] pointer-events-none flex items-center z-10">
          <Icon size={16} strokeWidth={1.8} />
        </div>
      )}
      {children}
    </div>
    {hint && <p className="text-[11px] text-[#9ab5a2]">{hint}</p>}
  </div>
);

const inputCls = (hasIcon = true) =>
  `w-full min-h-[46px] bg-[#fdfdfd] border-2 border-solid !border-[#cbd5e1] rounded-xl text-[14px] text-[#0d2b1a] placeholder:text-[#94a3b8] outline-none transition-all focus:bg-white focus:!border-[#22883e] focus:ring-4 focus:ring-[#22883e]/10 relative z-0 ${hasIcon ? 'pl-10 pr-4' : 'px-4'}`;

const selectCls = `w-full min-h-[46px] bg-[#fdfdfd] border-2 border-solid !border-[#cbd5e1] rounded-xl text-[14px] text-[#0d2b1a] pl-4 pr-10 outline-none appearance-none transition-all focus:bg-white focus:!border-[#22883e] focus:ring-4 focus:ring-[#22883e]/10 cursor-pointer relative z-0`;

// ─── Recycle Icon SVG ─────────────────────────────────────────────────────────
const RecycleSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" stroke="#3bdf6f" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
    <path d="M26 11L31 18L26 16.5L21 18Z" fill="#3bdf6f" />
    <path d="M35 28Q39 22 33 17Q27 13 24 19" stroke="#3bdf6f" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M17 24Q13 30 19 35Q25 39 28 33" stroke="#3bdf6f" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M28 35L26 41L21 35L26 37Z" fill="#3bdf6f" />
    <path d="M33 17L40 17L37 22Z" fill="#3bdf6f" />
    <path d="M12 35L19 35L16 30Z" fill="#3bdf6f" />
  </svg>
);

// ─── Left Panel ───────────────────────────────────────────────────────────────
const LeftPanel = () => (
  <div className="hidden lg:flex w-[48%] shrink-0 bg-[#071e11] relative overflow-hidden flex-col items-center justify-center p-12 xl:p-20 border-r border-[#173824]">
    {/* Animated Blobs */}
    <div className="absolute w-[400px] h-[400px] bg-[#1a6b32] opacity-30 -top-32 -left-32 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />
    <div className="absolute w-[300px] h-[300px] bg-[#3bdf6f] opacity-15 bottom-[-50px] right-[-50px] blur-[80px] rounded-full animate-pulse pointer-events-none" style={{ animationDuration: '8s', animationDelay: '1s' }} />
    
    {/* Central Glow */}
    <div className="absolute w-[250px] h-[250px] bg-[#22883e] opacity-25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[80px] rounded-full pointer-events-none" />
    
    {/* Dot grid */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.8]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

    {/* Content Container */}
    <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center text-center">
      
      {/* Brand */}
      <div className="flex flex-col items-center gap-4 mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-[#1c4b2c] to-[#0a2518] border border-[#2d663f] rounded-3xl flex items-center justify-center shadow-[0_16px_40px_rgba(34,136,62,0.25)] shrink-0 animate-float">
          <RecycleSVG />
        </div>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-white font-bold text-[28px] tracking-wide">
          ELocate
        </span>
      </div>

      <div className="inline-flex items-center gap-2 bg-[#12311f] border border-[#1f4d30] rounded-full px-4 py-2 mb-8 shadow-xl">
        <span className="w-2 h-2 bg-[#3bdf6f] rounded-full block animate-pulse" />
        <span className="text-[10px] font-bold text-white/90 tracking-[1.5px] uppercase">Elocate Ecosystem</span>
      </div>

      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[42px] xl:text-[52px] font-bold text-white leading-[1.1] mb-6">
        The Future of<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3bdf6f] to-[#a2f0be]">Waste Recovery.</span>
      </h2>

      <p className="text-[15px] xl:text-[16px] text-white/60 font-medium leading-[1.7] mb-12 max-w-[360px]">
        Join thousands of citizens and partners building a sustainable world through intelligent e-waste management and rewards.
      </p>

      {/* Stats - Centered Grid */}
      <div className="grid grid-cols-3 gap-8 w-full pt-10 border-t border-white/10">
        {[
          { val: '12K+', lbl: 'Citizens', clr: 'text-[#3bdf6f]' },
          { val: '98%', lbl: 'Recovery', clr: 'text-[#3bdf6f]' },
          { val: '4.9★', lbl: 'Rating', clr: 'text-[#eab308]' }
        ].map((stat) => (
          <div key={stat.lbl} className="flex flex-col items-center">
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[32px] xl:text-[36px] font-bold text-white leading-none mb-2 flex items-baseline">
              {stat.val.replace(/[+%★]/, '')}
              <span className={`text-[20px] ${stat.clr} ml-0.5`}>{stat.val.match(/[+%★]/)?.[0]}</span>
            </div>
            <div className="text-[11px] xl:text-[12px] font-bold text-white/40 tracking-[1px] uppercase">
              {stat.lbl}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const SignIn: React.FC<SignInProps> = ({ isOpen, onClose, onSignIn, initialView = 'login' }) => {
  const { showToast } = useToast();

  const [view, setView] = useState<AuthView>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [registrationType, setRegistrationType] = useState<'citizen' | 'partner'>('citizen');
  const [fileName, setFileName] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [citizenData, setCitizenData] = useState({
    name: '', email: '', mobile: '', address: '', city: '', state: '',
    pincode: '', latitude: '', longitude: '', password: '', confirmPassword: ''
  });

  const [facilityData, setFacilityData] = useState<IntermediaryPayload>({
    name: '', address: { address: '', latitude: 0, longitude: 0, pincode: '', city: '', state: '' },
    capacity: 0, contactNumber: '', operatingHours: '', email: '', password: '',
    registrationNumber: '', facilityServiceAreas: [{ address: '', pincode: '', city: '', state: '' }]
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setView(initialView);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (loginMethod === 'otp') {
        setView('otp-verify');
        setOtp(['', '', '', '', '', '']);
        showToast('OTP sent to your email/mobile', 'info');
      } else {
        const response = await fetch('/api/v1/auth/sign-in', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPass }),
        });
        const data = await response.json();
        if (!response.ok) {
          if (data.message?.match(/pending|not approved|inactive/i)) { setView('account-pending'); setIsLoading(false); return; }
          showToast(data.message || 'Login failed', 'error'); setIsLoading(false); return;
        }
        const user = data.user;
        if (user && ['PARTNER', 'INTERMEDIARY'].includes(user.role) && user.isActive === false) { setView('account-pending'); setIsLoading(false); return; }
        const token = data.token || data.tokens?.accessToken;
        const refreshToken = data.refreshToken || data.tokens?.refreshToken;
        if (token) setToken(token, refreshToken, rememberMe);
        if (user) {
          setUser(user, rememberMe);
          if (user.id) setUserID(user.id);
          if (user.name || user.fullName) setFullName(user.name || user.fullName);
          if (user.email) setEmail(user.email);
          if (user.mobileNumber || user.phoneNumber) setMobileNumber(user.mobileNumber || user.phoneNumber);
          if (user.role) setRole(user.role);
        }
        
        const displayName = user?.name || user?.fullName || 'User';
        sessionStorage.setItem('pendingToast', JSON.stringify({ 
          message: `Welcome back, ${displayName}!\nYou have successfully logged into ELocate.`, 
          type: 'success' 
        }));
        
        onSignIn();
      }
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'register-citizen' && citizenData.password !== citizenData.confirmPassword) {
      showToast('Passwords do not match!', 'error'); return;
    }
    setIsLoading(true);
    try {
      const isCitizen = view === 'register-citizen';
      setRegistrationType(isCitizen ? 'citizen' : 'partner');
      const endpoint = isCitizen ? '/api/v1/auth/register' : '/api/v1/partner-auth/register';
      const payload = isCitizen
        ? { fullName: citizenData.name, email: citizenData.email, mobileNumber: citizenData.mobile, password: citizenData.password, role: 'CITIZEN', address: citizenData.address, latitude: parseFloat(citizenData.latitude) || 0, longitude: parseFloat(citizenData.longitude) || 0, pincode: citizenData.pincode, city: citizenData.city, state: citizenData.state }
        : { fullName: facilityData.name, email: facilityData.email, password: facilityData.password, mobileNumber: facilityData.contactNumber, registrationNumber: facilityData.registrationNumber, facilityName: facilityData.name, address: facilityData.address.address, latitude: facilityData.address.latitude, longitude: facilityData.address.longitude, capacity: facilityData.capacity, contactNumber: facilityData.contactNumber, operatingHours: facilityData.operatingHours, state: facilityData.address.state, pincode: facilityData.address.pincode };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) { showToast(data.message || 'Registration failed', 'error'); return; }
      setView('otp-verify'); setOtp(['', '', '', '', '', '']);
      showToast('Verification code sent to your email.', 'info');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    } finally { setIsLoading(false); }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { showToast('Please enter complete OTP', 'error'); return; }
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registrationType === 'citizen' ? citizenData.email : facilityData.email, otp: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) { showToast(data.message || 'OTP verification failed', 'error'); return; }
      
      if (registrationType === 'partner') { 
        showToast('Verification successful!\nYour partner account is pending approval.', 'success');
        setView('pending-approval'); 
      }
      else {
        const displayName = data.user?.name || data.user?.fullName || 'User';
        sessionStorage.setItem('pendingToast', JSON.stringify({ 
          message: `Registration Complete!\nWelcome to ELocate, ${displayName}.`, 
          type: 'success' 
        }));
        
        const token = data.token || data.tokens?.accessToken;
        const refreshToken = data.refreshToken || data.tokens?.refreshToken;
        if (token) setToken(token, refreshToken, rememberMe);
        if (data.user) { setUser(data.user, rememberMe); if (data.user.id) setUserID(data.user.id); if (data.user.name) setFullName(data.user.name); if (data.user.email) setEmail(data.user.email); if (data.user.mobileNumber) setMobileNumber(data.user.mobileNumber); if (data.user.role) setRole(data.user.role); }
        onSignIn();
      }
    } catch (error: any) { showToast(error.message || 'An error occurred', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const n = [...otp]; n[index] = value; setOtp(n);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
  };
  const handleResendOtp = async () => {
    try {
      await fetch('/api/v1/auth/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: registrationType === 'citizen' ? citizenData.email : facilityData.email }) });
      showToast('OTP resent successfully!', 'success');
    } catch { showToast('Failed to resend OTP', 'error'); }
  };

  const cc = (f: string, v: any) => setCitizenData(p => ({ ...p, [f]: v }));
  const fc = (f: keyof IntermediaryPayload, v: any) => setFacilityData(p => ({ ...p, [f]: v }));
  const ac = (f: keyof Address, v: any) => setFacilityData(p => ({ ...p, address: { ...p.address, [f]: v } }));
  const detectLocation = (isCitizen: boolean) => {
    if (isCitizen) { cc('latitude', '12.9716'); cc('longitude', '77.5946'); cc('city', 'Bengaluru'); cc('state', 'Karnataka'); cc('pincode', '560001'); }
    else { ac('latitude', 12.9716); ac('longitude', 77.5946); ac('city', 'Bengaluru'); ac('state', 'Karnataka'); ac('pincode', '560001'); }
    showToast('Location detected!', 'success');
  };

  // ─── Shared layout wrapper ──────────────────────────────────────────────────
  const renderRightShell = (content: React.ReactNode) => (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
      {/* Subtle corner gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #edf5f0, transparent 70%)' }} />
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 lg:px-10 shrink-0 relative z-10 border-b border-[#f0f5f2]">
        <button onClick={view === 'login' ? onClose : () => setView(view === 'register-citizen' || view === 'register-intermediary' ? 'role-selection' : 'login')}
          className="flex items-center gap-1.5 text-[12px] text-[#7a9e8a] hover:text-[#0d2b1a] transition-colors font-semibold">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <div className="text-[12px] text-[#7a9e8a]">
          {view === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setView(view === 'login' ? 'role-selection' : 'login')}
            className="text-[#22883e] font-bold hover:underline underline-offset-2">
            {view === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto w-full flex justify-center">
        <div className="w-full flex flex-col min-h-full py-8 px-6 sm:px-10 lg:px-12">
          <div className="w-full max-w-[360px] mx-auto mt-4 lg:mt-6">
            {content}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Submit button ──────────────────────────────────────────────────────────
  const renderSubmitBtn = (label: string) => (
    <button type="submit" disabled={isLoading}
      className="w-full min-h-[48px] bg-[#0a2518] hover:bg-[#122e1e] active:bg-[#0a2518] text-white rounded-xl text-[14px] font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(10,37,24,0.28)] hover:shadow-[0_6px_24px_rgba(10,37,24,0.36)] group">
      {isLoading
        ? <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
        : <>{label}<ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" /></>}
    </button>
  );

  // ─── Google/Apple buttons ───────────────────────────────────────────────────
  const renderSocialButtons = () => (
    <>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#eaf0ec]" />
        <span className="text-[11px] text-[#a8c4b4] font-medium">or continue with</span>
        <div className="flex-1 h-px bg-[#eaf0ec]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Google', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13.5 7.65C13.5 7.12 13.45 6.61 13.37 6.13H7.5V8.98H10.86C10.71 9.81 10.25 10.52 9.54 10.99V12.73H11.57C12.79 11.62 13.5 9.79 13.5 7.65Z" fill="#4285F4" /><path d="M7.5 14.5C9.17 14.5 10.57 13.96 11.57 12.73L9.54 10.99C8.99 11.36 8.3 11.59 7.5 11.59C5.88 11.59 4.51 10.51 4.03 9.04H1.94V10.83C2.93 12.83 5.07 14.5 7.5 14.5Z" fill="#34A853" /><path d="M4.03 9.04C3.91 8.67 3.84 8.28 3.84 7.88C3.84 7.48 3.91 7.09 4.03 6.72V4.93H1.94C1.34 6.13 1 7.47 1 8.88C1 10.29 1.34 11.63 1.94 12.83L4.03 11.04V9.04Z" fill="#FBBC05" /><path d="M7.5 4.16C8.38 4.16 9.17 4.47 9.8 5.06L11.62 3.24C10.57 2.28 9.17 1.5 7.5 1.5C5.07 1.5 2.93 3.17 1.94 5.17L4.03 6.96C4.51 5.49 5.88 4.16 7.5 4.16Z" fill="#EA4335" /></svg> },
          { name: 'Apple', icon: <svg width="13" height="15" viewBox="0 0 13 15" fill="none"><path d="M10.82 8.03C10.8 6.22 12.25 5.37 12.32 5.33C11.47 4.09 10.17 3.93 9.7 3.91C8.59 3.8 7.5 4.57 6.93 4.57C6.35 4.57 5.46 3.92 4.52 3.94C3.31 3.96 2.19 4.66 1.58 5.74C0.3 7.94 1.25 11.17 2.47 12.92C3.08 13.78 3.79 14.74 4.72 14.71C5.63 14.68 5.97 14.16 7.07 14.16C8.17 14.16 8.48 14.71 9.43 14.69C10.41 14.67 11.01 13.8 11.62 12.94C12.33 11.96 12.62 11 12.64 10.95C12.6 10.94 10.84 10.27 10.82 8.03Z" fill="#3a5444" /><path d="M9.02 2.77C9.52 2.17 9.84 1.34 9.74 0.5C9.02 0.53 8.13 0.97 7.62 1.56C7.16 2.08 6.76 2.94 6.88 3.76C7.67 3.82 8.49 3.36 9.02 2.77Z" fill="#3a5444" /></svg> },
        ].map(({ name, icon }) => (
          <button key={name} type="button"
            className="h-10 border border-[#e2ede6] bg-white rounded-xl flex items-center justify-center gap-2 text-[12px] font-medium text-[#3a5444] hover:bg-[#f6faf7] hover:border-[#c5dac9] transition-all">
            {icon}{name}
          </button>
        ))}
      </div>
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: LOGIN
  // ══════════════════════════════════════════════════════════════════════════════
  const renderLoginView = () => renderRightShell(
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[34px] lg:text-[36px] font-bold text-[#0a2518] leading-[1.1] mb-2 flex items-center gap-2 flex-nowrap whitespace-nowrap">
          <span>Welcome</span><span className="text-[#22883e]">Back.</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] font-normal mb-8 leading-relaxed max-w-[280px]">
          Access your account and continue your sustainable journey.
        </p>

        {/* Tabs */}
        <div className="flex bg-[#f0f5f2] rounded-[14px] p-1.5 mb-8">
          {(['password', 'otp'] as LoginMethod[]).map(m => (
            <button key={m} type="button" onClick={() => setLoginMethod(m)}
              className={`flex-1 h-9 rounded-[10px] text-[13px] font-bold transition-all ${loginMethod === m ? 'bg-white text-[#0a2518] shadow-sm' : 'text-[#7a9e8a] hover:text-[#0a2518]'}`}>
              {m === 'password' ? 'Password' : 'OTP Login'}
            </button>
          ))}
        </div>

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
          <Field label="Account Identifier" icon={Mail}>
            <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              className={inputCls()} placeholder="Email or phone number" required />
          </Field>

          {loginMethod === 'password' && (
            <Field label="Security Password" icon={Lock}
              rightSlot={<a href="#" className="text-[11px] text-[#22883e] font-bold hover:underline underline-offset-2">Forgot?</a>}>
              <input type={showPass ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)}
                className={`${inputCls()} pr-10`} placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0c4b8] hover:text-[#22883e] transition-colors z-10">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer select-none mt-1 mb-1">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-[#22883e] cursor-pointer" />
            <span className="text-[13px] text-[#55695e] font-medium">Remember me on this device</span>
          </label>

          {renderSubmitBtn(loginMethod === 'password' ? 'Sign In' : 'Send Secure Code')}

          {renderSocialButtons()}
        </form>
      </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: ROLE SELECTION
  // ══════════════════════════════════════════════════════════════════════════════
  const renderRoleView = () => renderRightShell(
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[34px] lg:text-[36px] font-bold text-[#0a2518] leading-[1.15] mb-2 flex items-center gap-2 flex-nowrap whitespace-nowrap">
          <span>Join</span><span className="text-[#22883e]">ELocate</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] mb-8">Choose your role in the ecosystem.</p>

        <div className="flex flex-col gap-4">
          {[
            { view: 'register-citizen' as AuthView, icon: <User size={22} strokeWidth={1.5} />, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', title: 'Citizen Account', badge: 'Individual', badgeColor: 'bg-blue-50 text-blue-600', desc: 'Recycle personal devices, earn eco-rewards, and track your environmental impact.' },
            { view: 'register-intermediary' as AuthView, icon: <Building2 size={22} strokeWidth={1.5} />, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', title: 'Facility / Partner', badge: 'Organization', badgeColor: 'bg-emerald-50 text-emerald-700', desc: 'Register as a recycling center, collector, or refurbisher to join our network.' },
          ].map(item => (
            <button key={item.view} onClick={() => setView(item.view)}
              className="group w-full text-left flex items-start gap-4 p-5 bg-white border border-[#e8f0ea] rounded-2xl hover:border-[#3bdf6f] hover:shadow-[0_4px_20px_rgba(59,223,111,0.12)] transition-all">
              <div className={`w-11 h-11 ${item.iconBg} ${item.iconColor} rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[15px] font-semibold text-[#0a2518]">{item.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-[12px] text-[#7a9e8a] leading-relaxed">{item.desc}</p>
              </div>
              <ArrowRight size={14} className="text-[#b0c4b8] group-hover:text-[#22883e] group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
            </button>
          ))}
        </div>
      </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: REGISTER CITIZEN
  // ══════════════════════════════════════════════════════════════════════════════
  const renderCitizenView = () => renderRightShell(
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[34px] lg:text-[36px] font-bold text-[#0a2518] leading-[1.15] mb-1 flex items-center gap-2 flex-nowrap whitespace-nowrap">
          <span>Create</span><span className="text-[#22883e]">Account</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] mb-7">Join the sustainable revolution today.</p>

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" icon={User}>
              <input type="text" required value={citizenData.name} onChange={e => cc('name', e.target.value)}
                className={inputCls()} placeholder="Alex Johnson" />
            </Field>
            <Field label="Mobile" icon={Phone}>
              <input type="tel" required value={citizenData.mobile} onChange={e => cc('mobile', e.target.value)}
                className={inputCls()} placeholder="+91 00000 00000" />
            </Field>
          </div>

          <Field label="Email Address" icon={Mail}>
            <input type="email" required value={citizenData.email} onChange={e => cc('email', e.target.value)}
              className={inputCls()} placeholder="alex@example.com" />
          </Field>

          <Field label="Address" icon={Home}>
            <input type="text" value={citizenData.address} onChange={e => cc('address', e.target.value)}
              className={inputCls()} placeholder="Building, Street, Area..." />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="City">
              <input type="text" value={citizenData.city} onChange={e => cc('city', e.target.value)}
                className={inputCls(false)} placeholder="City" />
            </Field>
            <Field label="State">
              <div className="relative w-full">
                <select value={citizenData.state} onChange={e => cc('state', e.target.value)} className={selectCls}>
                  <option value="">State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ab5a2] pointer-events-none" />
              </div>
            </Field>
            <Field label="Pincode">
              <input type="text" value={citizenData.pincode} onChange={e => cc('pincode', e.target.value)}
                className={inputCls(false)} placeholder="000000" />
            </Field>
          </div>

          {/* Location */}
          <div className="bg-[#f6faf7] border border-[#e2ede6] rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[['Latitude', citizenData.latitude], ['Longitude', citizenData.longitude]].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold text-[#9ab5a2] uppercase tracking-wide mb-0.5">{l}</p>
                  <p className="text-[13px] font-semibold text-[#0a2518]">{v || '—'}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => detectLocation(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#22883e] bg-white border border-[#c5dac9] rounded-lg px-3 h-8 hover:bg-[#22883e] hover:text-white hover:border-[#22883e] transition-all shrink-0">
              <MapPin size={12} />Auto-locate
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" icon={Lock}>
              <input type="password" required value={citizenData.password} onChange={e => cc('password', e.target.value)}
                className={inputCls()} placeholder="Min 8 characters" />
            </Field>
            <Field label="Confirm">
              <input type="password" required value={citizenData.confirmPassword} onChange={e => cc('confirmPassword', e.target.value)}
                className={inputCls(false)} placeholder="Repeat password" />
            </Field>
          </div>

          <div className="pt-2">
            {renderSubmitBtn('Create Account')}
          </div>
        </form>
      </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: REGISTER INTERMEDIARY
  // ══════════════════════════════════════════════════════════════════════════════
  const renderIntermediaryView = () => renderRightShell(
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[34px] lg:text-[36px] font-bold text-[#0a2518] leading-[1.15] mb-1 flex items-center gap-2 flex-nowrap whitespace-nowrap">
          <span>Facility</span><span className="text-[#22883e]">Portal</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] mb-7">Register your organization as an official partner.</p>

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
          <Field label="Organization Name">
            <input type="text" required value={facilityData.name} onChange={e => fc('name', e.target.value)}
              className={inputCls(false)} placeholder="GreenCycle Hub" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Registration ID">
              <input type="text" required value={facilityData.registrationNumber} onChange={e => fc('registrationNumber', e.target.value)}
                className={inputCls(false)} placeholder="REG-123456" />
            </Field>
            <Field label="Contact Number" icon={Phone}>
              <input type="tel" required value={facilityData.contactNumber} onChange={e => fc('contactNumber', e.target.value)}
                className={inputCls()} placeholder="+91 00000 00000" />
            </Field>
          </div>

          <Field label="Official Email" icon={Mail}>
            <input type="email" required value={facilityData.email} onChange={e => fc('email', e.target.value)}
              className={inputCls()} placeholder="contact@organization.com" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" icon={Lock}>
              <input type="password" required value={facilityData.password} onChange={e => fc('password', e.target.value)}
                className={inputCls()} placeholder="Min 8 characters" />
            </Field>
            <Field label="Daily Cap (kg)">
              <input type="number" required value={facilityData.capacity || ''} onChange={e => fc('capacity', Number(e.target.value))}
                className={inputCls(false)} placeholder="1000" />
            </Field>
          </div>

          <Field label="Operating Hours">
            <input type="text" required value={facilityData.operatingHours} onChange={e => fc('operatingHours', e.target.value)}
              className={inputCls(false)} placeholder="09:00 – 18:00" />
          </Field>

          {/* HQ Location */}
          <div className="bg-[#f6faf7] border border-[#e2ede6] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#3a5444]">HQ Location</span>
              <button type="button" onClick={() => detectLocation(false)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#22883e] bg-white border border-[#c5dac9] rounded-lg px-3 h-7 hover:bg-[#22883e] hover:text-white hover:border-[#22883e] transition-all">
                <MapPin size={11} />Detect
              </button>
            </div>
            <input type="text" required value={facilityData.address.address} onChange={e => ac('address', e.target.value)}
              className={`${inputCls(false)} bg-white`} placeholder="Street address" />
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={facilityData.address.city} onChange={e => ac('city', e.target.value)}
                className={`${inputCls(false)} bg-white text-[13px]`} placeholder="City" />
              <div className="relative">
                <select value={facilityData.address.state} onChange={e => ac('state', e.target.value)} className={`${selectCls} bg-white text-[13px]`}>
                  <option value="">State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ab5a2] pointer-events-none" />
              </div>
              <input type="text" value={facilityData.address.pincode} onChange={e => ac('pincode', e.target.value)}
                className={`${inputCls(false)} bg-white text-[13px]`} placeholder="Pincode" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[['Lat', facilityData.address.latitude], ['Long', facilityData.address.longitude]].map(([l, v]) => (
                <div key={l as string} className="bg-white rounded-lg border border-[#e2ede6] px-3 py-2 text-center">
                  <p className="text-[10px] font-bold text-[#9ab5a2] uppercase tracking-wider">{l}</p>
                  <p className="text-[13px] font-semibold text-[#0a2518] mt-0.5">{(v as number) || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#3a5444] mb-1.5">Verification Documents</p>
            <label className="flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed border-[#cfe0d3] rounded-xl cursor-pointer hover:border-[#3bdf6f] hover:bg-[#f6faf7] transition-all group">
              <UploadCloud size={22} className="text-[#9ab5a2] group-hover:text-[#22883e] mb-2 transition-colors" />
              <p className="text-[12px] font-semibold text-[#3a5444]">Upload documentation</p>
              <p className="text-[11px] text-[#9ab5a2] mt-0.5">PDF, JPG or PNG — max 10MB</p>
              <input type="file" className="hidden" onChange={e => e.target.files?.[0] && setFileName(e.target.files[0].name)} />
            </label>
            {fileName && (
              <div className="mt-2 flex items-center gap-2.5 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                <span className="text-[12px] font-medium text-emerald-800 truncate">{fileName}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            {renderSubmitBtn('Complete Registration')}
          </div>
        </form>
      </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: OTP
  // ══════════════════════════════════════════════════════════════════════════════
  const renderOtpView = () => renderRightShell(
      <div className="text-center">
        <div className="w-16 h-16 bg-[#f0faf3] border-2 border-[#c5e8d0] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail size={28} className="text-[#22883e]" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[28px] font-bold text-[#0a2518] mb-2">
          Verify Your <span className="text-[#22883e]">Identity</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] mb-8 max-w-[280px] mx-auto">
          We've sent a 6-digit verification code to your registered email address.
        </p>

        <form onSubmit={handleOtpVerify} className="flex flex-col items-center gap-6">
          <div className="flex gap-2.5">
            {otp.map((d, i) => (
              <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-11 h-13 text-center text-[20px] font-bold text-[#0a2518] bg-[#f6faf7] border-2 border-[#e2ede6] rounded-xl outline-none focus:border-[#3bdf6f] focus:bg-white focus:ring-2 focus:ring-[#3bdf6f]/20 transition-all"
                style={{ height: '52px' }}
              />
            ))}
          </div>

          <div className="w-full">
            {renderSubmitBtn('Verify Code')}
          </div>
        </form>

        <p className="text-[12px] text-[#9ab5a2] mt-5">
          Didn't receive it?{' '}
          <button type="button" onClick={handleResendOtp} className="text-[#22883e] font-semibold hover:underline underline-offset-2">
            Resend code
          </button>
        </p>
      </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: PENDING APPROVAL
  // ══════════════════════════════════════════════════════════════════════════════
  const renderPendingView = () => renderRightShell(
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 size={28} className="text-blue-500" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[28px] font-bold text-[#0a2518] mb-2">
          Application <span className="text-blue-500">Received</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] mb-8 max-w-[300px] mx-auto">
          Your partner application is being reviewed by our compliance team.
        </p>
        <div className="bg-[#f8fafc] border border-[#e8f0ea] rounded-2xl p-5 mb-6 text-left">
          <p className="text-[11px] font-bold text-[#0a2518] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />Next Steps
          </p>
          <ul className="flex flex-col gap-3">
            {['Facility data verification in progress', 'Operational capacity audit scheduled', 'Dashboard access pending approval'].map((s, i) => (
              <li key={i} className="flex items-center gap-3 text-[12px] text-[#5a7a6a]">
                <span className="w-5 h-5 rounded-full border border-[#c5dac9] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#9ab5a2]">{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={() => { onClose(); }} className="w-full h-11 bg-[#f6faf7] border border-[#e2ede6] text-[#3a5444] rounded-xl text-[13px] font-semibold hover:bg-[#edf5f0] transition-all">
          Return to Home
        </button>
      </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW: ACCOUNT PENDING
  // ══════════════════════════════════════════════════════════════════════════════
  const renderAccountPendingView = () => renderRightShell(
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={28} className="text-amber-500" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[28px] font-bold text-[#0a2518] mb-2">
          Access <span className="text-amber-500">Pending</span>
        </h1>
        <p className="text-[13px] text-[#7a9e8a] mb-8 max-w-[300px] mx-auto">
          Your partner profile is currently under review.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={14} className="text-amber-500" />
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Status Update</span>
          </div>
          <p className="text-[12px] text-amber-700/80 leading-relaxed">
            Once authorized, you will be notified at your registered email. This typically takes 48–72 hours.
          </p>
        </div>
        <button onClick={() => { setView('login'); setLoginEmail(''); setLoginPass(''); }}
          className="w-full h-11 bg-[#0a2518] text-white rounded-xl text-[13px] font-semibold hover:bg-[#122e1e] transition-all">
          Back to Login
        </button>
      </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex bg-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
      <LeftPanel />
      {view === 'login' && renderLoginView()}
      {view === 'role-selection' && renderRoleView()}
      {view === 'register-citizen' && renderCitizenView()}
      {view === 'register-intermediary' && renderIntermediaryView()}
      {view === 'otp-verify' && renderOtpView()}
      {view === 'pending-approval' && renderPendingView()}
      {view === 'account-pending' && renderAccountPendingView()}
    </div>
  );
};