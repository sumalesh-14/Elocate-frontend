"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, ShieldCheck, Zap, Info, ArrowLeft,
    Download, Share2, Recycle, ShoppingCart,
    DollarSign, BarChart3, Gem, Package, Bot,
    ExternalLink, CheckCircle2, AlertCircle, Layers, Activity,
    ChevronDown, ChevronUp, Sparkles, ClipboardList
} from 'lucide-react';
import { MaterialAnalysisResponse } from '@/lib/image-analyzer-api';
import { useRouter } from 'next/navigation';

interface Props {
    result: MaterialAnalysisResponse;
    onReset: () => void;
    deviceDetails: {
        category: string;
        brand: string;
        model: string;
        condition: string;
    };
}

export default function AnalysisResultDisplay({ result, onReset, deviceDetails }: Props) {
    const router = useRouter();
    const [isInsightsOpen, setIsInsightsOpen] = useState(true);
    const [isCompositionOpen, setIsCompositionOpen] = useState(false);
    const [isMarketOpen, setIsMarketOpen] = useState(false);

    const data = result.data;
    if (!data) return null;

    const { materials, recyclingEstimate, devicePricing, analysisDescription } = data;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const handleRecycleNow = () => {
        localStorage.setItem('prefilled_analysis', JSON.stringify({
            categoryName: deviceDetails.category,
            brandName: deviceDetails.brand,
            modelName: deviceDetails.model,
            condition: deviceDetails.condition
        }));
        router.push('/citizen/book-recycle/new');
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-10"
        >
            {/* Top Identity Card - Fresh Emerald Version */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-50 to-white rounded-[3rem] p-8 md:p-12 text-slate-800 relative overflow-hidden shadow-2xl shadow-emerald-100/40 border border-emerald-100/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                {/* Top Right Back Button */}
                <button 
                    onClick={onReset}
                    className="absolute top-8 right-8 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/5 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="relative z-10 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-10">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center border-2 border-emerald-200 shadow-xl shadow-emerald-700/5 group transition-all hover:scale-105 hover:border-emerald-400">
                            <Package size={48} className="text-emerald-600" />
                        </div>
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/50 rounded-full border border-emerald-200">
                                <Bot size={14} className="text-emerald-700" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">AI Identification Verified</span>
                            </div>
                            <h2 className="text-5xl font-black uppercase tracking-tight leading-none text-slate-900">{deviceDetails.brand}</h2>
                            <h3 className="text-3xl font-black text-emerald-600 uppercase tracking-tight">{deviceDetails.model}</h3>
                            <div className="flex items-center gap-6 pt-2">
                                <span className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <Layers size={14} /> {deviceDetails.category}
                                </span>
                                <span className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <Activity size={14} /> {deviceDetails.condition}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Unified Valuation Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-emerald-100/50">
                        <div className="bg-white/40 backdrop-blur-sm p-5 rounded-[2rem] border border-emerald-100/50">
                            <div className="text-[10px] font-black text-emerald-700/60 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                <Gem size={12} /> Material Worth
                            </div>
                            <div className="text-3xl font-black text-slate-900">₹{recyclingEstimate.totalMaterialValue?.toLocaleString() ?? '0'}</div>
                            <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 opacity-60">Gross Recovery Value</div>
                        </div>

                        <div className="bg-emerald-600/5 p-5 rounded-[2rem] border border-emerald-200/50">
                            <div className="text-[10px] font-black text-emerald-700/60 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                <Recycle size={12} /> Recycling Price
                            </div>
                            <div className="text-3xl font-black text-emerald-700">₹{recyclingEstimate.suggestedRecyclingPrice?.toLocaleString() ?? '0'}</div>
                            <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 opacity-60">Suggested Pickup Price</div>
                        </div>

                        <div className="bg-emerald-600/10 p-5 rounded-[2rem] border border-emerald-300/30">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                <ShoppingCart size={12} /> Buyback Value
                            </div>
                            <div className="text-3xl font-black text-emerald-900">₹{recyclingEstimate.suggestedBuybackPrice?.toLocaleString() ?? '0'}</div>
                            <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mt-1 opacity-70">Potential Market Resale</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Information & Market */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Condition Analysis - Informational */}
                    <motion.div variants={itemVariants} className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                <Info size={20} />
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em]">Assessment Context</h4>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                            The identification is based on standard component configurations for the {deviceDetails.brand} {deviceDetails.model}.
                        </p>
                    </motion.div>

                    {/* Quick Market Links - Collapsible */}
                    {devicePricing?.platformLinks && devicePricing.platformLinks.length > 0 && (
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <button
                                onClick={() => setIsMarketOpen(!isMarketOpen)}
                                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <BarChart3 size={20} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">Market comparison</h3>
                                </div>
                                <div className={`p-1.5 rounded-full border border-slate-100 transition-transform duration-300 ${isMarketOpen ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={16} className="text-slate-400" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isMarketOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 pt-2 space-y-3">
                                            {devicePricing.platformLinks.map((platform, idx) => (
                                                <a
                                                    key={idx}
                                                    href={platform.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-emerald-300 hover:bg-white hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white p-1.5 rounded-lg flex items-center justify-center border border-slate-100">
                                                            <img src={platform.icon} alt={platform.platformName} className="object-contain w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-600 uppercase tracking-wide">{platform.platformName}</span>
                                                    </div>
                                                    <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>

                {/* Right Side: Material Insights & Breakdown */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Collapsible Card 1: Recovery Insights */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                        <button
                            onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                            className="w-full p-8 md:p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                    <ClipboardList size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recovery Insights</h3>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1 uppercase">Condition & Pricing Impact</p>
                                </div>
                            </div>
                            <div className={`p-2 rounded-full border border-slate-200 transition-transform duration-300 ${isInsightsOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} className="text-slate-400" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {isInsightsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-8 md:px-10 pb-10 space-y-6 border-t border-slate-50 pt-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-emerald-50/80 p-6 rounded-[2rem] border-2 border-emerald-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-white rounded-lg border border-emerald-100 text-emerald-600 shadow-sm">
                                                        <Activity size={18} />
                                                    </div>
                                                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Recycling Impact</h4>
                                                </div>
                                                <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100/50">
                                                    <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                                                        {recyclingEstimate.conditionImpact}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50/80 p-6 rounded-[2rem] border-2 border-blue-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-white rounded-lg border border-blue-100 text-blue-600 shadow-sm">
                                                        <DollarSign size={18} />
                                                    </div>
                                                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest">Financial Logic</h4>
                                                </div>
                                                <div className="bg-white/60 p-4 rounded-2xl border border-blue-100/50">
                                                    <p className="text-sm font-black text-slate-800 leading-relaxed uppercase tracking-tight">
                                                        {recyclingEstimate.priceBreakdown}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                                    <Sparkles size={18} className="text-emerald-400" />
                                                </div>
                                                <p className="text-sm font-black uppercase tracking-tight">AI Recommended Path</p>
                                            </div>
                                            <div className="px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                                                {recyclingEstimate.suggestedBuybackPrice > recyclingEstimate.suggestedRecyclingPrice ? 'Opt for Buyback' : 'Opt for Recycling'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Collapsible Card 2: Material Composition */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <button
                            onClick={() => setIsCompositionOpen(!isCompositionOpen)}
                            className="w-full p-8 md:p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Material Composition</h3>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1 uppercase">Lab-Assisted AI Projection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex px-4 py-2 bg-slate-50 rounded-xl items-center gap-3 border border-slate-100">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified</span>
                                </div>
                                <div className={`p-2 rounded-full border border-slate-200 transition-transform duration-300 ${isCompositionOpen ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isCompositionOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-8 md:px-10 pb-10 space-y-10 border-t border-slate-50 pt-8">
                                        {/* Analysis Text Blobs */}
                                        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-xl border border-emerald-100 text-emerald-600 shrink-0">
                                                <Bot size={18} />
                                            </div>
                                            <p className="text-sm text-emerald-900/70 font-medium leading-relaxed">
                                                {analysisDescription}
                                            </p>
                                        </div>

                                        {/* Material Grid - Enhanced Readability */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {materials.map((m, i) => (
                                                <div
                                                    key={i}
                                                    className={`group p-7 rounded-[2.5rem] border-2 bg-white transition-all duration-500 relative overflow-hidden ${m.isPrecious
                                                        ? 'border-amber-200 hover:border-amber-500 hover:shadow-amber-900/10'
                                                        : 'border-emerald-100 hover:border-emerald-500 hover:shadow-emerald-900/10'
                                                        } hover:shadow-2xl`}
                                                >
                                                    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl transition-colors ${m.isPrecious ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-emerald-50 group-hover:bg-emerald-100'
                                                        }`}></div>
                                                    <div className="relative z-10 space-y-5">
                                                        {/* Header: Name and Precious Badge Together */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <div className={`w-3 h-3 rounded-full ${m.isPrecious ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                                                <span className="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                                                                    {m.materialName}
                                                                </span>
                                                                {m.isPrecious && (
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                                                                        Precious Metal
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-right shrink-0 flex items-baseline gap-2">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</span>
                                                                <span className="text-2xl font-black text-slate-900 tracking-tighter">{m.estimatedQuantityGrams}g</span>
                                                            </div>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="space-y-2">
                                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min((m.estimatedQuantityGrams / (m.isPrecious ? 1 : 500)) * 100, 100)}%` }}
                                                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                                    className={`h-full rounded-full shadow-sm ${m.isPrecious ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}
                                                                ></motion.div>
                                                            </div>
                                                        </div>

                                                        {/* Footer: Found In and Value */}
                                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Found In</div>
                                                                <div className="text-[11px] font-bold text-slate-700 leading-tight uppercase">
                                                                    {m.foundIn}
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-right flex flex-col justify-center">
                                                                <div className="flex items-baseline justify-end gap-2">
                                                                    <span className="text-[9px] font-black text-emerald-700/50 uppercase tracking-widest">Market Value</span>
                                                                    <span className="text-lg font-black text-emerald-600">
                                                                        ₹{(m.estimatedQuantityGrams * m.marketRatePerGram).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Totals Summary */}
                                        <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                                            <div className="z-10 flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                                    <TrendingUp size={32} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black uppercase tracking-tight">Projected Yield</h4>
                                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Total Recovery Estimate</p>
                                                </div>
                                            </div>
                                            <div className="z-10 text-center md:text-right">
                                                <div className="text-5xl font-black text-emerald-400">₹{recyclingEstimate.totalMaterialValue?.toLocaleString() ?? '0'}</div>
                                                <p className="text-[10px] font-black text-emerald-300/50 uppercase tracking-[0.3em] mt-2">Valuation Hash: #EL{Math.floor(Math.random() * 10000)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Disclaimer */}
                    <motion.div variants={itemVariants} className="flex gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-900/60 items-start">
                        <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-500" />
                        <p className="text-[11px] font-medium leading-relaxed italic">
                            Disclaimer: This analysis is an AI-powered projection based on generalized device architecture and market pricing as of {new Date().toLocaleDateString()}. Actual material recovery may vary based on exact model variant, regional e-waste guidelines, and facility-specific extraction efficiency.
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
