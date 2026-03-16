"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Search, ArrowRight, ArrowLeft, Check, Package,
    Sparkles, Activity, Hammer, Cpu, Bot, Zap,
    RefreshCw, ShieldCheck, Layers, Info, Trash2,
    ChevronDown, ChevronUp, Clock, MapPin, ExternalLink, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { deviceCategoriesApi, deviceModelsApi } from '@/lib/admin-api';
import { categoryBrandApi } from '@/lib/category-brand-api';
import { analyzeDeviceMaterials, MaterialAnalysisResponse, getErrorMessage } from '@/lib/image-analyzer-api';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Dynamic sub-components to keep the main file manageable
const AnalysisResultDisplay = dynamic<{
    result: MaterialAnalysisResponse;
    onReset: () => void;
    deviceDetails: {
        category: string;
        brand: string;
        model: string;
        condition: string;
    };
}>(() => import('./AnalysisResultDisplay'), { ssr: false });

// --- Types ---
type Condition = 'Working' | 'Minor Issues' | 'Broken' | 'Parts Only';
const CONDITION_OPTIONS: { val: Condition, label: string, desc: string, icon: any }[] = [
    { val: 'Working', label: 'Pristine / Working', desc: 'Fully functional, no damage', icon: Sparkles },
    { val: 'Minor Issues', label: 'Fair / Minor Issues', desc: 'Working with cosmetic wear', icon: Activity },
    { val: 'Broken', label: 'Broken / Damaged', desc: 'Partially functional or physical damage', icon: Hammer },
    { val: 'Parts Only', label: 'Scrap / Parts', desc: 'Non-functional, for material recovery', icon: Cpu },
];

export default function AnalyzePage() {
    const { showToast } = useToast();

    // Dropdown Data
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);

    // Selection State
    const [categoryId, setCategoryId] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [brandId, setBrandId] = useState('');
    const [brandName, setBrandName] = useState('');
    const [modelId, setModelId] = useState('');
    const [modelName, setModelName] = useState('');
    const [condition, setCondition] = useState<Condition>('Working');

    // Manual Input Toggle
    const [isManualInput, setIsManualInput] = useState(false);
    const [manualCategory, setManualCategory] = useState('');
    const [manualBrand, setManualBrand] = useState('');
    const [manualModel, setManualModel] = useState('');

    // Loading States
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Result State
    const [analysisResult, setAnalysisResult] = useState<MaterialAnalysisResponse | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const res = await deviceCategoriesApi.getAll({ size: 100 });
                setCategories(res.data.content || []);
            } catch (err) {
                console.error("Failed to fetch categories", err);
                showToast("Error\nFailed to load device categories.", "error");
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Brand Fetch
    useEffect(() => {
        const fetchBrands = async () => {
            if (!categoryId || isManualInput) return;
            setIsLoadingBrands(true);
            try {
                const res = await categoryBrandApi.getBrandsByCategory(categoryId, 0, 100);
                setBrands(res.data.content || []);
            } catch (err) {
                console.error("Failed to fetch brands", err);
            } finally {
                setIsLoadingBrands(false);
            }
        };
        fetchBrands();
        // Reset brand/model when category changes
        setBrandId('');
        setBrandName('');
        setModelId('');
        setModelName('');
        setBrands([]);
        setModels([]);
    }, [categoryId, isManualInput]);

    // Model Fetch
    useEffect(() => {
        const fetchModels = async () => {
            if (!brandId || !categoryId || isManualInput) return;
            setIsLoadingModels(true);
            try {
                const res = await deviceModelsApi.getAll({
                    categoryId,
                    brandId,
                    size: 100
                });
                setModels(res.data.content || []);
            } catch (err) {
                console.error("Failed to fetch models", err);
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
        // Reset model when brand changes
        setModelId('');
        setModelName('');
        setModels([]);
    }, [brandId, categoryId, isManualInput]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);
        
        let finalCategory = isManualInput ? manualCategory : categoryName;
        const finalBrand = isManualInput ? manualBrand : brandName;
        const finalModel = isManualInput ? manualModel : modelName;

        if (!finalCategory || !finalBrand || !finalModel) {
            showToast("Required Fields\nPlease provide Category, Brand, and Model.", "info");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const conditionMap: Record<Condition, string> = {
                'Working': 'EXCELLENT',
                'Minor Issues': 'GOOD',
                'Broken': 'FAIR',
                'Parts Only': 'POOR'
            };

            const payload = {
                category_id: categoryId || 'manual',
                category_name: finalCategory,
                brand_id: brandId || 'manual',
                brand_name: finalBrand,
                model_id: modelId || 'manual',
                model_name: finalModel,
                country: 'IN',
                deviceCondition: conditionMap[condition],
                conditionNotes: `Manual analysis for ${finalModel} in ${condition} condition.`
            };

            const res = await analyzeDeviceMaterials(payload);
            if (res.success) {
                setAnalysisResult(res);
                showToast("Analysis Complete\nMaterial composition and value estimated successfully.", "success");
            } else {
                const msg = res.error?.code ? getErrorMessage(res.error.code) : (res.error?.message || "Could not analyze device.");
                if (res.error?.code === 'NOT_A_DEVICE' || res.error?.code === 'NOT_AN_EWASTE_DEVICE') {
                    setAnalysisError(msg);
                } else {
                    showToast("Analysis Failed\n" + msg, "error");
                }
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            showToast("System Error\nAn error occurred during analysis.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setAnalysisResult(null);
        setAnalysisError(null);
        if (!isManualInput) {
            setCategoryId('');
            setCategoryName('');
            setBrandId('');
            setBrandName('');
            setModelId('');
            setModelName('');
        } else {
            setManualCategory('');
            setManualBrand('');
            setManualModel('');
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-8 lg:px-14">
            <div className="max-w-full mx-auto">
                {!analysisResult ? (
                    <>
                        {/* Header Section */}
                        <div className="text-center mb-12 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mb-4 border border-emerald-100">
                                <Bot size={14} className="animate-pulse" /> Precision Intelligence
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                                AI Device <span className="text-emerald-600">Analysis</span>
                            </h1>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                                Discover the hidden value within your electronics. Our advanced AI estimates the material composition and recoverable worth of your devices.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Selector Section */}
                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-emerald-900/5 p-8 md:p-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-100/50 transition-colors duration-700"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -ml-20 -mb-20"></div>

                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                    <Layers size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Device Identity</h2>
                                                    <p className="text-sm text-slate-400 font-bold tracking-wider">SELECT OR ENTER MANUALLY</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsManualInput(!isManualInput)}
                                                className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isManualInput ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                {isManualInput ? 'Use Dropdowns' : "Can't find device?"}
                                            </button>
                                        </div>

                                        {isManualInput ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-600 uppercase tracking-widest ml-1">Category</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Smartphone"
                                                        value={manualCategory}
                                                        onChange={(e) => setManualCategory(e.target.value)}
                                                        className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-600 uppercase tracking-widest ml-1">Brand</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Apple"
                                                        value={manualBrand}
                                                        onChange={(e) => setManualBrand(e.target.value)}
                                                        className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-600 uppercase tracking-widest ml-1">Model</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. iPhone 15 Pro"
                                                        value={manualModel}
                                                        onChange={(e) => setManualModel(e.target.value)}
                                                        className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                                                <SearchableDropdown
                                                    label="Category"
                                                    placeholder="Select Category"
                                                    options={categories.map(c => ({ id: c.id, name: c.name }))}
                                                    value={categoryId}
                                                    onChange={(id, name) => { setCategoryId(id); setCategoryName(name); }}
                                                    isLoading={isLoadingCategories}
                                                />
                                                <SearchableDropdown
                                                    label="Brand"
                                                    placeholder={!categoryId ? "Select Category first" : "Select Brand"}
                                                    options={brands.map(b => ({ id: b.brand?.id || b.id, name: b.brand?.name || b.name }))}
                                                    value={brandId}
                                                    onChange={(id, name) => { setBrandId(id); setBrandName(name); }}
                                                    isLoading={isLoadingBrands}
                                                    disabled={!categoryId}
                                                />
                                                <SearchableDropdown
                                                    label="Exact Model"
                                                    placeholder={!brandId ? "Select Brand first" : "Select Model"}
                                                    options={models.map(m => ({ id: m.id, name: m.modelName }))}
                                                    value={modelId}
                                                    onChange={(id, name) => { setModelId(id); setModelName(name); }}
                                                    isLoading={isLoadingModels}
                                                    disabled={!brandId}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                    <Activity size={20} />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Device Condition</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {CONDITION_OPTIONS.map((opt) => {
                                                    const Icon = opt.icon;
                                                    const isSelected = condition === opt.val;
                                                    return (
                                                        <button
                                                            key={opt.val}
                                                            onClick={() => setCondition(opt.val)}
                                                            className={`p-5 rounded-[1.5rem] border-2 text-left transition-all hover:-translate-y-1 ${isSelected
                                                                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-200/50'
                                                                : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-emerald-200'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-400 border border-emerald-50'
                                                                }`}>
                                                                <Icon size={20} />
                                                            </div>
                                                            <div className={`font-black uppercase tracking-tight text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                                {opt.label}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-bold mt-1 leading-tight uppercase tracking-widest">
                                                                {opt.desc}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {analysisError && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 mt-4 animate-fade-in">
                                                <AlertTriangle size={16} />
                                                <span className="text-sm font-bold">{analysisError}</span>
                                            </div>
                                        )}

                                        <div className="pt-6">
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={isAnalyzing}
                                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-[1.5rem] font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-200 flex items-center justify-center gap-4 group/btn"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <RefreshCw className="animate-spin" size={24} />
                                                        <span>Analyzing Composition...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={24} className="group-hover/btn:rotate-12 transition-transform" />
                                                        <span>Analyze Device Chemistry</span>
                                                        <ArrowRight size={24} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info/Guide Section - Professional & Visual */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Visual Hero Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl group border border-slate-100"
                                >
                                    <Image
                                        src="/assets/analysis/analysis_hero.png"
                                        alt="E-waste Analysis"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent flex items-end p-8">
                                        <div>
                                            <h4 className="text-white font-black uppercase tracking-widest text-xs">AI Core</h4>
                                            <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-tight">Processing Material Chemistry...</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                                            <Zap size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-tight">Why Analyze?</h3>
                                        <ul className="space-y-4">
                                            {[
                                                { title: 'Material Recovery', text: 'Learn exactly how much gold, silver, and copper is in your device.' },
                                                { title: 'Fair Market Value', text: 'Get an unbiased estimate of recycling vs buyback pricing.' },
                                                { title: 'Eco Impact', text: 'Understand the environmental footprint and circular potential.' }
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-4">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1 border border-emerald-500/20">
                                                        <Check size={12} className="text-emerald-400" strokeWidth={4} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-emerald-300 text-xs uppercase tracking-widest mb-1">{item.title}</p>
                                                        <p className="text-sm text-emerald-100/70 font-medium leading-relaxed">{item.text}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Eco Impact Visual Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group"
                                >
                                    <div className="relative h-32">
                                        <Image
                                            src="/assets/analysis/eco_impact.png"
                                            alt="Eco Impact"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Circular Impact</h4>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Estimated</span>
                                        </div>
                                        <div className="flex items-end gap-3">
                                            <div className="text-3xl font-black text-slate-900 leading-none">8.4kg</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-1 leading-none">CO2 Offset</div>
                                        </div>
                                        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '65%' }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 relative overflow-hidden group"
                                >
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-slate-200/50 rounded-full blur-3xl group-hover:bg-emerald-100/50 transition-colors"></div>
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-4 relative z-10">Market Insight</h4>
                                    <div className="space-y-4 relative z-10">
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                                            "Electronic waste contains precious metals that are up to 50 times richer than ores mined from the earth."
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-px bg-emerald-300"></div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                                United Nations Global E-waste Monitor
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="animate-fade-in">
                        <AnalysisResultDisplay
                            result={analysisResult}
                            onReset={resetAnalysis}
                            deviceDetails={{
                                category: isManualInput ? manualCategory : categoryName,
                                brand: isManualInput ? manualBrand : brandName,
                                model: isManualInput ? manualModel : modelName,
                                condition
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Helper Components ---

const SearchableDropdown: React.FC<{
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
            <label className="text-sm font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-6 py-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${disabled
                    ? 'bg-slate-50/50 border-slate-100 opacity-50 cursor-not-allowed'
                    : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
            >
                <span className={`font-bold truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
                    {selectedOption ? selectedOption.name : (isLoading ? 'Loading...' : placeholder)}
                </span>
                <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] overflow-hidden z-[110] animate-slide-in-top">
                    <div className="p-4 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
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
                                    className={`px-6 py-3.5 text-sm font-bold cursor-pointer transition-colors ${opt.id === value ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-emerald-50/50'
                                        }`}
                                >
                                    {opt.name}
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-slate-400 text-xs font-black uppercase tracking-widest">
                                No matches found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
