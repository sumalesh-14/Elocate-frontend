"use client";

import React, { useState, useEffect } from 'react';
import {
    Laptop, Smartphone, Printer, Tv, Headphones, Watch, Keyboard, HardDrive,
    ArrowRight, ArrowLeft, Upload, Check, MapPin, Calendar, Clock, Truck, Package,
    ShieldCheck, HelpCircle, Info
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getUserName, getEmail, getPhoneNumber } from '../../sign-in/auth';
import { deviceCategoriesApi, deviceModelsApi } from '@/lib/admin-api';
import { categoryBrandApi } from '@/lib/category-brand-api';

// --- Types ---
type Step = 1 | 2 | 3 | 4 | 5;
type DeviceType = string; // Changed from hardcoded union to string
type Condition = 'Working' | 'Minor Issues' | 'Broken' | 'Parts Only';
type ServiceType = 'Pickup' | 'Dropoff';

interface FormData {
    deviceType: DeviceType | null;
    categoryId: string;
    brandId: string;
    brand: string;
    modelId: string;
    model: string;
    condition: Condition | null;
    quantity: number;
    notes: string;
    serviceType: ServiceType | null;
    pickupDate: string;
    pickupTime: string;
    address: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

const RecycleRequestForm: React.FC = () => {
    const { showToast } = useToast();
    const router = useRouter();

    const INITIAL_DATA: FormData = {
        deviceType: null,
        categoryId: '',
        brandId: '',
        brand: '',
        modelId: '',
        model: '',
        condition: null,
        quantity: 1,
        notes: '',
        serviceType: null,
        pickupDate: '',
        pickupTime: '',
        address: '',
        contactName: getUserName() || 'User',
        contactEmail: getEmail() || '',
        contactPhone: getPhoneNumber() || '',
    };

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await deviceCategoriesApi.getAll();
                const activeCategories = response.data.content || response.data;
                setCategories(Array.isArray(activeCategories) ? activeCategories : []);
            } catch (error) {
                console.error("Error fetching categories:", error);
                showToast('Failed to load device categories.', 'error');
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch brands when categoryId changes
    useEffect(() => {
        const fetchBrands = async () => {
            if (!formData.categoryId) {
                setBrands([]);
                return;
            }
            setIsLoadingBrands(true);
            try {
                const response = await categoryBrandApi.getBrandsByCategory(formData.categoryId, 0, 100);
                const brandsList = response.data.content || response.data;
                setBrands(Array.isArray(brandsList) ? brandsList : []);
            } catch (error) {
                console.error("Error fetching brands:", error);
                showToast('Failed to load brands for this category.', 'error');
            } finally {
                setIsLoadingBrands(false);
            }
        };
        fetchBrands();
    }, [formData.categoryId]);

    // Fetch models when brandId changes
    useEffect(() => {
        const fetchModels = async () => {
            if (!formData.brandId || !formData.categoryId) {
                setModels([]);
                return;
            }
            setIsLoadingModels(true);
            try {
                const response = await deviceModelsApi.getAll({
                    categoryId: formData.categoryId,
                    brandId: formData.brandId,
                    size: 100
                });
                const modelsList = response.data.content || response.data;
                setModels(Array.isArray(modelsList) ? modelsList : []);
            } catch (error) {
                console.error("Error fetching models:", error);
                showToast('Failed to load models for this brand.', 'error');
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    }, [formData.brandId, formData.categoryId]);

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
    };

    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        showToast('Recycle request submitted successfully!\nYour eco-score will be updated soon.', 'success');
        router.push('/citizen/book-recycle/requests');
    };

    // --- Utility Components ---

    const VerticalStepper = () => {
        const steps = [
            { num: 1, title: 'Category', subtitle: 'Select your device' },
            { num: 2, title: 'Details', subtitle: 'Identify and describe' },
            { num: 3, title: 'Schedule', subtitle: 'Choose your convenience' },
            { num: 4, title: 'Location', subtitle: 'Set pickup address' },
            { num: 5, title: 'Finalize', subtitle: 'Confirm all info' },
        ];

        return (
            <div className="flex flex-col gap-8">
                {steps.map((s) => {
                    const isActive = currentStep === s.num;
                    const isCompleted = currentStep > s.num;

                    return (
                        <div key={s.num} className="flex gap-4 items-start group">
                            <div className="flex flex-col items-center">
                                <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                        ${isActive
                                        ? 'bg-eco-500 border-eco-500 text-white shadow-lg shadow-eco-500/30 scale-110'
                                        : isCompleted
                                            ? 'bg-eco-100 border-eco-500 text-eco-700 font-bold'
                                            : 'bg-white border-gray-200 text-gray-400 group-hover:border-eco-300'}
                    `}>
                                    {isCompleted ? <Check size={18} /> : s.num}
                                </div>
                                {s.num !== 5 && (
                                    <div className={`w-0.5 h-12 my-1 transition-colors duration-500 ${isCompleted ? 'bg-eco-500' : 'bg-gray-100'}`}></div>
                                )}
                            </div>
                            <div className="pt-1">
                                <h3 className={`font-bold transition-colors ${isActive ? 'text-eco-900' : isCompleted ? 'text-eco-700' : 'text-gray-400'}`}>
                                    {s.title}
                                </h3>
                                <p className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {s.subtitle}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const StepInfo = () => {
        const infoMap = {
            1: {
                title: "Starting the journey",
                desc: "Electronic devices contain harmful chemicals like lead and mercury. Categorizing them helps us use the right recycling process.",
                icon: <HelpCircle className="text-eco-500" size={32} />
            },
            2: {
                title: "Refurbishment Potential",
                desc: "Working devices might be refurbished for underserved communities. Identifying the brand helps us estimate environmental impact.",
                icon: <Info className="text-emerald-600" size={32} />
            },
            3: {
                title: "Optimized Logistics",
                desc: "Our pickup routes are AI-optimized to reduce fuel consumption. Choose a slot and help us keep our transit green.",
                icon: <Truck className="text-eco-500" size={32} />
            },
            4: {
                title: "Stay Connected",
                desc: "Our drivers will contact you 15 minutes before arrival. Ensure your address is accurate to avoid missed collections.",
                icon: <MapPin className="text-emerald-500" size={32} />
            },
            5: {
                title: "Secure & Safe",
                desc: "All recycled devices undergo a secure 3-stage data destruction process. Your data safety is our priority.",
                icon: <ShieldCheck className="text-eco-600" size={32} />
            }
        };

        const currentInfo = infoMap[currentStep as keyof typeof infoMap];

        return (
            <div className="bg-white/50 backdrop-blur-sm border border-eco-100 rounded-3xl p-8 mt-12 transition-all duration-500">
                <div className="mb-4">{currentInfo.icon}</div>
                <h4 className="text-lg font-bold text-eco-900 mb-2">{currentInfo.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{currentInfo.desc}</p>
            </div>
        );
    };

    // --- Step Components ---

    const Step1_DeviceType = () => {
        const getIconForCategory = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes('laptop')) return Laptop;
            if (n.includes('smartphone') || n.includes('mobile') || n.includes('phone')) return Smartphone;
            if (n.includes('printer')) return Printer;
            if (n.includes('television') || n.includes('tv')) return Tv;
            if (n.includes('audio') || n.includes('speaker') || n.includes('headphone')) return Headphones;
            if (n.includes('wearable') || n.includes('watch')) return Watch;
            if (n.includes('peripheral') || n.includes('keyboard') || n.includes('mouse')) return Keyboard;
            return HardDrive;
        };

        if (isLoadingCategories) {
            return (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-16 h-16 bg-eco-100 rounded-full mb-4 flex items-center justify-center">
                        <Package className="text-eco-400" size={32} />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching categories...</p>
                </div>
            );
        }

        return (
            <div className="space-y-8 animate-fade-in-up">
                {/* Photo Upload Option Placeholder */}
                <div className="bg-eco-50 border-2 border-dashed border-eco-200 rounded-[2rem] p-8 text-center hover:bg-eco-100 transition-all cursor-pointer group shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-eco-600 shadow-md group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                    </div>
                    <h3 className="font-bold text-eco-900 text-lg">Snap & Identify</h3>
                    <p className="text-sm text-eco-600 mt-1 max-w-xs mx-auto font-medium">Coming soon: Upload a photo and our AI will automatically detect your device.</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-white text-gray-400 font-bold tracking-widest uppercase italic">Or select category manually</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat) => {
                        const Icon = getIconForCategory(cat.name);
                        const isSelected = formData.deviceType === cat.name;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    updateField('deviceType', cat.name);
                                    updateField('categoryId', cat.id);
                                    // Reset dependent fields
                                    updateField('brandId', '');
                                    updateField('brand', '');
                                    updateField('modelId', '');
                                    updateField('model', '');
                                }}
                                className={`
                  p-6 rounded-2xl border-2 text-left transition-all hover:shadow-xl flex items-center gap-5 group/btn
                  ${isSelected
                                        ? 'border-eco-500 bg-eco-50/50 shadow-md'
                                        : 'border-slate-50 bg-slate-50/30 hover:bg-emerald-50/80 hover:border-emerald-200'}
                `}
                            >
                                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center transition-all shrink-0
                  ${isSelected ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}
                `}>
                                    <Icon size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`font-bold text-lg truncate ${isSelected ? 'text-eco-950' : 'text-gray-900'}`}>{cat.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 font-medium truncate">{cat.description || 'Misc Electronics'}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const Step2_DeviceDetails = () => {
        const conditions: { val: Condition; label: string; desc: string }[] = [
            { val: 'Working', label: 'Pristine / Working', desc: 'Fully functional, no damage' },
            { val: 'Minor Issues', label: 'Fair / Minor Issues', desc: 'Working with cosmetic wear' },
            { val: 'Broken', label: 'Broken / Damaged', desc: 'Powers on but part functionality' },
            { val: 'Parts Only', label: 'Scrap / Parts', desc: 'Does not power on, non-functional' },
        ];

        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-eco-950">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Device Brand</label>
                        <div className="relative group">
                            <select
                                value={formData.brandId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const brandName = brands.find(b => b.brand.id === id)?.brand.name || '';
                                    updateField('brandId', id);
                                    updateField('brand', brandName);
                                    // Reset model
                                    updateField('modelId', '');
                                    updateField('model', '');
                                }}
                                disabled={isLoadingBrands || !formData.categoryId}
                                className="w-full px-5 py-4 rounded-xl border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-gray-900 bg-emerald-50/20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                <option value="">{isLoadingBrands ? "Loading Brands..." : "Select Brand"}</option>
                                {brands.map((b) => (
                                    <option key={b.brand.id} value={b.brand.id}>{b.brand.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                                <ArrowRight size={16} className="rotate-90" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Exact Model</label>
                        <div className="relative group">
                            <select
                                value={formData.modelId}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const modelName = models.find(m => m.id === id)?.modelName || '';
                                    updateField('modelId', id);
                                    updateField('model', modelName);
                                }}
                                disabled={isLoadingModels || !formData.brandId}
                                className="w-full px-5 py-4 rounded-xl border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-gray-900 bg-emerald-50/20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                <option value="">
                                    {!formData.brandId ? "Select brand first" : (isLoadingModels ? "Loading Models..." : "Select Model")}
                                </option>
                                {models.map((m) => (
                                    <option key={m.id} value={m.id}>{m.modelName}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                                <ArrowRight size={16} className="rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Device Condition</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conditions.map((cond) => (
                            <button
                                key={cond.val}
                                onClick={() => updateField('condition', cond.val)}
                                className={`
                  p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md
                  ${formData.condition === cond.val
                                        ? 'border-eco-500 bg-eco-50 shadow-sm'
                                        : 'border-slate-50 bg-slate-50/40 hover:bg-emerald-50/80 hover:border-emerald-200 hover:scale-[1.01]'}
                `}
                            >
                                <div className={`font-bold ${formData.condition === cond.val ? 'text-eco-900' : 'text-gray-900'}`}>{cond.label}</div>
                                <div className="text-xs text-gray-400 mt-1 font-medium">{cond.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                    <div>
                        <h4 className="font-bold text-gray-900">Total Quantity</h4>
                        <p className="text-xs text-gray-500">How many units of this type?</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => updateField('quantity', Math.max(1, formData.quantity - 1))}
                            className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:shadow-md transition-shadow font-bold text-gray-600 text-xl"
                        >
                            -
                        </button>
                        <span className="text-3xl font-display font-bold text-eco-950 w-8 text-center leading-none">{formData.quantity}</span>
                        <button
                            onClick={() => updateField('quantity', formData.quantity + 1)}
                            className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:shadow-md transition-shadow font-bold text-gray-600 text-xl"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Detailed Notes <span className="text-gray-400 font-normal ml-1">(Highly Recommended)</span></label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder="Tell us about the damage, missing parts, or special handling..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all resize-none text-gray-900 bg-gray-50/30"
                    />
                </div>
            </div>
        );
    };

    const Step3_ServiceType = () => {
        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => updateField('serviceType', 'Pickup')}
                        className={`
              p-8 rounded-[2rem] border-2 text-left transition-all hover:shadow-xl group relative overflow-hidden
              ${formData.serviceType === 'Pickup'
                                ? 'border-eco-500 bg-eco-50 shadow-md'
                                : 'border-slate-50 bg-slate-50/30 hover:border-eco-200'}
            `}
                    >
                        <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all
              ${formData.serviceType === 'Pickup' ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}
            `}>
                            <Truck size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">Home Pickup</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">Free concierge collection from your doorstep. Zero effort required.</p>
                        {formData.serviceType === 'Pickup' && (
                            <div className="absolute top-6 right-6 w-8 h-8 bg-eco-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-slow">
                                <Check size={18} />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => updateField('serviceType', 'Dropoff')}
                        className={`
              p-8 rounded-[2rem] border-2 text-left transition-all hover:shadow-xl group relative overflow-hidden
              ${formData.serviceType === 'Dropoff'
                                ? 'border-eco-500 bg-eco-50 shadow-md'
                                : 'border-slate-50 bg-slate-50/40 hover:bg-emerald-50/80 hover:border-emerald-200 hover:scale-[1.01]'}
            `}
                    >
                        <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all
              ${formData.serviceType === 'Dropoff' ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}
            `}>
                            <Package size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">Drop-off</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">Bring it to our nearest center anytime. Best for single small items.</p>
                        {formData.serviceType === 'Dropoff' && (
                            <div className="absolute top-6 right-6 w-8 h-8 bg-eco-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-slow">
                                <Check size={18} />
                            </div>
                        )}
                    </button>
                </div>

                {formData.serviceType === 'Pickup' && (
                    <div className="pt-8 border-t border-gray-100 animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-eco-500" />
                            Select Date & Time
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700">Preferred Date</label>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        value={formData.pickupDate}
                                        onChange={(e) => updateField('pickupDate', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-gray-900 bg-gray-50/50"
                                    />
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-500" size={24} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700">Best Time Slot</label>
                                <div className="relative group">
                                    <select
                                        value={formData.pickupTime}
                                        onChange={(e) => updateField('pickupTime', e.target.value)}
                                        className="w-full pl-14 pr-8 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all appearance-none bg-gray-50/50 text-gray-900 cursor-pointer font-medium"
                                    >
                                        <option value="">Select a slot...</option>
                                        <option value="09:00 AM - 11:00 AM">Morning (09:00 - 11:00)</option>
                                        <option value="11:00 AM - 01:00 PM">Late Morning (11:00 - 13:00)</option>
                                        <option value="01:00 PM - 03:00 PM">Afternoon (13:00 - 15:00)</option>
                                        <option value="03:00 PM - 05:00 PM">Evening (15:00 - 17:00)</option>
                                    </select>
                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-500" size={24} />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ArrowRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-400 font-medium">Note: We generally collect items within 48 hours of scheduled time.</p>
                    </div>
                )}
            </div>
        );
    };

    const Step4_Address = () => {
        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Complete Pickup Address</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            placeholder="Unit, Floor, Building, Street, Area"
                            className="w-full pl-14 pr-5 py-5 rounded-2xl border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-gray-900 bg-emerald-50/20 placeholder-emerald-800/30"
                        />
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-eco-600 transition-colors" size={24} />
                        <button className="absolute right-5 top-1/2 -translate-y-1/2 text-eco-600 text-xs font-bold hover:underline">
                            Use current location
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Smartphone size={20} className="text-eco-500" />
                        Contact Verification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-700/60 px-1">Full Name</label>
                            <div className="px-5 py-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-eco-900 font-bold cursor-not-allowed">
                                {formData.contactName}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-emerald-700/60 px-1">Email Profile</label>
                            <div className="px-5 py-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-eco-900 font-bold cursor-not-allowed">
                                {formData.contactEmail}
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-emerald-700 px-1">Primary Phone <span className="text-tech-lime font-bold ml-2">(Verified)</span></label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 px-5 py-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-eco-900 font-bold">
                                    {formData.contactPhone}
                                </div>
                                <button className="px-4 py-4 rounded-xl border border-emerald-200 text-xs font-bold text-eco-600 hover:bg-emerald-50 transition-colors">
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="mt-6 p-4 bg-emerald-50 rounded-xl text-xs text-eco-800 leading-relaxed font-bold">
                        Tip: Our agent will call this number if they can't find your location. Please keep your phone reachable on the pickup day.
                    </p>
                </div>
            </div>
        );
    };

    const Step5_Review = () => {
        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="relative bg-gradient-to-br from-eco-900 to-eco-800 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-10 -mt-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-tech-lime/10 -ml-10 -mb-10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center justify-between">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-tech-lime">
                                    {(formData.deviceType?.toLowerCase().includes('laptop')) && <Laptop size={24} />}
                                    {(formData.deviceType?.toLowerCase().includes('smartphone') || formData.deviceType?.toLowerCase().includes('phone')) && <Smartphone size={24} />}
                                    {(!formData.deviceType?.toLowerCase().includes('laptop') && !formData.deviceType?.toLowerCase().includes('phone') && !formData.deviceType?.toLowerCase().includes('smartphone')) && <Package size={24} />}
                                </div>
                                <h3 className="text-3xl font-display font-bold leading-none">{formData.brand} {formData.model}</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">{formData.condition}</div>
                                <div className="px-4 py-1.5 bg-tech-lime text-eco-950 rounded-full text-xs font-bold uppercase tracking-widest leading-none flex items-center">{formData.quantity} Units</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-tech-lime text-sm font-bold flex items-center gap-2">
                                <Truck size={16} /> Standard {formData.serviceType}
                            </div>
                            {formData.serviceType === 'Pickup' && (
                                <div className="text-right">
                                    <div className="text-3xl font-bold leading-tight">{formData.pickupDate}</div>
                                    <div className="text-white/60 text-sm font-medium">{formData.pickupTime}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 text-white">
                        <div>
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 leading-none">Pickup Origin</h4>
                            <p className="text-sm font-medium leading-relaxed max-w-xs">{formData.address}</p>
                        </div>
                        {formData.notes && (
                            <div>
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 leading-none">Handling Notes</h4>
                                <p className="text-sm font-medium leading-relaxed line-clamp-2 italic text-white/80">"{formData.notes}"</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 border border-eco-100 rounded-[2rem] bg-gray-50/30">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Terms & Disclosure</h4>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 shrink-0 mt-0.5">
                                <Check size={14} />
                            </div>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">I confirm that all data on the devices has been backed up. ELocate is not responsible for data loss during the secure destruction process.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 shrink-0 mt-0.5">
                                <Check size={14} />
                            </div>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">I understand that a small handling fee may be deducted from the eco-score points if the device is found to be incompatible with recycled classification.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---

    return (
        <div className="w-full relative min-h-full">
            {/* Dynamic Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-50/40 rounded-full blur-[80px] -z-10"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start h-full">
                {/* LEFT COLUMN: Progress & Context */}
                <aside className="lg:col-span-3 lg:sticky lg:top-[100px] h-fit pt-2">
                    <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-eco-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <VerticalStepper />
                        <StepInfo />
                    </div>
                </aside>

                {/* RIGHT COLUMN: Interactive Form Content */}
                <main className="lg:col-span-9 space-y-4">
                    {/* Integrated Header */}
                    <div className="px-2 md:px-0">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-eco-600 font-bold mb-3 hover:-translate-x-1 transition-transform group"
                        >
                            <ArrowLeft size={16} className="transition-transform" />
                            <span className="text-xs uppercase tracking-widest font-bold">Dashboard Overview</span>
                        </button>
                        <h1 className="text-4xl lg:text-5xl font-display font-bold text-eco-950 leading-none">New Recycle Request</h1>
                        <p className="text-gray-500 mt-3 text-lg font-medium">Transforming e-waste into sustainable resources.</p>
                    </div>

                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl p-8 md:p-10 lg:p-12 relative overflow-hidden h-full min-h-[700px] flex flex-col transition-all duration-500 hover:shadow-emerald-500/5">
                        {/* Background decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-eco-50 rounded-full -z-10 blur-3xl opacity-50"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sky-50 rounded-full -z-10 blur-3xl opacity-50"></div>

                        {/* Step Dynamic Header */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-eco-50 rounded-full text-[10px] font-bold text-eco-700 uppercase tracking-[0.2em] mb-4">
                                Step {currentStep} <ArrowRight size={10} className="mx-1" /> Phase {currentStep === 5 ? 'Review' : 'Inputs'}
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">
                                {currentStep === 1 && 'What are we recycling?'}
                                {currentStep === 2 && 'Give us the details'}
                                {currentStep === 3 && 'Pick a convenient slot'}
                                {currentStep === 4 && 'Delivery & Logistics'}
                                {currentStep === 5 && 'Verify Information'}
                            </h2>
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                            {currentStep === 1 && <Step1_DeviceType />}
                            {currentStep === 2 && <Step2_DeviceDetails />}
                            {currentStep === 3 && <Step3_ServiceType />}
                            {currentStep === 4 && <Step4_Address />}
                            {currentStep === 5 && <Step5_Review />}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-12 pt-10 border-t border-gray-100">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1 || isSubmitting}
                                className={`
                        px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2
                        ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}
                        `}
                            >
                                <ArrowLeft size={20} /> <span className="text-lg">Go Back</span>
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 1 && !formData.deviceType) ||
                                        (currentStep === 2 && (!formData.brand || !formData.model || !formData.condition)) ||
                                        (currentStep === 3 && !formData.serviceType) ||
                                        (currentStep === 3 && formData.serviceType === 'Pickup' && (!formData.pickupDate || !formData.pickupTime)) ||
                                        (currentStep === 4 && !formData.address)
                                    }
                                    className="px-12 py-5 bg-eco-950 text-white rounded-2xl font-bold hover:bg-black shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <span className="text-lg">Continue</span> <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <>
                                            <span className="text-lg">Submit Request</span>
                                            <Check size={20} strokeWidth={3} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RecycleRequestForm;
