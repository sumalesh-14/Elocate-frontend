"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Laptop, Smartphone, Printer, Tv, Headphones, Watch, Keyboard, HardDrive,
    ArrowRight,
    Search,
    ArrowLeft, Upload, Check, MapPin, Calendar, Clock, Truck, Package,
    ShieldCheck, HelpCircle, Info, Sparkles, Activity, Hammer, Cpu,
    Square, CheckSquare, Eraser, ChevronDown, Layers, AlertTriangle,
    ChevronUp, Zap, X, RefreshCw, Bot, Star, Shield, Flame
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { deviceCategoriesApi, deviceModelsApi, recycleRequestApi, userProfileApi } from '@/lib/admin-api';
import { getUserName, getEmail, getPhoneNumber, getUserID } from '../../sign-in/auth';
import { categoryBrandApi } from '@/lib/category-brand-api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { calculateDistance } from '@/lib/utils/calculateLocation';
import { fetchFacilities } from '@/lib/utils/facilityApi';
import getLocation from '@/lib/utils/getLocation';
import { analyzeDeviceImage, checkAnalyzerHealth, AnalysisResult } from '@/lib/image-analyzer-api';
import SuccessModal from '@/app/citizen/Components/SuccessModal';

// --- Types ---
type Step = 1 | 2 | 3 | 4 | 5;
type DeviceType = string;
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
    facilityId: string;
    facilityName: string;
    facilityAddress: string;
    facilityLat: number | null;
    facilityLon: number | null;
    pickupAddressId: string | null;
    city: string;
    state: string;
    pincode: string;
    latitude: number | null;
    longitude: number | null;
    checklist: {
        backup: boolean;
        accounts: boolean;
        factoryReset: boolean;
    };
}

// --- Prop Types for Sub-components ---
interface StepProps {
    formData: FormData;
    updateField: (field: keyof FormData, value: any) => void;
}

interface Step1Props extends StepProps {
    isLoadingCategories: boolean;
    categories: any[];
    onImageAnalyze: (file: File) => Promise<void>;
    isAnalyzing: boolean;
    categoryPage: number;
    categoryTotalPages: number;
    onPageChange: (newPage: number) => void;
    categorySearch: string;
    onSearchChange: (val: string) => void;
    aiResult: AnalysisResult | null;
    onUseAiResult: () => void;
    onDismissAiResult: () => void;
    aiFilledByAnalysis: boolean;
}

interface Step2Props extends StepProps {
    isLoadingBrands: boolean;
    brands: any[];
    isLoadingModels: boolean;
    models: any[];
    aiFilledByAnalysis: boolean;
}

interface Step4Props extends StepProps {
    userProfile: any;
    useProfileAddress: boolean;
    setUseProfileAddress: (val: boolean) => void;
}

// --- Sub-components ---

/**
 * Circular confidence score ring indicator.
 */
const ConfidenceRing: React.FC<{ score: number }> = ({ score }) => {
    const pct = Math.round(score * 100);
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
    const label = pct >= 70 ? 'High' : pct >= 40 ? 'Medium' : 'Low';

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    <circle
                        cx="32" cy="32" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black" style={{ color }}>{pct}%</span>
                </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</span>
        </div>
    );
};

/**
 * AI result card shown after image analysis completes.
 * User chooses to "Use This" or "Try Again".
 */
const AiResultCard: React.FC<{
    result: AnalysisResult;
    onUse: () => void;
    onDismiss: () => void;
}> = ({ result, onUse, onDismiss }) => {
    const d = result.data!;
    const severityColors: Record<string, string> = {
        low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        medium: 'text-amber-600 bg-amber-50 border-amber-100',
        high: 'text-orange-600 bg-orange-50 border-orange-100',
        critical: 'text-red-600 bg-red-50 border-red-100',
    };

    return (
        <div className="animate-fade-in-up">
            <div className="relative bg-gradient-to-br from-slate-900 via-eco-950 to-slate-900 rounded-[2rem] p-6 overflow-hidden border border-eco-800/30 shadow-2xl">
                {/* Background glows */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-eco-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                {/* Header row */}
                <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-eco-500/20 rounded-xl flex items-center justify-center text-eco-400 border border-eco-500/20">
                            <Bot size={20} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-eco-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-eco-300 border border-eco-500/20 mb-1">
                                <Zap size={8} /> AI Identified
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-none">
                                {result.processingTimeMs}ms · {d.database_status === 'success' ? '✓ DB matched' : d.database_status === 'partial_success' ? '⚡ Partial match' : '○ No DB match'}
                            </p>
                        </div>
                    </div>
                    <ConfidenceRing score={d.confidenceScore} />
                </div>

                {/* Device info */}
                <div className="relative z-10 mb-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{d.category} · {d.deviceType}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{d.brand || 'Unknown Brand'}</div>
                    <div className="text-2xl font-display font-black text-white leading-tight">{d.model || 'Unknown Model'}</div>
                </div>

                {/* Badges row */}
                <div className="relative z-10 flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${severityColors[d.severity]}`}>
                        <Shield size={9} /> {d.severity} risk
                    </span>
                    {d.contains_hazardous_materials && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100">
                            <Flame size={9} /> Hazardous
                        </span>
                    )}
                    {d.contains_precious_metals && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100">
                            <Star size={9} /> Precious Metals
                        </span>
                    )}
                    {d.lowConfidence && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/50 border border-slate-700">
                            Low Confidence
                        </span>
                    )}
                </div>

                {/* Model uncertainty reason */}
                {d.model_uncertainty_reason && (
                    <div className="relative z-10 flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-0.5">Why uncertain?</div>
                            <p className="text-[11px] text-amber-200/80 leading-snug font-medium">{d.model_uncertainty_reason}</p>
                        </div>
                    </div>
                )}

                {/* Info note */}
                {d.info_note && (
                    <div className="relative z-10 flex items-start gap-2 p-3 bg-white/5 rounded-xl mb-4 border border-white/5">
                        <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-300/80 leading-snug italic">{d.info_note}</p>
                    </div>
                )}

                {/* DB match indicators */}
                {d.database_status !== 'unavailable' && (
                    <div className="relative z-10 grid grid-cols-3 gap-2 mb-5">
                        {[{ label: 'Category', score: d.category_match_score }, { label: 'Brand', score: d.brand_match_score }, { label: 'Model', score: d.model_match_score }].map(item => (
                            <div key={item.label} className="bg-white/5 rounded-lg p-2 border border-white/5">
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                                {item.score !== null ? (
                                    <>
                                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-eco-500 rounded-full transition-all" style={{ width: `${Math.round(item.score * 100)}%` }}></div>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-1">{Math.round(item.score * 100)}% match</div>
                                    </>
                                ) : (
                                    <div className="text-[9px] font-bold text-slate-600">—</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="relative z-10 flex gap-3">
                    <button
                        onClick={onUse}
                        className="flex-1 py-3.5 bg-eco-500 hover:bg-eco-400 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-lg shadow-eco-500/30 flex items-center justify-center gap-2"
                    >
                        <Check size={16} strokeWidth={3} /> Use This
                    </button>
                    <button
                        onClick={onDismiss}
                        className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-sm uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={14} /> Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

const SearchableSelect: React.FC<{
    label: string,
    options: { id: string, name: string }[],
    value: string,
    onChange: (id: string, name: string) => void,
    isLoading?: boolean,
    disabled?: boolean,
    placeholder: string
}> = ({ label, options, value, onChange, isLoading, disabled, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-base font-bold text-gray-700">{label}</label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 rounded-xl border border-emerald-100 flex items-center justify-between cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-emerald-50/20 hover:border-eco-500'}`}
            >
                <span className={`font-medium truncate ${selectedOption ? 'text-gray-900 font-bold text-lg' : 'text-gray-400 text-base'}`}>
                    {selectedOption ? selectedOption.name : (isLoading ? 'Loading...' : placeholder)}
                </span>
                <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[110] animate-slide-in-top">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <div className="relative pl-4">
                            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Quick search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-base focus:border-eco-500 outline-none text-gray-900 font-medium"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id, opt.name);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`pl-11 pr-5 py-3.5 text-base font-bold cursor-pointer transition-colors ${opt.id === value ? 'bg-eco-50 text-eco-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {opt.name}
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-400 text-xs font-medium italic">
                                No results match "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SelectionPath: React.FC<{ category?: string, brand?: string, model?: string }> = ({ category, brand, model }) => {
    if (!category || !brand || !model) return null;

    return (
        <div className="relative mb-6 group animate-fade-in px-1 max-w-4xl mx-auto mt-4 text-left">
            {/* simple glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-eco-400/10 to-emerald-400/10 rounded-[2rem] blur-lg opacity-0 group-hover:opacity-100 transition duration-700"></div>

            <div className="relative bg-eco-50/70 backdrop-blur-sm border border-eco-100 shadow-xl rounded-[2rem] p-5 flex flex-col md:flex-row items-center gap-6">
                {/* Compact Icon Badge */}
                <div className="relative shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-eco-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                        <Package size={28} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-emerald-500 border border-emerald-50 translate-x-0.5 -translate-y-0.5">
                        <Check size={14} strokeWidth={3} />
                    </div>
                </div>

                {/* Compact Identity Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/60 rounded-full text-[8px] font-bold text-eco-600 uppercase tracking-widest mb-2 border border-eco-100/50">
                        <ShieldCheck size={9} /> SECURED
                    </div>

                    <div className="flex flex-col gap-0.5 mb-2">
                        <h4 className="text-[10px] font-extrabold text-slate-400 tracking-widest leading-none uppercase">{brand}</h4>
                        <h3 className="text-2xl lg:text-3xl font-display font-black text-gray-900 tracking-tight leading-tight uppercase">
                            {model}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg border border-gray-100 shadow-sm">
                            <Layers size={11} className="text-eco-500" />
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{category}</span>
                        </div>
                    </div>
                </div>

                {/* Technical Readout Pane - Sized Down */}
                <div className="hidden lg:flex flex-col justify-center px-6 py-4 bg-white/30 rounded-2xl border border-white/50 space-y-1.5 shrink-0">
                    <div className="flex justify-between gap-6 items-center">
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">ID_HASH</span>
                        <span className="text-[8px] font-mono font-bold text-eco-600">#{model.replace(/\s+/g, '').substring(0, 4).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between gap-6 items-center">
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">STATUS</span>
                        <span className="text-[8px] font-mono font-bold text-emerald-600">LOCKED</span>
                    </div>
                    <div className="w-24 bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-500 h-full w-[100%]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step1_DeviceType: React.FC<Step1Props> = ({
    formData,
    updateField,
    isLoadingCategories,
    categories,
    onImageAnalyze,
    isAnalyzing,
    categoryPage,
    categoryTotalPages,
    onPageChange,
    categorySearch,
    onSearchChange,
    aiResult,
    onUseAiResult,
    onDismissAiResult,
    aiFilledByAnalysis,
}) => {
    // Category accordion open/close
    const [categoryGridOpen, setCategoryGridOpen] = useState(!formData.deviceType && !aiResult);
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

    return (
        <div className="space-y-5 animate-fade-in-up">
            <SelectionPath category={formData.deviceType || undefined} />

            {/* ── Identification Overview ── */}
            {!aiResult && !formData.deviceType && (
                <div className="flex items-start gap-3 px-4 py-3 max-w-lg mx-auto mb-4 animate-fade-in bg-red-50/80 hover:bg-red-50 border border-red-100/80 rounded-2xl text-red-600 shadow-sm transition-colors">
                    <Info size={20} className="shrink-0 mt-0.5 text-red-500" />
                    <p className="text-sm font-semibold leading-relaxed text-red-700/90">
                        You can use our intelligent AI for automatic image analysis, or simply choose to enter your device details manually below.
                    </p>
                </div>
            )}

            {/* ── AI Upload Zone ── */}
            {!aiResult && (
                <div
                    className={`bg-eco-50 border-2 border-dashed border-eco-200 rounded-[2rem] p-6 text-center hover:bg-eco-100 transition-all cursor-pointer group shadow-sm relative ${isAnalyzing ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={() => document.getElementById('device-image-upload')?.click()}
                >
                    <input
                        type="file"
                        id="device-image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onImageAnalyze(file);
                        }}
                    />
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center py-4">
                            <div className="relative mb-4">
                                <div className="w-14 h-14 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Bot size={18} className="text-eco-500" />
                                </div>
                            </div>
                            <h3 className="font-black text-eco-900 text-lg uppercase tracking-wide">AI Analyzing...</h3>
                            <p className="text-sm text-eco-600 mt-1 font-medium">Scanning device features and matching database</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-eco-600 shadow-md group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <h3 className="font-black text-eco-900 text-lg">Snap &amp; Identify with AI</h3>
                            <p className="text-sm text-eco-600 mt-1.5 max-w-xs mx-auto font-medium">Upload a photo and our AI will detect brand, model, and auto-fill the form.</p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-eco-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-eco-700">
                                <Zap size={10} /> Powered by Gemini Vision
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── AI Result Card ── */}
            {aiResult && aiResult.data && (
                <AiResultCard
                    result={aiResult}
                    onUse={onUseAiResult}
                    onDismiss={onDismissAiResult}
                />
            )}

            {/* ── Re-upload trigger when result is shown ── */}
            {aiResult && (
                <button
                    onClick={() => {
                        onDismissAiResult();
                        setTimeout(() => document.getElementById('device-image-upload-2')?.click(), 100);
                    }}
                    className="w-full py-3 border-2 border-dashed border-eco-200 rounded-2xl text-center text-sm font-bold text-eco-600 hover:bg-eco-50 hover:border-eco-400 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={14} /> Retake / Upload Different Image
                    <input type="file" id="device-image-upload-2" className="hidden" accept="image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageAnalyze(f); }}
                    />
                </button>
            )}

            {/* ── Separator ── */}
            <div className="relative flex items-center">
                <div className="flex-1 border-t border-gray-100"></div>
                <span className="px-4 text-gray-400 font-bold tracking-widest uppercase text-xs italic">Or select category manually</span>
                <div className="flex-1 border-t border-gray-100"></div>
            </div>

            {/* ── Selected Category Chip (when already selected) ── */}
            {formData.deviceType && (
                <div className="flex items-center gap-3 px-1">
                    <div className="flex items-center gap-2 px-4 py-2 bg-eco-50 border border-eco-200 rounded-xl">
                        <Check size={14} className="text-eco-600" />
                        <span className="text-sm font-black text-eco-900">{formData.deviceType}</span>
                    </div>
                    <button
                        onClick={() => {
                            updateField('deviceType', null);
                            updateField('categoryId', '');
                            setCategoryGridOpen(true);
                        }}
                        className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                        <X size={12} /> Change
                    </button>
                </div>
            )}

            {/* ── Category Accordion Toggle ── */}
            <button
                onClick={() => setCategoryGridOpen(o => !o)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 font-bold transition-all ${categoryGridOpen
                    ? 'border-eco-300 bg-eco-50 text-eco-900'
                    : 'border-slate-100 bg-slate-50/50 text-gray-600 hover:border-eco-200 hover:bg-eco-50/50'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${categoryGridOpen ? 'bg-eco-500 text-white' : 'bg-white text-gray-400 border border-gray-100'
                        }`}>
                        <Package size={16} />
                    </div>
                    <span className="text-sm uppercase tracking-widest">
                        {categoryGridOpen ? 'Hide Categories' : `Browse Categories`}
                    </span>
                    {!isLoadingCategories && (
                        <span className="text-[10px] font-black text-gray-400">({categories.length} shown)</span>
                    )}
                </div>
                {categoryGridOpen ? <ChevronUp size={18} className="text-eco-600" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {/* ── Category Grid (accordion content) ── */}
            {categoryGridOpen && (
                <div className="space-y-4 animate-fade-in-up">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search categories (e.g. Laptop, Phone...)"
                            value={categorySearch}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-eco-500 transition-all text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-medium"
                        />
                    </div>

                    {/* Pagination (above grid) */}
                    {categoryTotalPages > 1 && !isLoadingCategories && (
                        <div className="flex items-center justify-end gap-2">
                            <button
                                disabled={categoryPage === 0}
                                onClick={() => onPageChange(categoryPage - 1)}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-eco-50 hover:border-eco-200 disabled:opacity-30 transition-colors"
                            >
                                <ArrowLeft size={14} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-500">{categoryPage + 1} / {categoryTotalPages}</span>
                            <button
                                disabled={categoryPage >= categoryTotalPages - 1}
                                onClick={() => onPageChange(categoryPage + 1)}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-eco-50 hover:border-eco-200 disabled:opacity-30 transition-colors"
                            >
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {isLoadingCategories ? (
                            <div className="col-span-2 flex flex-col items-center justify-center py-16 animate-pulse">
                                <div className="w-14 h-14 bg-eco-100 rounded-full mb-3 flex items-center justify-center">
                                    <Package className="text-eco-400" size={28} />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fetching categories...</p>
                            </div>
                        ) : (
                            categories.map((cat) => {
                                const Icon = getIconForCategory(cat.name);
                                const isSelected = formData.deviceType === cat.name;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            updateField('deviceType', cat.name);
                                            updateField('categoryId', cat.id);
                                            updateField('brandId', '');
                                            updateField('brand', '');
                                            updateField('modelId', '');
                                            updateField('model', '');
                                            setCategoryGridOpen(false);
                                        }}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-xl flex items-center gap-4 ${isSelected
                                            ? 'border-eco-500 bg-eco-50/50 shadow-md'
                                            : 'border-slate-50 bg-slate-50/30 hover:bg-emerald-50/80 hover:border-emerald-200'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
                                            }`}>
                                            <Icon size={22} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className={`font-bold text-base truncate ${isSelected ? 'text-eco-950' : 'text-gray-900'}`}>{cat.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5 font-medium truncate">{cat.description || 'Misc Electronics'}</div>
                                        </div>
                                        {isSelected && <Check size={16} className="text-eco-500 shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Step2_DeviceDetails: React.FC<Step2Props> = ({ formData, updateField, isLoadingBrands, brands, isLoadingModels, models, aiFilledByAnalysis }) => {
    const conditions: { val: Condition; label: string; desc: string; icon: React.ReactNode }[] = [
        { val: 'Working', label: 'Pristine / Working', desc: 'Fully functional, no damage', icon: <Sparkles size={20} /> },
        { val: 'Minor Issues', label: 'Fair / Minor Issues', desc: 'Working with cosmetic wear', icon: <Activity size={20} /> },
        { val: 'Broken', label: 'Broken / Damaged', desc: 'Powers on but part functionality', icon: <Hammer size={20} /> },
        { val: 'Parts Only', label: 'Scrap / Parts', desc: 'Does not power on, non-functional', icon: <Cpu size={20} /> },
    ];

    return (
        <div className="space-y-4 animate-fade-in-up">
            <SelectionPath
                category={formData.deviceType || undefined}
                brand={formData.brand || undefined}
                model={formData.model || undefined}
            />

            {/* AI pre-fill notice */}
            {aiFilledByAnalysis && (
                <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-eco-50 to-emerald-50 border border-eco-100 rounded-2xl">
                    <div className="w-8 h-8 bg-eco-500 rounded-lg flex items-center justify-center text-white shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black text-eco-700 uppercase tracking-widest">AI Pre-filled</div>
                        <p className="text-xs font-bold text-eco-800">Brand &amp; model were auto-detected. Verify below or change if needed.</p>
                    </div>
                    <Sparkles size={16} className="text-eco-400 shrink-0" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableSelect
                    label="Device Brand"
                    placeholder="Select Brand"
                    options={brands.map(b => ({
                        id: b.brand?.id || b.id,
                        name: b.brand?.name || b.name
                    }))}
                    value={formData.brandId}
                    isLoading={isLoadingBrands}
                    disabled={isLoadingBrands || !formData.categoryId}
                    onChange={(id, name) => {
                        updateField('brandId', id);
                        updateField('brand', name);
                        updateField('modelId', '');
                        updateField('model', '');
                    }}
                />

                <SearchableSelect
                    label="Exact Model"
                    placeholder={!formData.brandId ? "Select brand first" : "Select Model"}
                    options={models.map(m => ({
                        id: m.id,
                        name: m.modelName
                    }))}
                    value={formData.modelId}
                    isLoading={isLoadingModels}
                    disabled={isLoadingModels || !formData.brandId}
                    onChange={(id, name) => {
                        updateField('modelId', id);
                        updateField('model', name);
                    }}
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Device Condition</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conditions.map((cond) => (
                        <button
                            key={cond.val}
                            onClick={() => updateField('condition', cond.val)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md flex gap-4 ${formData.condition === cond.val ? 'border-eco-500 bg-eco-50/50 shadow-sm' : 'border-slate-50 bg-slate-50/40 hover:bg-emerald-50/80 hover:border-emerald-200 hover:scale-[1.01]'}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${formData.condition === cond.val ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-emerald-400 border border-emerald-50'}`}>
                                {cond.icon}
                            </div>
                            <div className="min-w-0">
                                <div className={`font-bold ${formData.condition === cond.val ? 'text-eco-900' : 'text-gray-900'}`}>{cond.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5 font-medium leading-tight">{cond.desc}</div>
                            </div>
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
                    <button onClick={() => updateField('quantity', Math.max(1, formData.quantity - 1))} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:shadow-md transition-shadow font-bold text-gray-600 text-xl">-</button>
                    <span className="text-3xl font-display font-bold text-eco-950 w-8 text-center leading-none">{formData.quantity}</span>
                    <button onClick={() => updateField('quantity', formData.quantity + 1)} className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:shadow-md transition-shadow font-bold text-gray-600 text-xl">+</button>
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

const Step3_ServiceType: React.FC<StepProps> = ({ formData, updateField }) => {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [mapLoading, setMapLoading] = useState(false);
    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (formData.serviceType === 'Dropoff' && mapContainerRef.current) {
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            if (!mapboxToken) {
                console.warn("Mapbox token is missing!");
                return;
            }
            mapboxgl.accessToken = mapboxToken;
            setMapLoading(true);

            const initMap = async () => {
                try {
                    const loc = await getLocation();
                    let center: [number, number] = (loc && loc.coordinates) ? loc.coordinates : [75.7139, 19.7515];

                    if (formData.facilityLat && formData.facilityLon) {
                        center = [formData.facilityLon, formData.facilityLat];
                    }

                    if (!mapContainerRef.current) return;

                    if (!mapRef.current) {
                        const map = new mapboxgl.Map({
                            container: mapContainerRef.current,
                            style: 'mapbox://styles/mapbox/streets-v11',
                            center: center,
                            zoom: formData.facilityId ? 15 : 12,
                        });
                        mapRef.current = map;
                        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
                    }

                    const map = mapRef.current;

                    // Clear existing markers
                    markers.forEach(m => m.remove());
                    const newMarkers: mapboxgl.Marker[] = [];

                    const result = await fetchFacilities(center[1], center[0], 500, page, 5);
                    const withDistance = result.content.map((f: any) => ({
                        ...f,
                        distance: f.distance || calculateDistance(center[1], center[0], f.lat, f.lon)
                    }));

                    setFacilities(withDistance);
                    setTotalPages(result.totalPages);

                    withDistance.forEach((f: any) => {
                        const marker = new mapboxgl.Marker({
                            color: f.verified ? "#10b981" : "#f97316"
                        })
                            .setLngLat([f.lon, f.lat])
                            .addTo(map);

                        marker.getElement().addEventListener('click', () => {
                            updateField('facilityId', f.id || f.name);
                            updateField('facilityName', f.name);
                            updateField('facilityAddress', f.address);
                            updateField('facilityLat', f.lat);
                            updateField('facilityLon', f.lon);
                            map.flyTo({ center: [f.lon, f.lat], zoom: 15 });
                        });
                        newMarkers.push(marker);
                    });
                    setMarkers(newMarkers);

                } catch (err) {
                    console.error("Map initialization failed:", err);
                } finally {
                    setMapLoading(false);
                }
            };

            initMap();
        }
    }, [formData.serviceType, page]);

    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => updateField('serviceType', 'Pickup')} className={`p-8 rounded-[2rem] border-2 text-left transition-all hover:shadow-xl group relative overflow-hidden ${formData.serviceType === 'Pickup' ? 'border-eco-500 bg-eco-50 shadow-md' : 'border-slate-50 bg-slate-50/30 hover:border-eco-200'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all ${formData.serviceType === 'Pickup' ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}><Truck size={32} /></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">Home Pickup</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Free concierge collection from your doorstep. Zero effort required.</p>
                    {formData.serviceType === 'Pickup' && (
                        <div className="absolute top-6 right-6 w-8 h-8 bg-eco-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-slow"><Check size={18} /></div>
                    )}
                </button>
                <button onClick={() => updateField('serviceType', 'Dropoff')} className={`p-8 rounded-[2rem] border-2 text-left transition-all hover:shadow-xl group relative overflow-hidden ${formData.serviceType === 'Dropoff' ? 'border-eco-500 bg-eco-50 shadow-md' : 'border-slate-50 bg-slate-50/40 hover:bg-emerald-50/80 hover:border-emerald-200 hover:scale-[1.01]'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all ${formData.serviceType === 'Dropoff' ? 'bg-eco-500 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}><Package size={32} /></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">Drop-off</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">Bring it to our nearest center anytime. Best for single small items.</p>
                    {formData.serviceType === 'Dropoff' && (
                        <div className="absolute top-6 right-6 w-8 h-8 bg-eco-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-slow"><Check size={18} /></div>
                    )}
                </button>
            </div>

            {formData.serviceType === 'Pickup' && (
                <div className="pt-8 border-t border-gray-100 animate-slide-up">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar size={20} className="text-eco-500" />Select Date & Time</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700">Preferred Date</label>
                            <div className="relative group">
                                <input type="date" value={formData.pickupDate} onChange={(e) => updateField('pickupDate', e.target.value)} className="w-full pl-14 pr-5 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-gray-900 bg-gray-50/50" />
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-500" size={24} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700">Best Time Slot</label>
                            <div className="relative group">
                                <select value={formData.pickupTime} onChange={(e) => updateField('pickupTime', e.target.value)} className="w-full pl-14 pr-8 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all appearance-none bg-gray-50/50 text-gray-900 cursor-pointer font-medium">
                                    <option value="">Select a slot...</option>
                                    <option value="09:00 AM - 11:00 AM">Morning (09:00 - 11:00)</option>
                                    <option value="11:00 AM - 01:00 PM">Late Morning (11:00 - 13:00)</option>
                                    <option value="01:00 PM - 03:00 PM">Afternoon (13:00 - 15:00)</option>
                                    <option value="03:00 PM - 05:00 PM">Evening (15:00 - 17:00)</option>
                                </select>
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-500" size={24} />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ArrowRight size={16} className="rotate-90" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {formData.serviceType === 'Dropoff' && (
                <div className="pt-8 border-t border-gray-100 animate-slide-up">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={20} className="text-eco-500" />Select Drop-off Facility</h3>
                            <div className="mb-6 h-[400px] rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner relative">
                                {mapLoading && (
                                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-md flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="mt-2 text-sm font-bold text-eco-900">Locating facilities...</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={mapContainerRef} className="w-full h-full" />
                            </div>
                        </div>
                        <div className="md:w-1/3 flex flex-col h-[400px]">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nearby</h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                                    >
                                        <ArrowLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-bold text-gray-500">{page + 1} / {totalPages}</span>
                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                                    >
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {facilities.length === 0 && !mapLoading && (
                                    <div className="text-center py-10">
                                        <p className="text-xs text-gray-400 font-medium">No facilities found in this area.</p>
                                    </div>
                                )}
                                {facilities.map((f: any) => (
                                    <div key={f.id || f.name} onClick={() => {
                                        updateField('facilityId', f.id || f.name);
                                        updateField('facilityName', f.name);
                                        updateField('facilityAddress', f.address);
                                        updateField('facilityLat', f.lat);
                                        updateField('facilityLon', f.lon);
                                        if (mapRef.current) mapRef.current.flyTo({ center: [f.lon, f.lat], zoom: 15 });
                                    }} className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${formData.facilityId === (f.id || f.name) ? 'border-eco-500 bg-eco-50 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-eco-200'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-bold text-eco-950 text-sm leading-tight">{f.name}</h5>
                                            {f.verified && <Check className="text-eco-500" size={14} />}
                                        </div>
                                        <p className="text-[11px] text-gray-400 line-clamp-1 mb-2 font-medium">{f.address}</p>
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-eco-700">{f.distance ? `${f.distance.toFixed(1)} km` : 'Near you'}</span>
                                            <span className={`${f.verified ? 'text-emerald-600' : 'text-orange-500'}`}>{f.verified ? 'Verified' : 'Unverified'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {formData.facilityId && (
                        <div className="mt-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 animate-slide-up flex items-center justify-between">
                            <div className="flex-1 mr-4">
                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1 leading-none">Selected Destination</div>
                                <h4 className="text-xl font-bold text-eco-950 truncate">{formData.facilityName}</h4>
                                <p className="text-sm text-eco-800/80 font-medium truncate">{formData.facilityAddress}</p>
                            </div>
                            <div className="hidden md:flex bg-white p-3 rounded-2xl shadow-sm items-center gap-3 shrink-0">
                                <div className="w-10 h-10 bg-eco-500 rounded-xl flex items-center justify-center text-white"><Check size={20} /></div>
                                <div className="text-xs font-bold text-eco-900">Confirmed</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Step4_Address: React.FC<Step4Props> = ({ formData, updateField, userProfile, useProfileAddress, setUseProfileAddress }) => {

    // Update form when profile address is toggled
    useEffect(() => {
        if (useProfileAddress && userProfile?.address) {
            const addr = userProfile.address;
            updateField('pickupAddressId', addr.id);
            updateField('address', addr.address);
            updateField('city', addr.city);
            updateField('state', addr.state);
            updateField('pincode', addr.pincode);
            updateField('latitude', addr.latitude);
            updateField('longitude', addr.longitude);
        } else if (!useProfileAddress) {
            updateField('pickupAddressId', null);
        }
    }, [useProfileAddress, userProfile]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Profile Address Toggle */}
            {userProfile?.address && (
                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                    <button
                        onClick={() => setUseProfileAddress(!useProfileAddress)}
                        className="flex items-center gap-4 w-full text-left group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${useProfileAddress ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-400 border border-emerald-100'}`}>
                            {useProfileAddress ? <CheckSquare size={24} /> : <Square size={24} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-800">Use Registered Address</h4>
                            <p className="text-sm text-slate-500 font-medium">Auto-fill from your account profile</p>
                        </div>
                        {useProfileAddress && (
                            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                Selected
                            </div>
                        )}
                    </button>

                    {useProfileAddress && (
                        <div className="mt-6 pt-6 border-t border-emerald-100/50 animate-slide-down">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-emerald-50">
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Registered Default</div>
                                    <p className="text-base font-bold text-slate-700">{userProfile.address.address}</p>
                                    <p className="text-sm text-slate-400 font-medium">{userProfile.address.city}, {userProfile.address.state} - {userProfile.address.pincode}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={`space-y-4 transition-all duration-500 ${useProfileAddress && userProfile?.address ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
                <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Manual Pickup Entrance</label>
                    <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">Override</div>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Unit, Floor, Building, Street, Area"
                        className="w-full pl-16 pr-5 py-5 rounded-2xl border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-gray-900 bg-emerald-50/20 placeholder-emerald-800/30 font-medium"
                    />
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-eco-600 transition-colors" size={24} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest px-1">City</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            placeholder="e.g. Chennai"
                            className="w-full px-6 py-4 rounded-xl border border-emerald-100 focus:border-eco-500 bg-emerald-50/10 text-sm font-bold outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest px-1">Pincode</label>
                        <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => updateField('pincode', e.target.value)}
                            placeholder="600001"
                            className="w-full px-6 py-4 rounded-xl border border-emerald-100 focus:border-eco-500 bg-emerald-50/10 text-sm font-bold outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-emerald-100">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-100">
                        <Smartphone size={18} />
                    </div>
                    Contact Audit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-700/60 px-1">Full Name</label>
                        <div className="px-5 py-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-eco-900 font-bold cursor-not-allowed">{formData.contactName}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-700/60 px-1">Email Profile</label>
                        <div className="px-5 py-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-eco-900 font-bold cursor-not-allowed">{formData.contactEmail}</div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-emerald-700 px-1">Primary Phone <span className="text-tech-lime font-bold ml-2">(Verified)</span></label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 px-5 py-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-eco-900 font-bold">{formData.contactPhone}</div>
                            <button className="px-4 py-4 rounded-xl border border-emerald-200 text-xs font-bold text-eco-600 hover:bg-emerald-50 transition-colors">Change</button>
                        </div>
                    </div>
                </div>
                <p className="mt-6 p-4 bg-emerald-50 rounded-xl text-xs text-eco-800 leading-relaxed font-bold">Tip: Our agent will call this number if they can't find your location. Please keep your phone reachable on the pickup day.</p>
            </div>
        </div>
    );
};
const Step5_Review: React.FC<StepProps> = ({ formData, updateField }) => {
    const checklist = formData.checklist || { backup: false, accounts: false, factoryReset: false };

    return (
        <div className="space-y-4 animate-fade-in-up">
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
                        <div className="text-tech-lime text-sm font-bold flex items-center gap-2"><Truck size={16} /> Standard {formData.serviceType}</div>
                        {formData.serviceType === 'Pickup' ? (
                            <div className="text-right">
                                <div className="text-3xl font-bold leading-tight">{formData.pickupDate}</div>
                                <div className="text-white/60 text-sm font-medium">{formData.pickupTime}</div>
                            </div>
                        ) : (
                            <div className="text-right">
                                <div className="text-3xl font-bold leading-tight line-clamp-1">{formData.facilityName || 'Select Facility'}</div>
                                <div className="text-white/60 text-sm font-medium uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg inline-block mt-2">Ready for Drop-off</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 text-white">
                    <div>
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 leading-none">{formData.serviceType === 'Pickup' ? 'Pickup Origin' : 'Drop-off Destination'}</h4>
                        <p className="text-sm font-medium leading-relaxed max-w-xs">{formData.serviceType === 'Pickup' ? formData.address : formData.facilityAddress}</p>
                    </div>
                    {formData.notes ? (
                        <div>
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 leading-none">Handling Notes</h4>
                            <p className="text-sm font-medium leading-relaxed line-clamp-2 italic text-white/80">"{formData.notes}"</p>
                        </div>
                    ) : formData.serviceType === 'Dropoff' && (
                        <div>
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 leading-none">Facility ID</h4>
                            <p className="text-sm font-medium leading-relaxed text-white/80">{formData.facilityId}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-8 border border-emerald-100 rounded-[2rem] bg-emerald-50/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-tech-lime/20 flex items-center justify-center text-eco-700">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">Before You Recycle</h4>
                        <p className="text-xs text-gray-500 font-medium">Please confirm these safety & data steps</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { id: 'backup', label: 'I have backed up all personal data and files.', icon: <Package size={14} /> },
                        { id: 'accounts', label: 'I have logged out of iCloud, Google, and other accounts.', icon: <Check size={14} /> },
                        { id: 'factoryReset', label: 'I have performed a factory reset or cleared sensitive data.', icon: <Eraser size={14} /> }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                const currentChecklist = { ...checklist };
                                currentChecklist[item.id as keyof typeof checklist] = !currentChecklist[item.id as keyof typeof checklist];
                                updateField('checklist', currentChecklist);
                            }}
                            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${checklist[item.id as keyof typeof checklist]
                                ? 'bg-eco-50/50 border-eco-200'
                                : 'bg-white border-transparent hover:border-emerald-100'
                                }`}
                        >
                            <div className={`mt-0.5 shrink-0 transition-colors ${checklist[item.id as keyof typeof checklist] ? 'text-eco-600' : 'text-gray-300'}`}>
                                {checklist[item.id as keyof typeof checklist] ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <p className={`text-sm font-bold text-left leading-tight ${checklist[item.id as keyof typeof checklist] ? 'text-eco-900' : 'text-gray-500'}`}>
                                {item.label}
                            </p>
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 items-start">
                    <div className="mt-1 text-amber-600 shrink-0"><Info size={16} /></div>
                    <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                        Disclaimer: ELocate is not responsible for any personal data remaining on devices. Our secure destruction process is final and irreversible.
                    </p>
                </div>
            </div>
        </div>
    );
};

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
        facilityId: '',
        facilityName: '',
        facilityAddress: '',
        facilityLat: null,
        facilityLon: null,
        pickupAddressId: null,
        city: '',
        state: '',
        pincode: '',
        latitude: null,
        longitude: null,
        checklist: {
            backup: false,
            accounts: false,
            factoryReset: false,
        },
    };

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedRequestId, setSubmittedRequestId] = useState<string>("");
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryPage, setCategoryPage] = useState(0);
    const [categoryTotalPages, setCategoryTotalPages] = useState(1);
    const [categorySearch, setCategorySearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [brands, setBrands] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [useProfileAddress, setUseProfileAddress] = useState(true);
    // AI analysis state
    const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
    const [aiFilledByAnalysis, setAiFilledByAnalysis] = useState(false);

    const STORAGE_KEY = 'elocate_recycle_form_session';

    // Load persisted state on mount
    useEffect(() => {
        const savedSession = localStorage.getItem(STORAGE_KEY);
        if (savedSession) {
            try {
                const { step, data } = JSON.parse(savedSession);
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        // Always refresh auth-linked fields from current session
                        contactName: getUserName() || data.contactName || 'User',
                        contactEmail: getEmail() || data.contactEmail || '',
                        contactPhone: getPhoneNumber() || data.contactPhone || '',
                    }));
                }
                if (step && step >= 1 && step <= 5) {
                    setCurrentStep(step as Step);
                }
            } catch (error) {
                console.error("Failed to restore form session:", error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    // Persist state on change
    useEffect(() => {
        const sessionToSave = {
            step: currentStep,
            data: formData
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));
    }, [currentStep, formData]);

    // Load profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userProfileApi.get();
                if (response.data && response.data.status === 'success') {
                    setUserProfile(response.data);

                    // If we are on step 4 or loading initial data, and useProfileAddress is true
                    // we can auto-fill. Let's do it in Step 4 components though.
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };
        fetchProfile();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(categorySearch);
            setCategoryPage(0); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [categorySearch]);


    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await deviceCategoriesApi.getAll({
                    page: categoryPage,
                    size: 8,
                    search: debouncedSearch
                });
                const categoriesData = response.data.content || response.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                setCategoryTotalPages(response.data.totalPages || 1);
            } catch (error) {
                console.error("Error fetching categories:", error);
                showToast('Failed to load device categories.', 'error');
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [categoryPage, debouncedSearch]);

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

    const isNextDisabled = (
        (currentStep === 1 && !formData.deviceType) ||
        (currentStep === 2 && (!formData.brandId || !formData.modelId || !formData.condition)) ||
        (currentStep === 3 && !formData.serviceType) ||
        (currentStep === 3 && formData.serviceType === 'Pickup' && (!formData.pickupDate || !formData.pickupTime)) ||
        (currentStep === 3 && formData.serviceType === 'Dropoff' && !formData.facilityId) ||
        (currentStep === 4 && !formData.address)
    );

    const isSubmitDisabled = isSubmitting || !formData.checklist?.backup || !formData.checklist?.accounts || !formData.checklist?.factoryReset;

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
    };

    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageAnalyze = async (file: File) => {
        setIsAnalyzing(true);
        // Clear any previous AI result
        setAiResult(null);
        try {
            const result = await analyzeDeviceImage(file);
            if (result.success && result.data) {
                // Don't auto-apply — show the result card for user confirmation
                setAiResult(result);
                showToast('AI analysis complete. Review the result below.', 'success');
            } else {
                showToast(result.error?.message || 'Failed to analyze image. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            showToast('An error occurred during image analysis.', 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    /**
     * Called when user confirms "Use This" on the AI Result Card.
     * Applies all DB IDs and names from the analysis response to form state.
     */
    const handleUseAiResult = () => {
        if (!aiResult?.data) return;
        const d = aiResult.data;

        // Try to match category from our loaded list first
        const matchedCategory = categories.find(c =>
            c.name.toLowerCase() === (d.category || '').toLowerCase() ||
            (d.category || '').toLowerCase().includes(c.name.toLowerCase())
        );

        // Use DB category ID if available, else fall back to name match
        const categoryId = d.category_id || matchedCategory?.id || '';
        const categoryName = matchedCategory?.name || d.category || '';

        updateField('deviceType', categoryName);
        updateField('categoryId', categoryId);

        if (d.brand_id) updateField('brandId', d.brand_id);
        if (d.brand) updateField('brand', d.brand);

        if (d.model_id) updateField('modelId', d.model_id);
        if (d.model) updateField('model', d.model);

        if (d.info_note) {
            updateField('notes', `AI: ${d.info_note}\n\n${formData.notes}`.trim());
        }

        setAiFilledByAnalysis(true);
        setAiResult(null);
        showToast(`Applied: ${d.brand || ''} ${d.model || d.category}`, 'success');
    };

    /**
     * Called when user clicks "Try Again" on the AI Result Card.
     */
    const handleDismissAiResult = () => {
        setAiResult(null);
    };

    const handleSubmit = async () => {
        const userId = getUserID();
        if (!userId) {
            showToast('You must be signed in to submit a request.', 'error');
            router.push('/sign-in');
            return;
        }

        setIsSubmitting(true);
        try {
            // Map form condition to backend conditionCode
            const conditionMap: Record<string, string> = {
                'Working': 'EXCELLENT',
                'Minor Issues': 'GOOD',
                'Broken': 'FAIR',
                'Parts Only': 'POOR'
            };

            const payload = {
                deviceModelId: formData.modelId,
                conditionCode: formData.condition ? conditionMap[formData.condition] : 'GOOD',
                fulfillmentType: formData.serviceType === 'Pickup' ? 'PICKUP' : 'DROP_OFF',
                facilityId: formData.serviceType === 'Dropoff' ? formData.facilityId : null,
                pickupAddressId: formData.pickupAddressId,
                notes: formData.notes || `Quantity: ${formData.quantity}`,
                // Adhoc address fields
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: formData.latitude,
                longitude: formData.longitude
            };

            const response = await recycleRequestApi.create(userId, payload);

            if (response.status === 201 || response.status === 200) {
                // Clear persisted state on successful submission
                localStorage.removeItem(STORAGE_KEY);

                // Get request ID from response if available
                const newRequestId = response.data?.id || response.data?.referenceId || "";
                setSubmittedRequestId(newRequestId);

                setShowSuccessModal(true);
            } else {
                showToast('Failed to submit request. Please try again.', 'error');
            }
        } catch (error: any) {
            console.error('Submission failed:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during submission.';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
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

    // --- Main Render ---

    return (
        <div className="w-full relative min-h-full">
            {/* Dynamic Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-50/40 rounded-full blur-[80px] -z-10"></div>



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start h-full max-w-[1400px] mx-auto px-4 md:px-8 pt-0">
                {/* LEFT COLUMN: Progress & Context */}
                <aside className="lg:col-span-3 lg:sticky lg:top-2 h-fit pt-0 space-y-6">
                    <div className="px-2 md:px-0">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-eco-600 font-bold mb-3 hover:-translate-x-1 transition-transform group"
                        >
                            <ArrowLeft size={16} className="transition-transform" />
                            <span className="text-xs uppercase tracking-widest font-bold">Dashboard Overview</span>
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-eco-950 leading-tight">New Recycle Request</h1>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Transforming e-waste into sustainable resources.</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-eco-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-eco-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <VerticalStepper />
                        <StepInfo />
                    </div>
                </aside>

                {/* RIGHT COLUMN: Interactive Form Content */}
                <main className="lg:col-span-9 space-y-4">
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl p-8 md:p-10 lg:p-12 relative overflow-hidden h-fit flex flex-col transition-all duration-500 hover:shadow-emerald-500/5">
                        {/* Background decoration */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-eco-50 rounded-full -z-10 blur-3xl opacity-50"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sky-50 rounded-full -z-10 blur-3xl opacity-50"></div>

                        {/* Step Dynamic Header */}
                        <div className="mb-6 flex justify-between items-start">
                            <div>
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

                            {/* Top Navigation Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 1 || isSubmitting}
                                    className={`
                                        px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-eco-600 hover:bg-eco-50 transition-all flex items-center gap-2 border border-transparent hover:border-eco-100
                                        ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}
                                    `}
                                >
                                    <ArrowLeft size={18} />
                                    <span className="text-sm uppercase tracking-widest leading-none">Back</span>
                                </button>

                                {currentStep < 5 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={isNextDisabled}
                                        className="px-8 py-3.5 bg-eco-950 text-white rounded-2xl font-bold hover:bg-black shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        <span className="text-sm uppercase tracking-widest leading-none">Continue</span>
                                        <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitDisabled}
                                        className="px-8 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                                    >
                                        <span className="text-sm uppercase tracking-widest leading-none">{isSubmitting ? '...' : 'Submit'}</span>
                                        <Check size={18} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            {currentStep === 1 && (
                                <Step1_DeviceType
                                    formData={formData}
                                    updateField={updateField}
                                    isLoadingCategories={isLoadingCategories}
                                    categories={categories}
                                    onImageAnalyze={handleImageAnalyze}
                                    isAnalyzing={isAnalyzing}
                                    categoryPage={categoryPage}
                                    categoryTotalPages={categoryTotalPages}
                                    onPageChange={(page) => setCategoryPage(page)}
                                    categorySearch={categorySearch}
                                    onSearchChange={(val) => setCategorySearch(val)}
                                    aiResult={aiResult}
                                    onUseAiResult={handleUseAiResult}
                                    onDismissAiResult={handleDismissAiResult}
                                    aiFilledByAnalysis={aiFilledByAnalysis}
                                />
                            )}
                            {currentStep === 2 && <Step2_DeviceDetails formData={formData} updateField={updateField} isLoadingBrands={isLoadingBrands} brands={brands} isLoadingModels={isLoadingModels} models={models} aiFilledByAnalysis={aiFilledByAnalysis} />}
                            {currentStep === 3 && <Step3_ServiceType formData={formData} updateField={updateField} />}
                            {currentStep === 4 && (
                                <Step4_Address
                                    formData={formData}
                                    updateField={updateField}
                                    userProfile={userProfile}
                                    useProfileAddress={useProfileAddress}
                                    setUseProfileAddress={setUseProfileAddress}
                                />
                            )}
                            {currentStep === 5 && <Step5_Review formData={formData} updateField={updateField} />}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
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
                                    disabled={isNextDisabled}
                                    className="px-12 py-5 bg-eco-950 text-white rounded-2xl font-bold hover:bg-black shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <span className="text-lg">Continue</span> <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitDisabled}
                                    className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
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

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.push('/citizen/book-recycle/requests');
                }}
                title="Request Submitted!"
                message="Your recycle request has been successfully created. We've optimized the pickup/drop-off logistics for you. Your eco-score will be updated once processed."
                formData={formData}
                requestId={submittedRequestId}
            />
        </div >
    );
};

export default RecycleRequestForm;
