'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, ArrowRight, Leaf, Recycle,
  Smartphone, Battery, Laptop, CheckCircle,
  Building2, User, MapPin, UploadCloud, Plus, Trash2, ArrowLeft, Phone, Home, ChevronDown
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

// --- Intermediary Payload Types ---
interface Address {
  address: string;
  latitude: number;
  longitude: number;
  pincode: string;
  city: string;
  state: string;
}

interface ServiceArea {
  address: string;
  pincode: string;
  city: string;
  state: string;
}

interface IntermediaryPayload {
  name: string;
  address: Address;
  capacity: number;
  contactNumber: string;
  operatingHours: string;
  email: string;
  password: string;
  registrationNumber: string;
  facilityServiceAreas: ServiceArea[];
}

export const SignIn: React.FC<SignInProps> = ({ isOpen, onClose, onSignIn, initialView = 'login' }) => {
  const { showToast } = useToast();

  // State Machine
  const [view, setView] = useState<AuthView>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [registrationType, setRegistrationType] = useState<'citizen' | 'partner'>('citizen');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Citizen Form State
  const [citizenData, setCitizenData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: ''
  });

  // Intermediary Form State (Matching Payload)
  const [facilityData, setFacilityData] = useState<IntermediaryPayload>({
    name: '',
    address: { address: '', latitude: 0, longitude: 0, pincode: '', city: '', state: '' },
    capacity: 0,
    contactNumber: '',
    operatingHours: '',
    email: '',
    password: '',
    registrationNumber: '',
    facilityServiceAreas: [{ address: '', pincode: '', city: '', state: '' }]
  });
  const [fileName, setFileName] = useState<string | null>(null);

  // --- Animation Elements ---
  const [fallingItems, setFallingItems] = useState<Array<{ id: number, type: string, left: number, delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Set the initial view (may be 'role-selection' when coming from Register button)
      setView(initialView);
      const items = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        type: ['phone', 'battery', 'laptop'][Math.floor(Math.random() * 3)],
        left: Math.random() * 80 + 10, // 10% to 90%
        delay: Math.random() * 8
      }));
      setFallingItems(items);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === 'otp') {
        // For OTP login, just move to OTP verification view
        setView('otp-verify');
        setOtp(['', '', '', '', '', '']);
        showToast('OTP sent to your email/mobile', 'info');
      } else {
        // Password login - call API
        const response = await fetch('/api/v1/auth/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPass,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if the error is due to pending approval
          if (data.message && (data.message.includes('pending') || data.message.includes('not approved') || data.message.includes('inactive'))) {
            setView('account-pending');
            setIsLoading(false);
            return;
          }
          showToast(data.message || 'Login failed', 'error');
          setIsLoading(false);
          return;
        }

        // Check if user account is active (for partners)
        const user = data.user;
        if (user && user.role === 'PARTNER' && user.isActive === false) {
          setView('account-pending');
          setIsLoading(false);
          return;
        }

        // Store auth data - handle both token structures
        const token = data.token || data.tokens?.accessToken;

        if (token) setToken(token);
        if (user) {
          setUser(user);
          if (user.id) setUserID(user.id);
          if (user.name || user.fullName) setFullName(user.name || user.fullName);
          if (user.email) setEmail(user.email);
          if (user.mobileNumber || user.phoneNumber) setMobileNumber(user.mobileNumber || user.phoneNumber);
          if (user.role) setRole(user.role);
        }

        showToast('Welcome back!', 'success');

        // Call the onSignIn callback which will handle navigation
        onSignIn();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(error.message || 'An error occurred during login', 'error');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (view === 'register-citizen') {
      if (citizenData.password !== citizenData.confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }
    }

    setIsLoading(true);

    try {
      let payload: any;
      let endpoint: string;

      if (view === 'register-citizen') {
        endpoint = '/api/v1/auth/register';
        setRegistrationType('citizen');
        payload = {
          fullName: citizenData.name,
          email: citizenData.email,
          mobileNumber: citizenData.mobile,
          password: citizenData.password,
          role: 'CITIZEN',
          address: citizenData.address,
          latitude: parseFloat(citizenData.latitude) || 0,
          longitude: parseFloat(citizenData.longitude) || 0,
          pincode: citizenData.pincode,
          city: citizenData.city,
          state: citizenData.state,
        };
      } else {
        // Partner/Intermediary registration - use partner endpoint
        endpoint = '/api/v1/partner-auth/register';
        setRegistrationType('partner');
        payload = {
          fullName: facilityData.name,
          email: facilityData.email,
          password: facilityData.password,
          mobileNumber: facilityData.contactNumber,
          registrationNumber: facilityData.registrationNumber,
          facilityName: facilityData.name,
          address: facilityData.address.address,
          latitude: facilityData.address.latitude,
          longitude: facilityData.address.longitude,
          capacity: facilityData.capacity,
          contactNumber: facilityData.contactNumber,
          operatingHours: facilityData.operatingHours,
          state: facilityData.address.state,
          pincode: facilityData.address.pincode,
        };
      }

      console.log('=== REGISTRATION DEBUG ===');
      console.log('Endpoint:', endpoint);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('========================');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'Registration failed', 'error');
        return;
      }

      // Move to OTP verification
      setView('otp-verify');
      setOtp(['', '', '', '', '', '']);
      showToast('Verification code sent to your email.', 'info');
    } catch (error: any) {
      console.error('Registration error:', error);
      showToast(error.message || 'An error occurred during registration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      showToast('Please enter complete OTP', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationType === 'citizen' ? citizenData.email : facilityData.email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'OTP verification failed', 'error');
        return;
      }

      showToast('Verification successful!', 'success');

      // Check if this is a partner registration
      if (registrationType === 'partner') {
        // Show pending approval screen for partners
        setView('pending-approval');
      } else {
        // For citizens, store auth data and proceed to login
        if (data.token) setToken(data.token);
        if (data.user) {
          setUser(data.user);
          if (data.user.id) setUserID(data.user.id);
          if (data.user.name) setFullName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.mobileNumber) setMobileNumber(data.user.mobileNumber);
          if (data.user.role) setRole(data.user.role);
        }
        onSignIn();
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      showToast(error.message || 'An error occurred during verification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: view === 'register-citizen' ? citizenData.email : facilityData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'Failed to resend OTP', 'error');
        return;
      }

      showToast('OTP resent successfully!', 'success');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  // Citizen Handlers
  const handleCitizenChange = (field: string, value: any) => {
    setCitizenData(prev => ({ ...prev, [field]: value }));
  };

  const autoDetectCitizenLocation = () => {
    handleCitizenChange('latitude', '37.7749');
    handleCitizenChange('longitude', '-122.4194');
    handleCitizenChange('city', 'San Francisco');
    handleCitizenChange('state', 'California');
    handleCitizenChange('pincode', '94103');
    showToast('Location detected successfully!', 'success');
  };

  // Intermediary Handlers
  const handleFacilityChange = (field: keyof IntermediaryPayload, value: any) => {
    setFacilityData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof Address, value: any) => {
    setFacilityData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleServiceAreaChange = (index: number, field: keyof ServiceArea, value: string) => {
    const newAreas = [...facilityData.facilityServiceAreas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setFacilityData(prev => ({ ...prev, facilityServiceAreas: newAreas }));
  };

  const addServiceArea = () => {
    setFacilityData(prev => ({
      ...prev,
      facilityServiceAreas: [...prev.facilityServiceAreas, { address: '', pincode: '', city: '', state: '' }]
    }));
  };

  const removeServiceArea = (index: number) => {
    if (facilityData.facilityServiceAreas.length === 1) return;
    const newAreas = facilityData.facilityServiceAreas.filter((_, i) => i !== index);
    setFacilityData(prev => ({ ...prev, facilityServiceAreas: newAreas }));
  };

  const autoDetectLocation = () => {
    handleAddressChange('latitude', 37.7749);
    handleAddressChange('longitude', -122.4194);
    handleAddressChange('city', 'San Francisco');
    handleAddressChange('state', 'California');
    handleAddressChange('pincode', '94103');
    showToast('Location detected successfully!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move focus to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // --- Animation CSS ---
  const animationStyles = `
    @keyframes fallToBin {
      0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      70% { opacity: 1; transform: translateY(60vh) rotate(180deg); scale(0.9); }
      90% { transform: translateY(65vh) rotate(360deg); opacity: 0; scale(0.5); }
      100% { opacity: 0; }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(190, 242, 100, 0.2); }
      50% { box-shadow: 0 0 40px rgba(190, 242, 100, 0.4); }
    }
    .waste-item {
      position: absolute;
      top: 0;
      animation: fallToBin 5s infinite linear;
      z-index: 10;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
    }
    .label-premium {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 0.75rem;
      font-family: var(--font-inter);
    }
    .input-premium {
      width: 100%;
      background-color: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.25rem 1.5rem;
      color: #1e293b;
      font-weight: 600;
      font-size: 1.15rem;
      outline: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--font-inter);
    }
    .input-premium:focus {
      border-color: #bef264;
      background-color: white;
      box-shadow: 0 10px 25px -5px rgba(190, 242, 100, 0.2);
      transform: translateY(-2px);
    }
    .input-premium::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
  `;

  // Helper to determine if we need wide layout
  const isWideView = view === 'register-citizen' || view === 'register-intermediary';

  return (
    <div className="fixed inset-0 z-[100] flex bg-white animate-fade-in-up">
      <style>{animationStyles}</style>

      {/* LEFT SIDE: Animation Panel */}
      <div className="hidden lg:flex w-[42%] bg-[#050a08] relative overflow-hidden flex-col items-center justify-between">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#0f291e,transparent)]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-tech-lime/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-20 pt-24 px-16 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-tech-lime text-xs font-black uppercase tracking-[0.2em] mb-10 animate-fade-in shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-tech-lime animate-ping"></div>
            ELocate Ecosystem
          </div>
          <h2 className="text-6xl font-display font-black text-white mb-8 leading-[1.1] tracking-tight">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-br from-tech-lime via-emerald-400 to-teal-400">Waste Recovery.</span>
          </h2>
          <p className="text-eco-100/40 text-xl max-w-md mx-auto leading-relaxed font-sans">
            Join thousands of citizens and partners building a sustainable world through intelligent e-waste management.
          </p>
        </div>

        <div className="relative w-full flex-1 flex justify-center perspective-[2000px] overflow-hidden">
          {fallingItems.map((item) => (
            <div
              key={item.id}
              className="waste-item text-white/20"
              style={{
                left: `${item.left}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            >
              <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                {item.type === 'phone' && <Smartphone size={32} strokeWidth={1} />}
                {item.type === 'battery' && <Battery size={32} strokeWidth={1} />}
                {item.type === 'laptop' && <Laptop size={40} strokeWidth={1} />}
              </div>
            </div>
          ))}

          <div className="absolute bottom-16 w-80 h-72 z-20">
            <div className="absolute inset-x-8 bottom-0 h-56 bg-black/40 rounded-b-[3rem] blur-2xl"></div>
            <div className="absolute inset-0 glass-card rounded-[3.5rem] flex items-center justify-center flex-col z-30 group transition-all duration-500 hover:scale-105">
              <div className="w-24 h-2.5 bg-tech-lime/20 rounded-full mb-10 overflow-hidden">
                <div className="w-1/2 h-full bg-tech-lime animate-[shimmer_2s_infinite]"></div>
              </div>

              <div className="relative p-8 rounded-full bg-tech-lime/10 border border-tech-lime/20 group-hover:border-tech-lime/50 transition-all duration-500">
                <div className="absolute inset-0 bg-tech-lime/20 blur-2xl rounded-full animate-pulse"></div>
                <Recycle className="text-tech-lime relative z-10" size={80} strokeWidth={1} />
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <span className="text-[10px] text-tech-lime/60 font-black uppercase tracking-[0.4em]">Neural Core Active</span>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-tech-lime rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-tech-lime rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-tech-lime rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 pb-12 flex flex-col items-center gap-4">
          <div className="flex gap-4 opacity-30">
            <div className="w-12 h-[1px] bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-12 h-[1px] bg-white"></div>
          </div>
          <span className="text-eco-100/20 text-[10px] uppercase tracking-[0.5em] font-black">
            Intelligent Infrastructure v2.0
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Content & Forms */}
      <div className="w-full lg:w-[60%] flex flex-col bg-[#FDFDFC] relative h-full shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">

        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-eco-900 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="font-display font-bold text-xl text-eco-900 tracking-tight ml-2">ELocate</span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            {view === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setView(view === 'login' ? 'role-selection' : 'login')}
              className="ml-2 text-eco-700 hover:text-eco-900 font-bold hover:underline transition-all"
            >
              {view === 'login' ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-40 pb-6 px-6 md:px-12 flex flex-col items-center justify-start">
          {/* Dynamic Width Container */}
          <div className={`w-full transition-all duration-300 ${isWideView ? 'max-w-3xl' : 'max-w-md'}`}>

            {/* --- VIEW: LOGIN --- */}
            {view === 'login' && (
              <div className="animate-fade-in-up">
                <div className="mb-12">
                  <h3 className="font-display font-black text-6xl text-slate-900 mb-4 tracking-tighter">
                    Welcome <span className="text-tech-lime drop-shadow-sm">Back</span>
                  </h3>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-sm">
                    Access your account and continue your sustainable journey.
                  </p>
                </div>

                <div className="flex bg-slate-100 p-2 rounded-[1.5rem] mb-10">
                  <button
                    onClick={() => setLoginMethod('password')}
                    className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all duration-300 ${loginMethod === 'password' ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    PASSWORD
                  </button>
                  <button
                    onClick={() => setLoginMethod('otp')}
                    className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all duration-300 ${loginMethod === 'otp' ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    OTP LOGIN
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-8">
                  <div className="group">
                    <label className="label-premium">Account Identifier</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-tech-lime group-focus-within:scale-110 transition-all pointer-events-none" size={24} />
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="input-premium !pl-16 shadow-sm"
                        placeholder="Email or phone number"
                        required
                      />
                    </div>
                  </div>

                  {loginMethod === 'password' && (
                    <div className="group">
                      <div className="flex justify-between items-end mb-0">
                        <label className="label-premium">Security Password</label>
                        <button type="button" className="text-xs font-bold text-tech-lime hover:underline mb-3">FORGOT?</button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-tech-lime group-focus-within:scale-110 transition-all pointer-events-none" size={24} />
                        <input
                          type="password"
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          className="input-premium !pl-16 shadow-sm"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-6 rounded-[2rem] bg-slate-900 text-white font-black text-xl hover:bg-slate-800 transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-tech-lime/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {loginMethod === 'password' ? 'SIGN IN' : 'SEND SECURE CODE'}
                          <div className="p-1 rounded-full bg-tech-lime text-slate-900 group-hover:translate-x-1 transition-transform">
                            <ArrowRight size={18} strokeWidth={3} />
                          </div>
                        </>
                      )}
                    </button>

                    <div className="mt-8 flex items-center gap-4 opacity-50">
                      <div className="flex-1 h-[1px] bg-slate-200"></div>
                      <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">ENCRYPTED LOGIN</span>
                      <div className="flex-1 h-[1px] bg-slate-200"></div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* --- VIEW: ROLE SELECTION --- */}
            {view === 'role-selection' && (
              <div className="animate-fade-in-up pt-4">
                <h3 className="font-display font-black text-6xl text-center text-slate-900 mb-4 tracking-tighter">Join <span className="text-tech-lime">ELocate</span></h3>
                <p className="text-center text-slate-400 mb-16 text-xl font-medium">Choose your role in the ecosystem.</p>
                <div className="grid gap-8">
                  <button onClick={() => setView('register-citizen')} className="group relative p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-tech-lime hover:bg-slate-50/50 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] text-left flex items-start gap-8">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-blue-100/50"><User size={40} strokeWidth={1.5} /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-black text-2xl text-slate-900 group-hover:text-black">Citizen Account</h4>
                        <div className="p-1 px-3 rounded-full bg-blue-100/50 text-blue-600 text-[10px] font-black tracking-widest uppercase">INDIVIDUAL</div>
                      </div>
                      <p className="text-base text-slate-400 leading-relaxed font-medium">Recycle personal devices, earn eco-rewards, and track your environmental impact.</p>
                      <div className="mt-4 flex items-center gap-2 text-tech-lime font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        GET STARTED <ArrowRight size={14} />
                      </div>
                    </div>
                  </button>

                  <button onClick={() => setView('register-intermediary')} className="group relative p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-400 hover:bg-slate-50/50 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] text-left flex items-start gap-8">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-sm border border-emerald-100/50"><Building2 size={40} strokeWidth={1.5} /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-black text-2xl text-slate-900 group-hover:text-black">Facility / Partner</h4>
                        <div className="p-1 px-3 rounded-full bg-emerald-100/50 text-emerald-600 text-[10px] font-black tracking-widest uppercase">ORGANIZATION</div>
                      </div>
                      <p className="text-base text-slate-400 leading-relaxed font-medium">Register as a recycling center, collector, or refurbisher to join our global network.</p>
                      <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        PARTNER WITH US <ArrowRight size={14} />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* --- VIEW: REGISTER CITIZEN --- */}
            {view === 'register-citizen' && (
              <div className="animate-fade-in-up">
                <div className="mb-10 text-center md:text-left">
                  <h3 className="font-display font-black text-5xl text-slate-900 mb-2 tracking-tight">Create <span className="text-tech-lime">Account</span></h3>
                  <p className="text-slate-400 text-lg font-medium">Join the sustainable revolution today.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-1">
                    <label className="label-premium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="text" required value={citizenData.name} onChange={(e) => handleCitizenChange('name', e.target.value)} className="input-premium !pl-14" placeholder="e.g. Alex Johnson" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="label-premium">Mobile Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="tel" required value={citizenData.mobile} onChange={(e) => handleCitizenChange('mobile', e.target.value)} className="input-premium !pl-14" placeholder="+91 00000 00000" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="label-premium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="email" required value={citizenData.email} onChange={(e) => handleCitizenChange('email', e.target.value)} className="input-premium !pl-14" placeholder="alex@example.com" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="label-premium">Primary Residence / Address</label>
                    <div className="relative">
                      <Home className="absolute left-5 top-5 text-slate-300" size={20} />
                      <textarea rows={1} value={citizenData.address} onChange={(e) => handleCitizenChange('address', e.target.value)} className="input-premium !pl-14 resize-none min-h-[80px] py-4" placeholder="Building, Street, Area..."></textarea>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="label-premium">City</label>
                      <input type="text" value={citizenData.city} onChange={(e) => handleCitizenChange('city', e.target.value)} className="input-premium" placeholder="City" />
                    </div>
                    <div>
                      <label className="label-premium">State</label>
                      <div className="relative">
                        <select
                          value={citizenData.state}
                          onChange={(e) => handleCitizenChange('state', e.target.value)}
                          className="input-premium appearance-none bg-[#f8fafc] pr-12 focus:bg-white"
                        >
                          <option value="">Select</option>
                          {INDIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                    <div>
                      <label className="label-premium">Pincode</label>
                      <input type="text" value={citizenData.pincode} onChange={(e) => handleCitizenChange('pincode', e.target.value)} className="input-premium" placeholder="000 000" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 flex gap-4 w-full">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Latitude</label>
                        <div className="text-lg font-black text-slate-900">{citizenData.latitude || '0.0000'}</div>
                      </div>
                      <div className="flex-1 border-l border-slate-200 pl-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Longitude</label>
                        <div className="text-lg font-black text-slate-900">{citizenData.longitude || '0.0000'}</div>
                      </div>
                    </div>
                    <button type="button" onClick={autoDetectCitizenLocation} className="shrink-0 py-4 px-8 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-tech-lime transition-all duration-300 flex items-center gap-3 shadow-sm border-2 border-slate-200 hover:border-tech-lime group">
                      <MapPin size={20} className="text-tech-lime group-hover:text-slate-900 transition-colors" />
                      AUTO-LOCATE
                    </button>
                  </div>

                  <div className="col-span-1">
                    <label className="label-premium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="password" required value={citizenData.password} onChange={(e) => handleCitizenChange('password', e.target.value)} className="input-premium !pl-14" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="label-premium">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="password" required value={citizenData.confirmPassword} onChange={(e) => handleCitizenChange('confirmPassword', e.target.value)} className="input-premium !pl-14" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-6 pt-6 border-t border-slate-100">
                    <button type="submit" className="w-full py-6 rounded-[2.5rem] bg-slate-900 text-white font-black text-xl hover:bg-slate-800 transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-tech-lime/20 flex items-center justify-center gap-4 group">
                      CREATE MY ACCOUNT
                      <div className="p-1 rounded-full bg-tech-lime text-slate-900 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={20} strokeWidth={3} />
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- VIEW: REGISTER INTERMEDIARY --- */}
            {view === 'register-intermediary' && (
              <div className="animate-fade-in-up">
                <div className="mb-10 text-center md:text-left">
                  <h3 className="font-display font-black text-5xl text-slate-900 mb-2 tracking-tight">Facility <span className="text-tech-lime">Portal</span></h3>
                  <p className="text-slate-400 text-lg font-medium">Register your organization as an official partner.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="label-premium">Organization Name</label>
                      <input type="text" required className="input-premium" placeholder="e.g. GreenCycle Hub" value={facilityData.name} onChange={e => handleFacilityChange('name', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label-premium">Registration ID</label>
                      <input type="text" required className="input-premium" placeholder="REG-123456" value={facilityData.registrationNumber} onChange={e => handleFacilityChange('registrationNumber', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label-premium">Official Email</label>
                      <input type="email" required className="input-premium" placeholder="contact@organization.com" value={facilityData.email} onChange={e => handleFacilityChange('email', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label-premium">Secure Password</label>
                      <input type="password" required className="input-premium" placeholder="Min 8 characters" value={facilityData.password} onChange={e => handleFacilityChange('password', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label-premium">Primary Contact</label>
                      <input type="tel" required className="input-premium" placeholder="+1 000 000 0000" value={facilityData.contactNumber} onChange={e => handleFacilityChange('contactNumber', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label-premium">Daily Cap (kg)</label>
                      <input type="number" required className="input-premium" placeholder="1000" value={facilityData.capacity} onChange={e => handleFacilityChange('capacity', Number(e.target.value))} />
                    </div>
                    <div className="col-span-1">
                      <label className="label-premium">Operating Window</label>
                      <input type="text" required className="input-premium" placeholder="e.g. 09:00 - 18:00" value={facilityData.operatingHours} onChange={e => handleFacilityChange('operatingHours', e.target.value)} />
                    </div>

                    <div className="col-span-1 md:col-span-2 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <label className="label-premium mb-0">Hq Location</label>
                        <button type="button" onClick={autoDetectLocation} className="text-[10px] font-black bg-tech-lime text-slate-900 px-4 py-2 rounded-full hover:shadow-lg transition-all flex items-center gap-2 group">
                          <MapPin size={14} className="group-hover:scale-110 transition-transform" /> DETECT
                        </button>
                      </div>
                      <input type="text" required className="input-premium mb-6 bg-white" placeholder="Street Address" value={facilityData.address.address} onChange={e => handleAddressChange('address', e.target.value)} />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input type="text" className="input-premium bg-white" placeholder="City" value={facilityData.address.city} onChange={e => handleAddressChange('city', e.target.value)} />
                        <div className="relative">
                          <select
                            value={facilityData.address.state}
                            onChange={e => handleAddressChange('state', e.target.value)}
                            className="input-premium bg-white appearance-none pr-12"
                          >
                            <option value="">State</option>
                            {INDIAN_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                        <input type="text" className="input-premium bg-white" placeholder="Pincode" value={facilityData.address.pincode} onChange={e => handleAddressChange('pincode', e.target.value)} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/50 rounded-2xl border border-slate-200 text-center">
                          <span className="text-[10px] font-black text-slate-400 block mb-1">LAT</span>
                          <span className="font-black text-slate-900 text-sm">{facilityData.address.latitude || '0.00'}</span>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-slate-200 text-center">
                          <span className="text-[10px] font-black text-slate-400 block mb-1">LONG</span>
                          <span className="font-black text-slate-900 text-sm">{facilityData.address.longitude || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-2 border-slate-100 rounded-[2.5rem] bg-white group hover:border-tech-lime transition-all duration-300">
                    <label className="label-premium mb-4">Verification Artifacts</label>
                    <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-slate-200 border-dashed rounded-3xl cursor-pointer hover:bg-slate-50 transition-all">
                      <div className="flex flex-col items-center gap-4 py-8">
                        <div className="p-4 bg-slate-100 rounded-full text-slate-400 group-hover:text-tech-lime transition-colors">
                          <UploadCloud size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-black text-slate-900">Upload documentation</p>
                          <p className="text-xs font-medium text-slate-400 mt-1">PDF, JPG or PNG (Max 10MB)</p>
                        </div>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {fileName && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-100 animate-slide-in-top">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"><CheckCircle size={18} /></div>
                        <span className="text-sm font-black text-emerald-900 truncate">{fileName}</span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full py-6 rounded-[2.5rem] bg-slate-900 text-white font-black text-xl hover:bg-slate-800 transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-tech-lime/20 flex items-center justify-center gap-4 group">
                    COMPLETE REGISTRATION
                    <div className="p-1 rounded-full bg-tech-lime text-slate-900 group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={20} strokeWidth={3} />
                    </div>
                  </button>
                </form>
              </div>
            )}

            {/* --- VIEW: OTP VERIFICATION --- */}
            {view === 'otp-verify' && (
              <div className="max-w-md mx-auto animate-fade-in-up text-center pt-10">
                <div className="w-24 h-24 bg-tech-lime/10 text-tech-lime rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl animate-glow">
                  <Mail size={48} strokeWidth={1} />
                </div>
                <h3 className="font-display font-black text-4xl text-slate-900 mb-4 tracking-tighter">Secure <span className="text-tech-lime">Verification</span></h3>
                <p className="text-slate-400 mb-12 text-xl font-medium leading-[1.6]">
                  We've sent a 6-digit code to your cloud identity. Enter it below to authorize.
                </p>

                <form onSubmit={handleOtpVerify} className="space-y-10">
                  <div className="flex gap-4 justify-center">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-16 h-20 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-3xl font-black text-slate-900 focus:border-tech-lime focus:bg-white focus:shadow-2xl focus:scale-110 focus:outline-none transition-all duration-300"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-6 rounded-[2.5rem] bg-slate-900 text-white font-black text-2xl hover:bg-slate-800 transition-all duration-300 shadow-2xl hover:shadow-tech-lime/20 group"
                  >
                    AUTHORIZE <ArrowRight className="inline ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                </form>

                <div className="mt-12 text-sm font-black text-slate-400 tracking-widest uppercase">
                  WAITING FOR CODE... <button type="button" onClick={handleResendOtp} className="text-tech-lime hover:underline ml-2">RESEND</button>
                </div>
              </div>
            )}

            {/* --- VIEW: PENDING APPROVAL --- */}
            {view === 'pending-approval' && (
              <div className="max-w-md mx-auto animate-fade-in-up text-center pt-10">
                <div className="w-28 h-28 bg-blue-50 text-blue-500 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-xl">
                  <Building2 size={56} strokeWidth={1} />
                </div>
                <h3 className="font-display font-black text-4xl text-slate-900 mb-6 tracking-tighter">Transmission <span className="text-blue-500">Received</span></h3>
                <p className="text-slate-400 mb-10 text-xl font-medium leading-relaxed">
                  Your partner application is being verified by our Neural Compliance Engine.
                </p>

                <div className="bg-slate-900 rounded-[3rem] p-10 mb-10 text-left relative overflow-hidden group">
                  <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                  <h4 className="font-black text-white text-lg mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></div>
                    NEXT STEPS
                  </h4>
                  <ul className="space-y-6">
                    {[
                      "Facility data verification in progress",
                      "Operational capacity audit scheduled",
                      "Cloud dashboard access pending approval"
                    ].map((step, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                          <CheckCircle size={14} className="text-white/20" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/';
                  }}
                  className="w-full py-6 rounded-[2.5rem] bg-slate-100 text-slate-900 font-black text-xl hover:bg-slate-200 transition-all duration-300"
                >
                  DISMISS VIEW
                </button>
              </div>
            )}

            {/* --- VIEW: ACCOUNT PENDING --- */}
            {view === 'account-pending' && (
              <div className="max-w-md mx-auto animate-fade-in-up text-center pt-10">
                <div className="w-28 h-28 bg-orange-100 text-orange-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-xl border-4 border-white">
                  <Lock size={56} strokeWidth={1} />
                </div>
                <h3 className="font-display font-black text-4xl text-slate-900 mb-6 tracking-tighter">Access <span className="text-orange-600">Restricted</span></h3>
                <p className="text-slate-400 mb-10 text-xl font-medium leading-relaxed">
                  Your partner profile is currently in the verification queue.
                </p>

                <div className="bg-orange-50 border-2 border-orange-100 rounded-[2.5rem] p-8 mb-10 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="text-orange-600" size={24} />
                    <span className="font-black text-orange-900 text-sm tracking-widest uppercase">Status Update</span>
                  </div>
                  <p className="text-base font-medium text-orange-800/80 leading-relaxed">
                    Once authorized, you will receive a secure transmission at your registered email address. This typically takes 48-72 standard cycles.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setView('login');
                    setLoginEmail('');
                    setLoginPass('');
                  }}
                  className="w-full py-6 rounded-[2.5rem] bg-slate-900 text-white font-black text-xl hover:bg-slate-800 transition-all duration-300 shadow-2xl"
                >
                  BACK TO LOGIN
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};