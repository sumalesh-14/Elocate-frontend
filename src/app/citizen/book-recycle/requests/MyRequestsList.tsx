"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Request, RecycleRequestApiResponse, mapApiResponseToRequest } from "./types";
import { downloadReceipt } from "./receiptForm";
import { recycleRequestApi } from "@/lib/admin-api";
import { getUserID } from "@/app/citizen/sign-in/auth";
import { analyzeDeviceMaterials, MaterialAnalysisResponse } from "@/lib/image-analyzer-api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    MdLaptopMac,
    MdSmartphone,
    MdPrint,
    MdTv,
    MdHeadphones,
    MdWatch,
    MdKeyboard,
    MdDevicesOther,
    MdFilterList,
    MdSearch,
    MdCancel,
    MdAddCircle,
    MdDownload,
    MdRefresh,
    MdCheckCircle,
    MdLocalShipping,
    MdLocationOn,
    MdDateRange,
    MdOutlineAccountBalanceWallet,
    MdCheck,
    MdArrowForward,
    MdInfo,
    MdAnalytics,
    MdLayers,
    MdTrendingUp,
    MdHistory,
    MdClose
} from "react-icons/md";

const MyRequestsList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState<MaterialAnalysisResponse | null>(null);

    const fetchRequests = useCallback(async (showToast = false) => {
        const userId = getUserID();
        if (!userId) {
            setError("Could not determine user ID. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            if (!showToast) setLoading(true);
            setError(null);
            const response = await recycleRequestApi.getByUserId(userId);
            const apiData: RecycleRequestApiResponse[] = response.data;
            const mapped = Array.isArray(apiData) ? apiData.map(mapApiResponseToRequest) : [];
            setRequests(mapped);

            // Auto-select first request if none selected
            if (mapped.length > 0 && !selectedRequestId) {
                setSelectedRequestId(mapped[0].id);
            }
            if (showToast) toast.success("Refreshed successfully!");
        } catch (err: any) {
            console.error("Failed to fetch recycle requests:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load your requests. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [selectedRequestId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]); // Run when fetchRequests changes

    const selectedRequest = useMemo(() =>
        requests.find(r => r.id === selectedRequestId),
        [requests, selectedRequestId]);

    // Fetch analysis when request selection changes
    useEffect(() => {
        if (selectedRequest) {
            const runAnalysis = async () => {
                setIsAnalysisLoading(true);
                try {
                    const res = await analyzeDeviceMaterials({
                        brand_id: "mock",
                        brand_name: selectedRequest.deviceBrand,
                        category_id: "mock",
                        category_name: selectedRequest.categoryName,
                        model_id: selectedRequest.id,
                        model_name: selectedRequest.deviceModel,
                        country: "IN",
                        deviceCondition: selectedRequest.deviceCondition,
                        conditionNotes: "Auto-generated analysis for request ID: " + selectedRequest.id
                    });
                    if (res.success) {
                        setAnalysisData(res);
                    } else {
                        toast.error("Analysis failed: " + res.error?.message);
                    }
                } catch (err) {
                    console.error("Analysis failed:", err);
                    toast.error("AI Analysis encountered an error. Please try again later.");
                } finally {
                    setIsAnalysisLoading(false);
                }
            };
            runAnalysis();
        } else {
            setAnalysisData(null);
        }
    }, [selectedRequestId, selectedRequest?.id]);

    const getDeviceIcon = (deviceType: string, className = "text-2xl") => {
        const icons: { [key: string]: React.ReactNode } = {
            laptop: <MdLaptopMac className={className} />,
            smartphone: <MdSmartphone className={className} />,
            printer: <MdPrint className={className} />,
            tv: <MdTv className={className} />,
            headphones: <MdHeadphones className={className} />,
            smartwatch: <MdWatch className={className} />,
            keyboard: <MdKeyboard className={className} />,
            other: <MdDevicesOther className={className} />,
        };
        return icons[deviceType] || icons.other;
    };

    const getStatusBadge = (status: Request["status"]) => {
        const statusConfig = {
            pending: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", label: "Pending" },
            confirmed: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500", label: "Confirmed" },
            "in-progress": { bg: "bg-indigo-100", text: "text-indigo-800", dot: "bg-indigo-500", label: "In Transit" },
            completed: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: "Completed" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Cancelled" },
        };

        const config = statusConfig[status] ?? statusConfig["pending"];
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${config.bg} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };

    const handleCancelRequest = async (requestId: string) => {
        const userId = getUserID();
        if (!userId) return;

        if (confirm(`Are you sure you want to cancel request ${requestId.slice(-8)}?`)) {
            // Instant UI update
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId ? { ...r, status: "cancelled" as const } : r
                )
            );

            const cancelToastId = toast.loading("Cancelling request...");

            try {
                await recycleRequestApi.cancel(requestId, userId);
                toast.update(cancelToastId, {
                    render: "Request cancelled successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
            } catch (err: any) {
                console.error("Cancel failed:", err);
                toast.update(cancelToastId, {
                    render: "Failed to cancel request. Rolling back...",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                fetchRequests(); // Rollback
            }
        }
    };

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.deviceBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "all" || request.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        completed: requests.filter((r) => r.status === "completed").length,
    };

    // ——— Loading skeleton ———
    if (loading) {
        return (
            <div className="w-full h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading your requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6 pb-8 h-full">
            <ToastContainer />

            {/* Header / Stats Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-xl shadow-green-900/5">
                <div className="flex items-center gap-4 px-2">
                    <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-600/30 text-white">
                        <MdLayers className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recycle Hub</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-semibold uppercase tracking-wider">
                            <span>{stats.total} Total</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-amber-600">{stats.pending} Pending</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-emerald-600">{stats.completed} Done</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-green-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-sm w-full md:w-64 font-medium shadow-sm"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-sm font-semibold text-gray-700 cursor-pointer shadow-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button
                        onClick={() => fetchRequests(true)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-green-600 hover:border-green-100 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <MdRefresh className="text-xl" />
                    </button>
                    <Link
                        href="/citizen/book-recycle/new"
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <MdAddCircle className="text-xl" />
                        New
                    </Link>
                </div>
            </div>

            {/* Main Content Area: Split View */}
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">

                {/* Left Sidebar: Request List (30%) */}
                <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-4 overflow-y-auto pr-1 customize-scrollbar">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-[32px] border border-gray-100">
                            <MdLayers className="text-5xl text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">No results found</p>
                        </div>
                    ) : (
                        filteredRequests.map((req) => (
                            <button
                                key={req.id}
                                onClick={() => setSelectedRequestId(req.id)}
                                className={`group flex items-start gap-4 p-4 rounded-[28px] transition-all duration-300 border-2 text-left
                                    ${selectedRequestId === req.id
                                        ? "bg-white border-green-500 shadow-xl shadow-green-900/5 translate-x-1"
                                        : "bg-white/60 border-transparent hover:bg-white hover:border-gray-200 shadow-sm"
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                    ${selectedRequestId === req.id ? "bg-green-600 text-white rotate-3 scale-110" : "bg-gray-100 text-gray-400 rotate-0"}
                                `}>
                                    {getDeviceIcon(req.deviceType, "text-2xl")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">ID: {req.id.slice(-8)}</p>
                                        {getStatusBadge(req.status)}
                                    </div>
                                    <h3 className={`font-black text-sm truncate transition-colors ${selectedRequestId === req.id ? "text-gray-900" : "text-gray-600"}`}>
                                        {req.deviceBrand} {req.deviceModel}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-500 uppercase">{req.categoryName}</span>
                                        <span className="text-[10px] font-bold text-gray-400">{req.requestDate}</span>
                                    </div>
                                </div>
                                <MdArrowForward className={`text-xl mt-4 transition-all ${selectedRequestId === req.id ? "text-green-500 translate-x-1 opacity-100" : "text-gray-200 opacity-0"}`} />
                            </button>
                        ))
                    )}
                </div>

                {/* Right Area: Content & Analysis (70%) */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-y-auto customize-scrollbar pb-4 pr-1">
                    <AnimatePresence mode="wait">
                        {selectedRequest ? (
                            <motion.div
                                key={selectedRequest.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex-1 flex flex-col lg:flex-row gap-6 w-full"
                            >
                                {/* Left Col: Request Details & Timeline (45%) */}
                                <div className="flex-1 flex flex-col gap-6 min-w-0">
                                    {/* Device Info Card */}
                                    <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600">
                                                    {getDeviceIcon(selectedRequest.deviceType, "text-3xl")}
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="text-2xl font-black text-gray-900 truncate">{selectedRequest.deviceBrand} {selectedRequest.deviceModel}</h2>
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1 truncate">{selectedRequest.categoryName}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-black text-gray-300 uppercase">Status</p>
                                                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Condition</p>
                                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    {selectedRequest.deviceCondition}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Estimation</p>
                                                <p className="font-bold text-emerald-600 text-lg">{selectedRequest.estimatedValue || "TBD"}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                                                    <MdLocationOn />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase">Pickup Location</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate">{selectedRequest.address}, {selectedRequest.city}</p>
                                                </div>
                                            </div>
                                            {selectedRequest.status === "pending" && (
                                                <button
                                                    onClick={() => handleCancelRequest(selectedRequest.id)}
                                                    className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest shrink-0"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Section */}
                                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 flex-1">
                                        <div className="flex items-center gap-3 mb-8">
                                            <MdHistory className="text-2xl text-gray-400" />
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Timeline</h3>
                                        </div>

                                        <div className="relative pl-8 border-l-2 border-dashed border-gray-100 space-y-12">
                                            {[
                                                { label: "Request Created", date: selectedRequest.requestDate, desc: "Order successfully placed", active: true },
                                                { label: "Verification", date: "System Scan", desc: "Automated analysis completed", active: true },
                                                { label: "Logistics Scheduled", date: selectedRequest.pickupDate || "Pending", desc: selectedRequest.fulfillmentType === "PICKUP" ? "Agent will collect the device" : "Awaiting drop-off", active: selectedRequest.status !== "pending" },
                                                { label: "Completed", date: "Final Phase", desc: "Credits issued and certificate generated", active: selectedRequest.status === "completed" }
                                            ].map((step, idx) => (
                                                <div key={idx} className="relative">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md transition-all duration-500
                                                            ${step.active ? "bg-green-600 scale-125 ring-8 ring-green-100" : "bg-gray-200 scale-100"}
                                                        `}
                                                    ></motion.div>
                                                    <div className="flex items-baseline justify-between mb-1">
                                                        <h4 className={`font-black text-sm uppercase tracking-wider ${step.active ? "text-gray-900" : "text-gray-300"}`}>{step.label}</h4>
                                                        <span className={`text-[10px] font-bold ${step.active ? "text-green-600" : "text-gray-300"}`}>{step.date}</span>
                                                    </div>
                                                    <p className={`text-xs font-semibold leading-relaxed ${step.active ? "text-gray-500" : "text-gray-200"}`}>{step.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: AI Analysis & Financials (55%) */}
                                <div className="flex-[1.2] flex flex-col gap-6 min-w-0">
                                    {/* Material Analysis Dashboard */}
                                    <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group min-h-[500px] flex flex-col">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full group-hover:bg-green-500/20 transition-all"></div>

                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                    <MdAnalytics className="text-2xl text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight">AI Composition Analysis</h3>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Powered by Llama 3.3</p>
                                                </div>
                                            </div>
                                            {isAnalysisLoading && <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                        </div>

                                        <div className="flex-1 relative z-10 flex flex-col">
                                            {analysisData?.data ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="space-y-8 flex-1"
                                                >
                                                    {/* Precious Metals Grid */}
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {analysisData.data.materials.filter(m => m.isPrecious).map((m, idx) => (
                                                            <div key={idx} className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group/item">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{m.materialName}</p>
                                                                <p className="text-lg font-black text-amber-500">{m.estimatedQuantityGrams}g</p>
                                                                <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-amber-500/50 w-2/3 group-hover/item:w-full transition-all duration-700"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="bg-green-500/10 p-4 rounded-3xl border border-green-500/20 backdrop-blur-md flex flex-col justify-center">
                                                            <p className="text-[10px] font-black text-green-400 uppercase mb-1">Total Value</p>
                                                            <p className="text-xl font-black text-white">₹{analysisData.data.recyclingEstimate.totalMaterialValue.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Financial Breakdown */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                                                                    <MdTrendingUp className="text-2xl" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-400 uppercase">Buyback Estimate</p>
                                                                    <p className="text-2xl font-black text-white">₹{analysisData.data.recyclingEstimate.suggestedBuybackPrice.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="px-4 py-2 bg-green-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-tighter">Recommendation</div>
                                                        </div>

                                                        <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                                                                    <MdOutlineAccountBalanceWallet className="text-2xl" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-400 uppercase">Recycling Price</p>
                                                                    <p className="text-2xl font-black text-white">₹{analysisData.data.recyclingEstimate.suggestedRecyclingPrice.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 italic text-xs leading-relaxed text-gray-400">
                                                        "{analysisData.data.recyclingEstimate.conditionImpact}"
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center">
                                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                                                        <MdAnalytics className="text-4xl text-gray-700" />
                                                        <div className="absolute inset-0 border-2 border-dashed border-gray-700 rounded-full animate-spin-slow"></div>
                                                    </div>
                                                    <p className="text-gray-500 font-bold text-center max-w-[200px]">AI Engine is analyzing device composition...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Marketplace Links Card */}
                                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <MdInfo className="text-lg text-blue-500" />
                                            Retail Reference
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {analysisData?.data?.devicePricing.platformLinks.map((link, idx) => (
                                                <a
                                                    key={idx}
                                                    href={link.link}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                                >
                                                    <img src={link.icon} alt={link.platformName} className="w-6 h-6 object-contain" />
                                                    <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 truncate">{link.platformName}</span>
                                                </a>
                                            ))}
                                        </div>

                                        {selectedRequest.status === "completed" && (
                                            <button
                                                onClick={() => downloadReceipt(selectedRequest)}
                                                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-900/10"
                                            >
                                                <MdDownload className="text-xl" />
                                                Download Receipt
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center bg-white/40 border border-white p-20 rounded-[60px] shadow-xl shadow-gray-200/50"
                            >
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mb-8 shadow-inner shadow-gray-100">
                                    <MdLayers className="text-5xl text-gray-200" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Select a Request</h3>
                                <p className="text-gray-400 font-semibold mt-3 text-center max-w-sm leading-relaxed">Pick a recycling order from the left to view its detailed timeline and AI analysis dashboard.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx global>{`
                .customize-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .customize-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .customize-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .customize-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default MyRequestsList;
