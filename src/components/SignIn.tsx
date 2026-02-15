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
}

type AuthView = 'login' | 'role-selection' | 'register-citizen' | 'register-intermediary' | 'otp-verify';
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
  facilityServiceAreas: ServiceArea[];
}

export const SignIn: React.FC<SignInProps> = ({ isOpen, onClose, onSignIn }) => {
  const { showToast } = useToast();
  
  // State Machine
  const [view, setView] = useState<AuthView>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

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
    facilityServiceAreas: [{ address: '', pincode: '', city: '', state: '' }]
  });
  const [fileName, setFileName] = useState<string | null>(null);

  // --- Animation Elements ---
  const [fallingItems, setFallingItems] = useState<Array<{id: number, type: string, left: number, delay: number}>>([]);

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Reset state on open
      setView('login');
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
        const response = await fetch('/api/auth/sign-in', {
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
          showToast(data.message || 'Login failed', 'error');
          setIsLoading(false);
          return;
        }

        // Store auth data - handle both token structures
        const token = data.token || data.tokens?.accessToken;
        const user = data.user;
        
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
      
      if (view === 'register-citizen') {
        payload = {
          name: citizenData.name,
          email: citizenData.email,
          mobileNumber: citizenData.mobile,
          password: citizenData.password,
          role: 'CITIZEN',
          address: {
            address: citizenData.address,
            latitude: parseFloat(citizenData.latitude) || 0,
            longitude: parseFloat(citizenData.longitude) || 0,
            pincode: citizenData.pincode,
            city: citizenData.city,
            state: citizenData.state,
          }
        };
      } else {
        // Intermediary registration
        payload = {
          ...facilityData,
          role: 'INTERMEDIARY',
        };
      }

      const response = await fetch('/api/auth/register', {
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
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: view === 'register-citizen' ? citizenData.email : facilityData.email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'OTP verification failed', 'error');
        return;
      }

      // Store auth data if provided
      if (data.token) setToken(data.token);
      if (data.user) {
        setUser(data.user);
        if (data.user.id) setUserID(data.user.id);
        if (data.user.name) setFullName(data.user.name);
        if (data.user.email) setEmail(data.user.email);
        if (data.user.mobileNumber) setMobileNumber(data.user.mobileNumber);
        if (data.user.role) setRole(data.user.role);
      }

      showToast('Verification successful!', 'success');
      onSignIn();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      showToast(error.message || 'An error occurred during verification', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    try {
      const response = await fetch('/api/auth/resend-otp', {
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
    .waste-item {
      position: absolute;
      top: 0;
      animation: fallToBin 5s infinite linear;
      z-index: 10;
    }
    .label-tiny {
      display: block;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin-bottom: 0.35rem;
    }
    .input-compact {
      width: 100%;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: #111827;
      font-weight: 500;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    .input-compact:focus {
      border-color: #d9f99d;
      box-shadow: 0 0 0 3px rgba(217, 249, 157, 0.3);
    }
    .input-compact::placeholder {
      color: #9ca3af;
    }
  `;

  // Helper to determine if we need wide layout
  const isWideView = view === 'register-citizen' || view === 'register-intermediary';

  return (
    <div className="fixed inset-0 z-[100] flex bg-white animate-fade-in-up">
      <style>{animationStyles}</style>
      
      {/* LEFT SIDE: Animation Panel */}
      <div className="hidden lg:flex w-[40%] bg-eco-950 relative overflow-hidden flex-col items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-b from-eco-900 to-eco-950"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tech-lime/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-20 pt-20 px-12 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-tech-lime text-xs font-bold uppercase tracking-wider mb-6">
             <Recycle size={14} /> The Future of E-Waste
           </div>
           <h2 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
             Turn your old gadgets into <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-lime to-emerald-400">new possibilities.</span>
           </h2>
           <p className="text-eco-200/60 text-lg max-w-md mx-auto leading-relaxed">
             Join the global network that is recovering millions of precious materials from electronic waste every day.
           </p>
        </div>

        <div className="relative w-full flex-1 flex justify-center perspective-1000 overflow-hidden">
          {fallingItems.map((item) => (
            <div 
              key={item.id} 
              className="waste-item text-eco-200/80 drop-shadow-[0_0_15px_rgba(217,249,157,0.3)]"
              style={{ 
                left: `${item.left}%`, 
                animationDelay: `${item.delay}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            >
              {item.type === 'phone' && <Smartphone size={32} strokeWidth={1.5} />}
              {item.type === 'battery' && <Battery size={32} strokeWidth={1.5} />}
              {item.type === 'laptop' && <Laptop size={48} strokeWidth={1.5} />}
            </div>
          ))}

          <div className="absolute bottom-24 w-72 h-64 z-20">
              <div className="absolute inset-x-6 bottom-0 h-48 bg-eco-800/80 rounded-b-[2.5rem] transform skew-x-3 border border-white/5"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl flex items-center justify-center flex-col z-30 group">
                <div className="w-24 h-2 bg-tech-lime/50 rounded-full mb-6 group-hover:bg-tech-lime/80 transition-colors"></div>
                <div className="relative">
                  <div className="absolute inset-0 bg-tech-lime/20 blur-xl rounded-full animate-pulse"></div>
                  <Recycle className="text-white relative z-10" size={64} strokeWidth={1.5} />
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <span className="text-xs text-tech-lime font-bold uppercase tracking-[0.2em]">Processing</span>
                  <div className="flex gap-1">
                     <span className="w-1 h-1 bg-tech-lime rounded-full animate-bounce"></span>
                     <span className="w-1 h-1 bg-tech-lime rounded-full animate-bounce delay-75"></span>
                     <span className="w-1 h-1 bg-tech-lime rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
          </div>
        </div>
        
        <div className="relative z-20 pb-8 text-eco-200/40 text-xs uppercase tracking-widest font-medium">
          Powered by EcoBot AI & Gemini
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
                <div className="mb-10">
                  <h3 className="font-display font-bold text-4xl text-eco-900 mb-3">Welcome Back</h3>
                  <p className="text-gray-500 text-lg">Enter your credentials to access your dashboard.</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
                  <button onClick={() => setLoginMethod('password')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${loginMethod === 'password' ? 'bg-white text-eco-900' : 'bg-transparent text-gray-400 shadow-none hover:text-gray-600'}`}>Password</button>
                  <button onClick={() => setLoginMethod('otp')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${loginMethod === 'otp' ? 'bg-white text-eco-900' : 'bg-transparent text-gray-400 shadow-none hover:text-gray-600'}`}>One-Time Password</button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="group">
                    <label className="label-tiny">Email or Mobile</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" size={20} />
                      <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="input-compact !pl-12" placeholder="user@example.com" required />
                    </div>
                  </div>
                  {loginMethod === 'password' && (
                    <div className="group">
                      <label className="label-tiny">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" size={20} />
                        <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="input-compact !pl-12" placeholder="••••••••" required />
                      </div>
                    </div>
                  )}
                  <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl bg-eco-900 text-white font-bold text-lg hover:bg-eco-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    {isLoading ? 'Authenticating...' : (loginMethod === 'password' ? 'Sign In' : 'Send Code')}
                    {!isLoading && <ArrowRight size={20} />}
                  </button>
                </form>
              </div>
            )}

            {/* --- VIEW: ROLE SELECTION --- */}
            {view === 'role-selection' && (
              <div className="animate-fade-in-up pt-4">
                <h3 className="font-display font-bold text-4xl text-center text-eco-900 mb-3">Join ELocate</h3>
                <p className="text-center text-gray-500 mb-12 text-lg">Choose your role in the ecosystem.</p>
                <div className="grid gap-6">
                  <button onClick={() => setView('register-citizen')} className="group relative p-8 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-tech-lime hover:bg-eco-50/30 transition-all hover:shadow-xl text-left flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-blue-100"><User size={32} /></div>
                    <div className="flex-1"><div className="flex justify-between items-center mb-1"><h4 className="font-bold text-xl text-gray-900 group-hover:text-eco-900">Citizen</h4><ArrowRight size={20} className="text-gray-300 group-hover:text-eco-600 transition-colors" /></div><p className="text-sm text-gray-500 leading-relaxed">I want to recycle my personal devices, earn rewards, and track my environmental impact.</p></div>
                  </button>
                  <button onClick={() => setView('register-intermediary')} className="group relative p-8 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-tech-lime hover:bg-eco-50/30 transition-all hover:shadow-xl text-left flex items-start gap-6">
                    <div className="w-16 h-16 bg-eco-50 text-eco-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-eco-100"><Building2 size={32} /></div>
                    <div className="flex-1"><div className="flex justify-between items-center mb-1"><h4 className="font-bold text-xl text-gray-900 group-hover:text-eco-900">Facility / Partner</h4><ArrowRight size={20} className="text-gray-300 group-hover:text-eco-600 transition-colors" /></div><p className="text-sm text-gray-500 leading-relaxed">I represent a recycling center, collector, or refurbisher looking to join the network.</p></div>
                  </button>
                </div>
              </div>
            )}

            {/* --- VIEW: REGISTER CITIZEN --- */}
            {view === 'register-citizen' && (
              <div className="animate-fade-in-up">
                 <div className="mb-6 text-center md:text-left">
                   <h3 className="font-display font-bold text-3xl text-eco-900 mb-1">Create Citizen Account</h3>
                   <p className="text-gray-500 text-sm">Start your journey towards a zero-waste lifestyle.</p>
                 </div>
                 
                 <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    
                    {/* Row 1: Name & Mobile */}
                    <div className="col-span-1">
                      <label className="label-tiny">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input type="text" required value={citizenData.name} onChange={(e) => handleCitizenChange('name', e.target.value)} className="input-compact !pl-12" placeholder="John Doe" />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="label-tiny">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input type="tel" required value={citizenData.mobile} onChange={(e) => handleCitizenChange('mobile', e.target.value)} className="input-compact !pl-12" placeholder="+91 9999999999" />
                      </div>
                    </div>

                    {/* Row 2: Email */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="label-tiny">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                          <input type="email" required value={citizenData.email} onChange={(e) => handleCitizenChange('email', e.target.value)} className="input-compact !pl-12" placeholder="citizen@gmail.com" />
                        </div>
                    </div>

                    {/* Row 3: Address */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="label-tiny">Address</label>
                      <div className="relative">
                        <Home className="absolute left-4 top-4 text-gray-400 pointer-events-none" size={18} />
                        <textarea rows={1} value={citizenData.address} onChange={(e) => handleCitizenChange('address', e.target.value)} className="input-compact !pl-12 resize-none py-3" placeholder="Street Address, Area"></textarea>
                      </div>
                    </div>

                    {/* Row 4: City, State, Pincode */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                       <div>
                          <label className="label-tiny">City</label>
                          <input type="text" value={citizenData.city} onChange={(e) => handleCitizenChange('city', e.target.value)} className="input-compact" placeholder="City" />
                       </div>
                       <div>
                          <label className="label-tiny">State</label>
                          <div className="relative">
                            <select 
                              value={citizenData.state} 
                              onChange={(e) => handleCitizenChange('state', e.target.value)} 
                              className="input-compact appearance-none bg-white pr-8"
                            >
                              <option value="">Select State</option>
                              {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                          </div>
                       </div>
                       <div>
                          <label className="label-tiny">Pincode</label>
                          <input type="text" value={citizenData.pincode} onChange={(e) => handleCitizenChange('pincode', e.target.value)} className="input-compact" placeholder="Pincode" />
                       </div>
                    </div>

                    {/* Row 5: Location */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                         <div className="col-span-4 md:col-span-3">
                            <label className="label-tiny">Latitude</label>
                            <input type="text" disabled value={citizenData.latitude} className="input-compact bg-white text-gray-500 text-xs py-2.5" placeholder="0.00" />
                         </div>
                         <div className="col-span-4 md:col-span-3">
                            <label className="label-tiny">Longitude</label>
                            <input type="text" disabled value={citizenData.longitude} className="input-compact bg-white text-gray-500 text-xs py-2.5" placeholder="0.00" />
                         </div>
                         <div className="col-span-4 md:col-span-6">
                            <button type="button" onClick={autoDetectCitizenLocation} className="w-full py-2.5 bg-tech-lime text-eco-900 rounded-lg font-bold hover:bg-lime-400 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm border border-tech-lime">
                               <Leaf size={16} /> <span className="hidden md:inline">Auto Detect Location</span><span className="md:hidden">Detect</span>
                            </button>
                         </div>
                    </div>

                    {/* Row 6: Passwords */}
                    <div className="col-span-1">
                       <label className="label-tiny">Password</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                          <input type="password" required value={citizenData.password} onChange={(e) => handleCitizenChange('password', e.target.value)} className="input-compact !pl-12" placeholder="••••••••" />
                       </div>
                    </div>
                    <div className="col-span-1">
                       <label className="label-tiny">Confirm Password</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                          <input type="password" required value={citizenData.confirmPassword} onChange={(e) => handleCitizenChange('confirmPassword', e.target.value)} className="input-compact !pl-12" placeholder="••••••••" />
                       </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <button type="submit" className="w-full py-3.5 rounded-xl bg-eco-900 text-white font-bold text-lg hover:bg-eco-800 transition-all shadow-lg hover:shadow-xl">
                          Complete Registration
                        </button>
                    </div>
                 </form>
              </div>
            )}

            {/* --- VIEW: REGISTER INTERMEDIARY --- */}
            {view === 'register-intermediary' && (
              <div className="animate-fade-in-up">
                 <div className="mb-6 text-center md:text-left">
                   <h3 className="font-display font-bold text-3xl text-eco-900 mb-1">Facility Registration</h3>
                   <p className="text-gray-500 text-sm">Register your organization as an official partner.</p>
                 </div>

                 <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    {/* Basic Info & Location Compacted */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="col-span-1 md:col-span-2">
                           <label className="label-tiny">Facility Name</label>
                           <input type="text" required className="input-compact" placeholder="GreenCycle Hub" value={facilityData.name} onChange={e => handleFacilityChange('name', e.target.value)} />
                        </div>
                        <div className="col-span-1">
                           <label className="label-tiny">Email</label>
                           <input type="email" required className="input-compact" placeholder="contact@facility.com" value={facilityData.email} onChange={e => handleFacilityChange('email', e.target.value)} />
                        </div>
                         <div className="col-span-1">
                           <label className="label-tiny">Contact Number</label>
                           <input type="tel" required className="input-compact" placeholder="+1 234 567 8900" value={facilityData.contactNumber} onChange={e => handleFacilityChange('contactNumber', e.target.value)} />
                        </div>
                        <div className="col-span-1">
                           <label className="label-tiny">Daily Capacity (kg)</label>
                           <input type="number" required className="input-compact" placeholder="1000" value={facilityData.capacity} onChange={e => handleFacilityChange('capacity', Number(e.target.value))} />
                        </div>
                         <div className="col-span-1">
                           <label className="label-tiny">Operating Hours</label>
                           <input type="text" required className="input-compact" placeholder="Mon-Fri, 9AM-5PM" value={facilityData.operatingHours} onChange={e => handleFacilityChange('operatingHours', e.target.value)} />
                        </div>
                        
                        {/* Address Block */}
                        <div className="col-span-1 md:col-span-2 pt-2 border-t border-gray-100 mt-2">
                          <div className="flex justify-between items-center mb-2">
                             <label className="label-tiny mb-0">Address</label>
                             <button type="button" onClick={autoDetectLocation} className="text-[10px] bg-tech-lime/20 text-eco-800 px-2 py-0.5 rounded hover:bg-tech-lime/40 transition-colors font-bold flex items-center gap-1 uppercase tracking-wide">
                               <Leaf size={10} /> Auto Detect
                             </button>
                          </div>
                          <input type="text" required className="input-compact mb-3" placeholder="Street Address" value={facilityData.address.address} onChange={e => handleAddressChange('address', e.target.value)} />
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                             <input type="text" className="input-compact" placeholder="City" value={facilityData.address.city} onChange={e => handleAddressChange('city', e.target.value)} />
                             <div className="relative">
                               <select 
                                 value={facilityData.address.state} 
                                 onChange={e => handleAddressChange('state', e.target.value)} 
                                 className="input-compact appearance-none bg-white pr-8 text-sm"
                               >
                                 <option value="">State</option>
                                 {INDIAN_STATES.map(state => (
                                   <option key={state} value={state}>{state}</option>
                                 ))}
                               </select>
                               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                             </div>
                             <input type="text" className="input-compact" placeholder="Zip" value={facilityData.address.pincode} onChange={e => handleAddressChange('pincode', e.target.value)} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <input type="number" disabled className="input-compact bg-gray-50 text-gray-500 text-xs" placeholder="Lat: 0.00" value={facilityData.address.latitude} />
                             <input type="number" disabled className="input-compact bg-gray-50 text-gray-500 text-xs" placeholder="Long: 0.00" value={facilityData.address.longitude} />
                          </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="pt-2 border-t border-gray-100">
                       <label className="label-tiny mb-2">Verification Documents</label>
                       <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-white hover:border-tech-lime transition-all">
                          <div className="flex items-center gap-3">
                              <UploadCloud className="w-5 h-5 text-gray-400" />
                              <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> (PDF, JPG)</p>
                          </div>
                          <input type="file" className="hidden" onChange={handleFileUpload} />
                       </label>
                       {fileName && <div className="mt-2 text-xs text-eco-700 flex items-center gap-1"><CheckCircle size={12}/> {fileName}</div>}
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl bg-eco-900 text-white font-bold text-lg hover:bg-eco-800 transition-all shadow-lg hover:shadow-xl">
                      Complete Registration
                    </button>
                 </form>
              </div>
            )}

            {/* --- VIEW: OTP VERIFICATION --- */}
            {view === 'otp-verify' && (
              <div className="max-w-md mx-auto animate-fade-in-up text-center pt-10">
                 <div className="w-16 h-16 bg-tech-lime/20 text-eco-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Mail size={32} />
                 </div>
                 <h3 className="font-display font-bold text-3xl text-eco-950 mb-2">Verify It's You</h3>
                 <p className="text-gray-500 mb-8 text-lg">
                   We've sent a 6-digit code to your email/mobile. <br/> Please enter it below to continue.
                 </p>

                 <form onSubmit={handleOtpVerify}>
                   <div className="flex gap-3 justify-center mb-8">
                      {otp.map((digit, idx) => (
                        <input 
                          key={idx}
                          id={`otp-${idx}`}
                          type="text" 
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 bg-white border border-gray-300 rounded-xl text-center text-2xl font-bold text-eco-900 focus:border-tech-lime focus:ring-2 focus:ring-tech-lime/50 focus:outline-none transition-all shadow-sm"
                        />
                      ))}
                   </div>
                   
                   <button 
                      type="submit" 
                      className="w-full py-4 rounded-xl bg-eco-900 text-white font-bold text-lg hover:bg-eco-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      Submit
                    </button>
                 </form>
                 <div className="mt-8 text-sm text-gray-500">
                   Didn't receive code? <button type="button" onClick={handleResendOtp} className="font-bold text-eco-700 hover:underline ml-1">Resend</button>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Global Input Styles */}
      <style>{`
        .input-std {
          width: 100%;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          color: #111827;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .input-std:focus {
          border-color: #d9f99d;
          box-shadow: 0 0 0 2px rgba(217, 249, 157, 0.5);
        }
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
};