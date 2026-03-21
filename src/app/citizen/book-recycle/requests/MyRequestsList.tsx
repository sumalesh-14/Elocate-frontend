"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Request, RecycleRequestApiResponse, mapApiResponseToRequest } from "./types";
import { downloadReceipt } from "./receiptForm";
import { recycleRequestApi } from "@/lib/admin-api";
import { getUserID } from "@/app/citizen/sign-in/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackView } from "./FeedbackView";
import {
    MdLaptopMac, MdSmartphone, MdPrint, MdTv, MdHeadphones, MdWatch,
    MdKeyboard, MdDevicesOther, MdSearch, MdAddCircle, MdDownload,
    MdRefresh, MdLocationOn, MdArrowForward, MdInfo, MdLayers,
    MdHistory, MdExpandMore, MdNotifications, MdChevronRight, MdCheckCircle,
    MdMoreVert, MdCalendarToday, MdLocalShipping, MdEmojiEvents, MdRateReview,
    MdVisibility, MdOutlineAdminPanelSettings
} from "react-icons/md";

// --- Sub-Components ---

/**
 * Premium collapsible section with smooth height animation and consistent icon/title.
 */
const CollapsibleCard = ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children,
    colorClass = "blue",
    badge = null
}: {
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    colorClass?: "blue" | "green" | "emerald" | "orange" | "indigo" | "rose";
    badge?: React.ReactNode;
}) => {
    const config_ = {
        blue: { bg: "bg-blue-50/50", iconBg: "bg-blue-100", iconText: "text-blue-600", border: "border-blue-100" },
        green: { bg: "bg-green-50/50", iconBg: "bg-green-100", iconText: "text-green-600", border: "border-green-100" },
        emerald: { bg: "bg-emerald-50/50", iconBg: "bg-emerald-100", iconText: "text-emerald-600", border: "border-emerald-100" },
        orange: { bg: "bg-orange-50/50", iconBg: "bg-orange-100", iconText: "text-orange-600", border: "border-orange-100" },
        indigo: { bg: "bg-indigo-50/50", iconBg: "bg-indigo-100", iconText: "text-indigo-600", border: "border-indigo-100" },
        rose: { bg: "bg-rose-50/50", iconBg: "bg-rose-100", iconText: "text-rose-600", border: "border-rose-100" },
    };

    const c = config_[colorClass as keyof typeof config_];

    return (
        <div className={`bg-white rounded-[32px] border-2 ${c.border} shadow-lg shadow-black/5 overflow-hidden transition-all duration-300 ${isOpen ? 'ring-4 ring-black/2' : ''}`}>
            <div
                className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${c.iconBg} ${c.iconText} rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 ${isOpen ? 'rotate-3 scale-110' : ''}`}>
                        <Icon className="text-2xl" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">{title}</h4>
                        {badge}
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-gray-900 text-white rotate-180' : 'bg-gray-100 text-gray-400 rotate-0'}`}>
                    <MdExpandMore className="text-xl" />
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className={`p-6 md:p-8 ${c.bg} border-t-2 ${c.border}`}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MyRequestsList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    // Collapsible sections state
    const [expandedSection, setExpandedSection] = useState<string | null>("timeline");
    const [expandedSubTimelines, setExpandedSubTimelines] = useState<string[]>(["recycle", "fulfillment"]);
    
    // Feedback state
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackRefreshKey, setFeedbackRefreshKey] = useState(0);

    const toggleSubTimeline = (id: string) => {
        setExpandedSubTimelines(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Status history state
    const [statusHistory, setStatusHistory] = useState<any[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    // Detail view state
    const [detailLoading, setDetailLoading] = useState(false);

    // Reminder state
    const [sendingReminder, setSendingReminder] = useState(false);

    const toggleSection = (section: string) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

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

            if (showToast) toast.success("Refreshed successfully!");
        } catch (err: any) {
            console.error("Failed to fetch recycle requests:", err);
            setError(err?.response?.data?.message || err?.message || "Failed to load your requests.");
        } finally {
            setLoading(false);
        }
    }, [selectedRequestId]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const selectedRequest = useMemo(() =>
        requests.find(r => r.id === selectedRequestId),
        [requests, selectedRequestId]);

    const loadRequestDetails = useCallback(async (requestId: string) => {
        setDetailLoading(true);
        try {
            const [requestRes, historyRes] = await Promise.all([
                recycleRequestApi.getById(requestId),
                recycleRequestApi.getStatusHistory(requestId)
            ]);

            if (requestRes.data) {
                const updatedRequest = mapApiResponseToRequest(requestRes.data);
                setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
            }

            if (historyRes.data) {
                setStatusHistory(historyRes.data);
            } else {
                setStatusHistory([]);
            }
        } catch (err: any) {
            console.error('Error loading request details:', err);
            toast.error("Failed to load request details.");
        } finally {
            setDetailLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedRequestId) {
            loadRequestDetails(selectedRequestId);
        }
    }, [selectedRequestId, loadRequestDetails]);

    const handleSendReminder = async () => {
        if (!selectedRequestId) return;
        const userId = getUserID();
        if (!userId) return;

        setSendingReminder(true);
        const reminderToast = toast.loading("Sending reminder...");

        try {
            await recycleRequestApi.sendReminder(selectedRequestId, userId, 'Reminder: Please process this recycle request');
            toast.update(reminderToast, {
                render: "Reminder sent successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
            loadRequestDetails(selectedRequestId);
        } catch (err: any) {
            toast.update(reminderToast, {
                render: "Failed to send reminder.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setSendingReminder(false);
        }
    };

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

    const getStatusBadge = (status: Request["status"], showPulsing = false) => {
        const statusConfig = {
            pending: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", label: "Pending" },
            confirmed: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500", label: "Confirmed" },
            "in-progress": { bg: "bg-indigo-100", text: "text-indigo-800", dot: "bg-indigo-500", label: "In Transit" },
            completed: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: "Completed" },
            cancelled: { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500", label: "Cancelled" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig["pending"];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${config.bg} ${config.text} shadow-sm`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${showPulsing ? 'animate-pulse' : ''}`}></span>
                {config.label}
            </span>
        );
    };

    const handleCancelRequest = async (requestId: string) => {
        const userId = getUserID();
        if (!userId) return;
        if (confirm(`Are you sure you want to cancel this request?`)) {
            const cancelToastId = toast.loading("Cancelling request...");
            try {
                await recycleRequestApi.cancel(requestId, userId);
                toast.update(cancelToastId, { render: "Request cancelled successfully", type: "success", isLoading: false, autoClose: 3000 });
                loadRequestDetails(requestId);
            } catch (err: any) {
                toast.update(cancelToastId, { render: "Failed to cancel request.", type: "error", isLoading: false, autoClose: 3000 });
            }
        }
    };

    const filteredRequests = requests.filter((request) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            request.requestNumber.toLowerCase().includes(q) ||
            request.deviceBrand.toLowerCase().includes(q) ||
            request.deviceModel.toLowerCase().includes(q) ||
            request.categoryName.toLowerCase().includes(q);
        const matchesFilter = filterStatus === "all" || request.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) {
        return (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <MdLayers className="text-2xl text-emerald-600 animate-pulse" />
                    </div>
                </div>
                <div className="text-center group">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Accessing Recycle Hub...</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Initializing secure blockchain records</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden relative">
            <ToastContainer position="bottom-right" theme="dark" />
            <style jsx global>{`
                .customize-scrollbar::-webkit-scrollbar { width: 7px; }
                .customize-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .customize-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .customize-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>

            {/* --- Premium Header --- */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/80 backdrop-blur-xl pl-0 pr-12 py-8 border-b border-gray-100 shadow-sm shrink-0 z-20"
            >
                <div className="flex items-center gap-8 pl-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-400 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-emerald-600 p-5 rounded-[28px] shadow-xl text-white transition-transform group-hover:rotate-3">
                            <MdLayers className="text-4xl" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">My Requests</h1>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Lifecycle Intelligence Portal</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="relative group flex-1 min-w-[350px] md:flex-none">
                        <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-3xl group-focus-within:text-emerald-500 transition-all duration-300" />
                        <input
                            type="text"
                            placeholder="Find records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-16 pr-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-emerald-500/20 focus:ring-8 focus:ring-emerald-500/5 transition-all text-base w-full md:w-[450px] font-bold shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group/filter">
                            <MdEmojiEvents className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 text-2xl z-10 pointer-events-none transition-transform group-hover/filter:scale-110" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-14 pr-12 py-5 bg-white border-2 border-gray-100 rounded-[24px] focus:border-emerald-500 text-base font-black text-gray-800 cursor-pointer shadow-md hover:bg-gray-50 transition-all outline-none appearance-none min-w-[200px]"
                            >
                                <option value="all">View All</option>
                                <option value="pending">Pending Only</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Success</option>
                            </select>
                            <MdExpandMore className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-2xl pointer-events-none" />
                        </div>
                        <button
                            onClick={() => fetchRequests(true)}
                            className="p-5 bg-white border-2 border-gray-100 rounded-[24px] text-gray-500 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-md group active:scale-95"
                        >
                            <MdRefresh className="text-4xl group-hover:rotate-180 transition-transform duration-700" title="Refresh Data" />
                        </button>
                        <Link
                            href="/citizen/book-recycle/new"
                            className="flex items-center gap-4 px-12 py-5 bg-gray-900 text-white rounded-[24px] font-black text-base uppercase tracking-widest hover:bg-black shadow-2xl shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <MdAddCircle className="text-3xl" />
                            Request
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* --- Main Content Area Switchboard --- */}
            <div className="flex-1 overflow-y-auto customize-scrollbar p-6 lg:p-10 bg-gray-50/50 z-10 relative">
                <AnimatePresence mode="wait">
                    {selectedRequest ? (
                        <motion.div
                            key="details-view"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className={`flex flex-col gap-8 w-full mx-auto transition-opacity duration-300 ${detailLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'} pb-12`}
                        >
                            {/* --- Details Header (Back Action & Facility Info) --- */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-20">
                                <button
                                    onClick={() => setSelectedRequestId(null)}
                                    className="self-start flex items-center gap-3 px-5 py-3 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[#10b981] hover:bg-gray-50 hover:border-[#10b981]/30 transition-all shadow-sm group"
                                >
                                    <MdArrowForward className="text-xl rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Records
                                </button>
                                
                                <div className="flex items-center gap-4 bg-white p-3 pr-6 rounded-2xl border-2 border-indigo-50 shadow-sm transition-transform hover:scale-[1.02]">
                                    <div className="w-14 h-14 bg-indigo-500 text-white rounded-[16px] flex items-center justify-center shadow-inner">
                                        <MdOutlineAdminPanelSettings className="text-3xl" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Administrative Node</h4>
                                        <p className="text-xl font-black text-gray-900 tracking-tight leading-none truncate max-w-[200px] md:max-w-full">
                                            {selectedRequest.facilityName || "Assigning to Hub..."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {detailLoading && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* --- ROW 1: Identity & Specifications --- */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
                                {/* Left Side: Hero */}
                                <div className="relative bg-white rounded-[40px] p-8 md:p-12 border-2 border-gray-50 shadow-xl shadow-black/5 overflow-hidden group flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>

                                <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-green-600 rounded-[32px] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(16,185,129,0.3)] ring-8 ring-emerald-50 transition-transform duration-700 hover:rotate-6">
                                            {getDeviceIcon(selectedRequest.deviceType, "text-5xl")}
                                        </div>
                                        <div className="text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                                {getStatusBadge(selectedRequest.status, true)}
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{selectedRequest.requestNumber}</span>
                                            </div>
                                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-none tracking-tighter mb-4">
                                                {selectedRequest.deviceBrand} <br />
                                                <span className="text-emerald-600">{selectedRequest.deviceModel}</span>
                                            </h2>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                                                <MdLayers className="text-gray-400" />
                                                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{selectedRequest.categoryName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                                        {selectedRequest.status === "pending" && (
                                            <button
                                                onClick={() => handleCancelRequest(selectedRequest.id)}
                                                className="w-full px-6 py-4 text-xs font-black text-rose-600 hover:text-white hover:bg-rose-600 border-2 border-rose-100 hover:border-rose-600 rounded-[24px] uppercase tracking-[0.2em] transition-all bg-rose-50/30"
                                            >
                                                Discard Request
                                            </button>
                                        )}
                                        {selectedRequest.status === "completed" && selectedRequest.certificateUrl && (
                                            <a
                                                href={selectedRequest.certificateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all hover:-translate-y-1"
                                            >
                                                <MdEmojiEvents className="text-xl" />
                                                View Certificate
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                                    {[
                                        { label: "Condition", value: selectedRequest.deviceCondition, color: "blue", icon: MdCheckCircle },
                                        { label: "Status", value: selectedRequest.fulfillmentStatusDisplay || selectedRequest.status, color: "indigo", icon: MdLocalShipping },
                                        { label: "Booked On", value: selectedRequest.requestDate, color: "emerald", icon: MdCalendarToday },
                                        { label: "Payout", value: selectedRequest.estimatedValue || "TBD", color: "amber", icon: MdEmojiEvents },
                                    ].map((stat, i) => (
                                        <div key={i} className={`bg-gray-50 p-5 rounded-[28px] border border-gray-100 hover:border-gray-200 transition-colors group/stat`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                                <stat.icon className={`text-gray-300 group-hover/stat:text-emerald-500 transition-colors`} />
                                            </div>
                                            <p className="font-black text-gray-900 text-sm xl:text-base truncate">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                </div>

                                {/* Right Side: Order Specifications */}
                                <div className="relative bg-white rounded-[40px] p-8 md:p-12 border-2 border-blue-50 shadow-xl shadow-black/5 overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                <MdInfo className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Order Specifications</h4>
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">General Info</span>
                                            </div>
                                        </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: "Request Reference", value: selectedRequest.requestNumber },
                                            { label: "Fulfillment Type", value: selectedRequest.fulfillmentType },
                                            { label: "Address Line", value: `${selectedRequest.address}, ${selectedRequest.city}` },
                                            { label: "Planned Pickup", value: selectedRequest.pickupDate || "Not scheduled", highlight: true },
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col bg-white p-5 rounded-2xl border border-blue-50 shadow-sm">
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{item.label}</span>
                                                <span className={`text-sm font-bold ${item.highlight ? 'text-blue-600' : 'text-gray-800'}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    </div>
                                    {selectedRequest.status === "completed" && (
                                        <div className="mt-8 flex flex-col md:flex-row gap-4">
                                            <button
                                                onClick={() => downloadReceipt(selectedRequest)}
                                                className="flex-1 py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95"
                                            >
                                                <MdDownload className="text-xl" />
                                                Get Digital Receipt
                                            </button>
                                            <button
                                                onClick={() => setShowFeedbackForm(true)}
                                                className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                                            >
                                                <MdRateReview className="text-xl" />
                                                Share Feedback
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                <CollapsibleCard
                                    title="Tracking & History"
                                    icon={MdHistory}
                                    isOpen={expandedSection === 'timeline'}
                                    onToggle={() => toggleSection('timeline')}
                                    colorClass="emerald"
                                >
                                    <div className="space-y-10 py-4">
                                        {!statusHistory.length ? (
                                            <div className="text-center py-12 bg-white/40 rounded-[32px] border-2 border-dashed border-emerald-100">
                                                <MdHistory className="text-5xl text-emerald-100 mx-auto mb-4" />
                                                <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No Log Data Found</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                                                {statusHistory.some(h => h.statusType === 'RECYCLE_STATUS') && (
                                                    <div className="space-y-6">
                                                        <div
                                                            className="flex items-center justify-between cursor-pointer group/header bg-emerald-50/30 p-4 rounded-3xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors"
                                                            onClick={() => toggleSubTimeline('recycle')}
                                                        >
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 bg-emerald-500 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-emerald-100 transition-transform group-hover/header:rotate-3">
                                                                    <MdCheckCircle className="text-3xl" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-lg font-black text-gray-800 uppercase tracking-widest leading-none mb-1.5">Request Journey</h5>
                                                                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Lifecycle Tracking Logs</p>
                                                                </div>
                                                            </div>
                                                            <div className={`w-10 h-10 rounded-2xl border border-emerald-200 flex items-center justify-center transition-all ${expandedSubTimelines.includes('recycle') ? 'rotate-180 bg-emerald-600 text-white' : 'bg-white text-emerald-400'}`}>
                                                                <MdExpandMore className="text-2xl" />
                                                            </div>
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedSubTimelines.includes('recycle') && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                    <div className="relative pl-14 border-l-2 border-dashed border-emerald-100/50 ml-11 space-y-12 pb-10 mt-6">
                                                                        {statusHistory.filter(h => h.statusType === 'RECYCLE_STATUS').map((h, i) => (
                                                                            <div key={i} className="relative group/log">
                                                                                <div className={`absolute -left-[63px] top-0 w-11 h-11 bg-white border-2 rounded-full flex items-center justify-center transition-all duration-500 ${i === 0 ? "border-emerald-500 text-emerald-500 shadow-md z-10 scale-105" : "border-gray-100 text-gray-300"}`}>
                                                                                    <MdHistory className="text-xl" />
                                                                                </div>
                                                                                <div className="flex flex-col gap-4">
                                                                                    <div className="flex items-center gap-4">
                                                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${h.newStatus === 'RECYCLED' ? 'bg-emerald-600 text-white border-emerald-600' : ['VERIFIED', 'APPROVED'].includes(h.newStatus) ? 'bg-emerald-100 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                                                            {h.newStatus}
                                                                                        </span>
                                                                                        <span className="text-[11px] font-bold text-gray-400">{new Date(h.changedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                                    </div>
                                                                                    {h.comments && <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm w-full"><p className="text-sm font-bold text-gray-500 italic">"{h.comments}"</p></div>}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                                {statusHistory.some(h => h.statusType === 'FULFILLMENT_STATUS') && (
                                                    <div className="space-y-6">
                                                        <div
                                                            className="flex items-center justify-between cursor-pointer group/header bg-indigo-50/30 p-4 rounded-3xl border border-indigo-100/50 hover:bg-indigo-50 transition-colors"
                                                            onClick={() => toggleSubTimeline('fulfillment')}
                                                        >
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 bg-indigo-500 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-100 transition-transform group-hover/header:rotate-3">
                                                                    <MdLocalShipping className="text-3xl" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-lg font-black text-gray-800 uppercase tracking-widest leading-none mb-1.5">Logistics Operations</h5>
                                                                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Asset Movement Logs</p>
                                                                </div>
                                                            </div>
                                                            <div className={`w-10 h-10 rounded-2xl border border-indigo-200 flex items-center justify-center transition-all ${expandedSubTimelines.includes('fulfillment') ? 'rotate-180 bg-indigo-600 text-white' : 'bg-white text-indigo-400'}`}>
                                                                <MdExpandMore className="text-2xl" />
                                                            </div>
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedSubTimelines.includes('fulfillment') && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                    <div className="relative pl-14 border-l-2 border-dashed border-indigo-100/50 ml-11 space-y-12 pb-10 mt-6">
                                                                        {statusHistory.filter(h => h.statusType === 'FULFILLMENT_STATUS').map((h, i) => (
                                                                            <div key={i} className="relative group/log-ops">
                                                                                <div className={`absolute -left-[63px] top-0 w-11 h-11 bg-white border-2 rounded-full flex items-center justify-center transition-all duration-500 ${i === 0 ? "border-indigo-500 text-indigo-500 shadow-md z-10 scale-105" : "border-gray-100 text-gray-300"}`}>
                                                                                    <MdLayers className="text-xl" />
                                                                                </div>
                                                                                <div className="flex flex-col gap-4">
                                                                                    <div className="flex items-center gap-4">
                                                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${i === 0 ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-indigo-50 text-indigo-700 border-indigo-100"}`}>
                                                                                            {h.newStatus}
                                                                                        </span>
                                                                                        <span className="text-[11px] font-bold text-gray-400">{new Date(h.changedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                                    </div>
                                                                                    {h.comments && <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm w-full"><p className="text-sm font-bold text-gray-500 italic">"{h.comments}"</p></div>}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleCard>

                                {/* --- ROW 3: Communications & Feedback --- */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-12">
                                    <CollapsibleCard
                                        title="Communications"
                                        icon={MdNotifications}
                                        isOpen={expandedSection === 'reminders'}
                                        onToggle={() => toggleSection('reminders')}
                                    colorClass="orange"
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex-1">
                                            <h5 className="text-lg font-black text-gray-900 tracking-tight mb-2">Internal Reminder</h5>
                                            <p className="text-sm text-gray-500 font-bold leading-relaxed">Is your request delayed? Send a high-priority push notification to the assigned recycler or logistics agent.</p>
                                        </div>
                                        <button onClick={handleSendReminder} disabled={sendingReminder} className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-orange-900/20 disabled:opacity-50 transition-all">
                                            {sendingReminder ? 'Transmitting...' : <><MdNotifications className="text-xl" />Notify Agent</>}
                                        </button>
                                    </div>
                                </CollapsibleCard>

                                {selectedRequest.status === "completed" && (
                                    <CollapsibleCard
                                        title="Your Feedback"
                                        icon={MdRateReview}
                                        isOpen={expandedSection === 'feedback'}
                                        onToggle={() => toggleSection('feedback')}
                                        colorClass="rose"
                                        badge={<span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Help Us Improve</span>}
                                    >
                                        <FeedbackView key={feedbackRefreshKey} recycleRequestId={selectedRequest.id} onAddFeedback={() => setShowFeedbackForm(true)} />
                                    </CollapsibleCard>
                                )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                            className="w-full mx-auto flex flex-col gap-8 h-full pb-12"
                        >
                            <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[32px] border-2 border-gray-100 shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-1 leading-none">Activity Feed</span>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">All Order Transcripts</h2>
                                </div>
                                <div className="hidden md:flex items-center gap-6">
                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[20px] border-2 border-gray-100">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="w-10 h-10 flex items-center justify-center text-gray-500 rounded-[14px] hover:bg-white hover:text-emerald-600 shadow-sm disabled:opacity-50 transition-all font-black text-xl"
                                            >
                                                <MdChevronRight className="rotate-180" />
                                            </button>
                                            <div className="px-3 font-black text-xs uppercase tracking-widest text-gray-600 whitespace-nowrap flex items-center gap-1.5">
                                                Page <span className="text-emerald-600">{currentPage}</span> of {totalPages}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="w-10 h-10 flex items-center justify-center text-gray-500 rounded-[14px] hover:bg-white hover:text-emerald-600 shadow-sm disabled:opacity-50 transition-all font-black text-xl"
                                            >
                                                <MdChevronRight />
                                            </button>
                                        </div>
                                    )}

                                    {totalPages > 1 && <div className="w-px h-8 bg-gray-200"></div>}

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-gray-400">Total Found:</span>
                                        <div className="px-5 py-2 bg-gray-900 text-white rounded-[16px] flex items-center justify-center font-black text-sm shadow-md">
                                            {filteredRequests.length}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {filteredRequests.length === 0 ? (
                                <div className="bg-white/60 border-2 border-dashed border-gray-200 py-32 text-center rounded-[48px] shadow-inner m-4">
                                    <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-gray-300 ring-8 ring-gray-50/50">
                                        <MdSearch className="text-6xl" />
                                    </div>
                                    <p className="text-gray-900 font-black text-2xl tracking-tight mb-2">Zero Matches</p>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest px-4">The records you're hunting for seem elusive.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                                        {paginatedRequests.map((req, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={req.id}
                                                className="group relative flex flex-col gap-6 p-8 bg-white border-2 border-transparent hover:border-emerald-100 rounded-[40px] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 overflow-hidden"
                                            >
                                                {/* Decorative Background */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                
                                                {/* Header */}
                                                <div className="flex items-start justify-between">
                                                    <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center bg-gray-50 text-gray-400 border-2 border-gray-100 shadow-inner group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 group-hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-all duration-500 group-hover:rotate-6 shrink-0`}>
                                                        {getDeviceIcon(req.deviceType, "text-4xl")}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {getStatusBadge(req.status, false)}
                                                        <span className="text-[12px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest leading-none mt-1">
                                                            {new Date(req.requestDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mid Body */}
                                                <div className="flex-1 mt-2">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">{req.requestNumber}</p>
                                                    <h3 className="font-black text-2xl truncate leading-tight tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                        {req.deviceBrand} <span className="text-gray-400 font-bold ml-1">{req.deviceModel}</span>
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                                        <span className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-[12px] font-black text-slate-500 uppercase tracking-widest">
                                                            {req.categoryName}
                                                        </span>
                                                        {req.estimatedValue && (
                                                            <span className="text-[11px] bg-amber-50 px-3 py-1.5 rounded-[12px] border border-amber-100 font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                                                <MdEmojiEvents className="text-[12px]" />
                                                                {req.estimatedValue} Payout
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="w-full h-px bg-gray-100 mt-2"></div>

                                                {/* Action Bar */}
                                                <div className="flex justify-between items-center z-10">
                                                    <p className="text-xs font-bold text-gray-400">Click to view operations trail</p>
                                                    <button
                                                        onClick={() => setSelectedRequestId(req.id)}
                                                        className="flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[20px] font-black text-xs uppercase tracking-widest transition-all shadow-sm group/btn active:scale-95"
                                                    >
                                                        <MdVisibility className="text-lg" />
                                                        View Details
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showFeedbackForm && selectedRequest && (
                <FeedbackForm
                    recycleRequestId={selectedRequest.id}
                    userId={getUserID() || ""}
                    onClose={() => setShowFeedbackForm(false)}
                    onSubmitSuccess={() => {
                        setFeedbackRefreshKey(prev => prev + 1);
                        setExpandedSection('feedback');
                    }}
                />
            )}
        </div>
    );
};

export default MyRequestsList;
