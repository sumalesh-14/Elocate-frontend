"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { intermediaryApi, resolveFacilityId } from "@/lib/intermediary-api";
import { analyzeDeviceMaterials, getErrorMessage } from "@/lib/image-analyzer-api";
import { useToast } from "@/context/ToastContext";

// Platform Link Component to avoid hook violations in map
function PlatformLink({ platform }: { platform: any }) {
    const [imageError, setImageError] = useState(false);

    return (
        <a
            href={platform.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-blue-50 rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md group"
        >
            {platform.icon && !imageError ? (
                <img
                    src={platform.icon}
                    alt={platform.platformName}
                    className="h-10 w-auto mb-2 object-contain transition-transform group-hover:scale-110"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="h-10 w-10 mb-2 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
            )}
            <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 text-center transition-colors">
                {platform.platformName}
            </span>
        </a>
    );
}

export default function CollectionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");
    const [driverComments, setDriverComments] = useState<string>("");

    const [adjustmentReason, setAdjustmentReason] = useState<string>("");

    const [conditionCode, setConditionCode] = useState<string>("GOOD");
    const [verificationNotes, setVerificationNotes] = useState<string>("");
    const [finalAmount, setFinalAmount] = useState<string>("");

    // State for material analysis condition override
    const [analysisCondition, setAnalysisCondition] = useState<string>("");
    const [analysisNotes, setAnalysisNotes] = useState<string>("");

    const [analyzingMaterials, setAnalyzingMaterials] = useState<boolean>(false);
    const [materialsData, setMaterialsData] = useState<any>(null);

    // Status history state
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);

    // Collapsible card states - left side open by default, right side closed
    const [isStatusOpen, setIsStatusOpen] = useState<boolean>(true);
    const [isDeviceDetailsOpen, setIsDeviceDetailsOpen] = useState<boolean>(true);
    const [isMaterialAnalysisOpen, setIsMaterialAnalysisOpen] = useState<boolean>(false); // Closed by default
    const [isApproveOpen, setIsApproveOpen] = useState<boolean>(true); // Open by default
    const [isAssignDriverOpen, setIsAssignDriverOpen] = useState<boolean>(true); // Open by default
    const [isMarkDroppedOpen, setIsMarkDroppedOpen] = useState<boolean>(true);
    const [isVerifyDropOffOpen, setIsVerifyDropOffOpen] = useState<boolean>(true);
    const [isVerifyConditionOpen, setIsVerifyConditionOpen] = useState<boolean>(true);
    const [isMarkRecycledOpen, setIsMarkRecycledOpen] = useState<boolean>(true);
    const [isPricingSummaryOpen, setIsPricingSummaryOpen] = useState<boolean>(true);
    const [isConditionImpactOpen, setIsConditionImpactOpen] = useState<boolean>(true);
    const [isPlatformLinksOpen, setIsPlatformLinksOpen] = useState<boolean>(true);
    const [isMaterialTableOpen, setIsMaterialTableOpen] = useState<boolean>(true);
    const [isActionsOpen, setIsActionsOpen] = useState<boolean>(true); // Closed by default
    const [currentSection, setCurrentSection] = useState<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement;
            if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT" || active.getAttribute("contenteditable") === "true")) {
                return;
            }

            if (e.key === "ArrowRight") {
                setCurrentSection((prev) => (prev + 1) % 4);
            } else if (e.key === "ArrowLeft") {
                setCurrentSection((prev) => (prev - 1 + 4) % 4);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const [approveAmount, setApproveAmount] = useState<string>("");

    const fetchDetails = async () => {
        if (!params.id) return;
        try {
            if (!request) setLoading(true);
            const data = await intermediaryApi.requests.getById(params.id as string);
            setRequest(data);

            try {
                const historyData = await intermediaryApi.requests.getStatusHistory(params.id as string);
                setStatusHistory(historyData || []);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }

            // Initialize analysis condition with request's condition
            setAnalysisCondition(data.conditionCode || "GOOD");
            setAnalysisNotes(data.conditionNotes || "");

            // Fetch only drivers belonging to this request's facility
            const facilityId = data.facilityId || await resolveFacilityId() || undefined;
            const driversData = await intermediaryApi.drivers.getAll(undefined, undefined, 0, 100, facilityId);
            setDrivers(driversData?.content || []);
        } catch (error) {
            console.error("Failed to fetch request:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [params.id]);

    const calculateGrandTotal = () => {
        if (!materialsData) return request?.estimatedAmount || 0;
        let total = 0;
        materialsData.materials.forEach((m: any) => {
            total += (m.estimatedQuantityGrams * (m.editableRate || 0));
        });
        return Math.round(total * 100) / 100;
    };

    const grandTotal = calculateGrandTotal();

    const handleRateChange = (idx: number, newRate: string) => {
        if (!materialsData) return;
        const updated = [...materialsData.materials];
        updated[idx].editableRate = Number(newRate);
        setMaterialsData({ ...materialsData, materials: updated });
    };

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            const finalApproveAmt = approveAmount !== "" ? parseFloat(approveAmount) : grandTotal;
            await intermediaryApi.requests.approve(params.id as string, {
                adjustedEstimatedAmount: finalApproveAmt,
                adjustmentReason: adjustmentReason || "Standard Approval",
                aiPricingResponse: materialsData || undefined
            });
            showToast("Success\nRequest approved successfully.", "success");
            setTimeout(() => refreshData(), 1500);
        } catch (error) {
            showToast("Error\nFailed to approve. Check console.", "error");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignDriver = async () => {
        if (!selectedDriverId) {
            showToast("Selection Required\nPlease select a driver first.", "info");
            return;
        }
        try {
            setActionLoading(true);
            await intermediaryApi.requests.assignDriver(
                params.id as string,
                selectedDriverId,
                driverComments || undefined
            );
            showToast("Success\nDriver assigned successfully! Email sent with instructions.", "success");
            setTimeout(() => refreshData(), 1500);
        } catch (error) {
            showToast("Error\nFailed to assign driver. Check console.", "error");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkAsDropped = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.markDropped(params.id as string);
            showToast("Success\nMarked as received at facility.", "success");
            setTimeout(() => refreshData(), 1500);
        } catch (error) {
            showToast("Error\nFailed to mark as dropped.", "error");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyDropOff = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.verifyDropOff(params.id as string);
            showToast("Success\nVerified Drop-off successfully.", "success");
            setTimeout(() => refreshData(), 1500);
        } catch (error) {
            showToast("Error\nFailed to verify drop-off.", "error");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyCondition = async () => {
        try {
            setActionLoading(true);
            const finalAmountNum = finalAmount ? parseFloat(finalAmount) : undefined;
            await intermediaryApi.requests.verifyCondition(
                params.id as string,
                conditionCode,
                verificationNotes || "Condition verified on receipt.",
                finalAmountNum
            );
            showToast("Success\nCondition verified successfully.", "success");
            setTimeout(() => refreshData(), 1500);
        } catch (error) {
            showToast("Error\nFailed to verify condition.", "error");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkRecycled = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.markRecycled(params.id as string);
            showToast("Success\nMarked as Recycled!", "success");
            setTimeout(() => refreshData(), 1500);
        } catch (error) {
            showToast("Error\nFailed mark as recycled.", "error");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAnalyzeMaterials = async () => {
        if (!request) return;
        try {
            setAnalyzingMaterials(true);
            const payload = {
                brand_id: request.brandId || "mock",
                brand_name: request.brandName || "Unknown",
                category_id: request.categoryId || "mock",
                category_name: request.categoryName || "Unknown",
                model_id: request.deviceModelId || "mock",
                model_name: request.deviceModelName || "Unknown",
                country: "IN",
                deviceCondition: analysisCondition || "GOOD",
                conditionNotes: analysisNotes || `Device in ${analysisCondition || 'GOOD'} condition`
            };
            const res = await analyzeDeviceMaterials(payload);
            if (res.success && res.data) {
                const materialsWithRates = res.data.materials.map((m: any) => ({
                    ...m,
                    editableRate: m.marketRatePerGram
                }));
                res.data.materials = materialsWithRates;
                setMaterialsData(res.data);
                showToast("Analysis Complete\nMaterial composition data updated with condition-based pricing.", "success");
            } else {
                const msg = res.error?.code ? getErrorMessage(res.error.code) : (res.error?.message || "Could not fetch material data.");
                showToast("Analysis Failed\n" + msg, "error");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            showToast("System Error\nError running material analysis.", "error");
        } finally {
            setAnalyzingMaterials(false);
        }
    };

    const fetchStatusHistory = async () => {
        if (!params.id) return;
        try {
            setLoadingHistory(true);
            const history = await intermediaryApi.requests.getStatusHistory(params.id as string);
            setStatusHistory(history);
        } catch (error) {
            console.error("Failed to fetch status history:", error);
            showToast("Error\nFailed to load status history.", "error");
        } finally {
            setLoadingHistory(false);
        }
    };

    const refreshData = () => {
        fetchDetails();
        if (showHistory || statusHistory.length > 0) {
            fetchStatusHistory();
        }
    };

    const handleToggleHistory = () => {
        if (!showHistory && statusHistory.length === 0) {
            fetchStatusHistory();
        }
        setShowHistory(!showHistory);
    };

    const getStatusIcon = (status: string) => {
        const upper = status?.toUpperCase() || "";
        if (upper.includes("CREATED") || upper.includes("PENDING")) return "📝";
        if (upper.includes("APPROVED")) return "✅";
        if (upper.includes("ASSIGNED")) return "🚗";
        if (upper.includes("PICKUP")) return "📦";
        if (upper.includes("DROPPED") || upper.includes("DROP")) return "🏢";
        if (upper.includes("VERIFIED")) return "✓";
        if (upper.includes("RECYCLED") || upper.includes("COMPLETED")) return "♻️";
        if (upper.includes("REJECTED") || upper.includes("CANCELLED") || upper.includes("FAILED")) return "❌";
        return "🔄";
    };

    const getStatusColor = (status: string) => {
        const upper = status?.toUpperCase() || "";
        if (upper.includes("CREATED") || upper.includes("PENDING")) return "from-gray-500 to-gray-600";
        if (upper.includes("APPROVED")) return "from-green-500 to-emerald-600";
        if (upper.includes("ASSIGNED")) return "from-blue-500 to-cyan-600";
        if (upper.includes("PICKUP")) return "from-purple-500 to-pink-600";
        if (upper.includes("DROPPED") || upper.includes("DROP")) return "from-indigo-500 to-blue-600";
        if (upper.includes("VERIFIED")) return "from-teal-500 to-green-600";
        if (upper.includes("RECYCLED") || upper.includes("COMPLETED")) return "from-green-600 to-emerald-700";
        if (upper.includes("REJECTED") || upper.includes("CANCELLED") || upper.includes("FAILED")) return "from-red-500 to-red-600";
        return "from-gray-400 to-gray-500";
    };

    if (loading) return <div className="p-8 text-center text-eco-600">Loading collection details...</div>;
    if (!request) return <div className="p-8 text-center text-red-600">Failed to load request.</div>;

    const needsApproval = request.status === "CREATED" || request.status === "PENDING" || request.status === "REQUESTED";
    const needsDriver = request.fulfillmentType === "PICKUP" && !request.assignedDriverId && request.status !== "CANCELLED" && request.status !== "COMPLETED" && request.status !== "PENDING" && request.status !== "REQUESTED";
    // Drop-off specific logic
    const canMarkAsDropped = request.fulfillmentType === "DROP_OFF" && request.fulfillmentStatus === "DROP_PENDING" && request.status === "APPROVED";
    const canVerifyDropOff = request.fulfillmentType === "DROP_OFF" && request.fulfillmentStatus === "DROPPED_AT_FACILITY";

    const needsConditionVerification = (request.fulfillmentStatus === "PICKUP_COMPLETED" || request.fulfillmentStatus === "DROP_VERIFIED" || request.fulfillmentStatus === "PICKUP_FAILED") && request.status !== "VERIFIED" && request.status !== "RECYCLED";
    const canRecycle = request.status === "VERIFIED";

    const recycleStatusHistory = statusHistory.filter((item: any) => {
        const s = (item.newStatus || item.status || "").toUpperCase();
        return s && !s.includes('DROP') && !s.includes('PICKUP') && !s.includes('ASSIGN') && !s.includes('FACILITY');
    });
    const fulfillmentHistory = statusHistory.filter((item: any) => {
        const s = (item.newStatus || item.status || "").toUpperCase();
        return s && (s.includes('DROP') || s.includes('PICKUP') || s.includes('ASSIGN') || s.includes('FACILITY'));
    });

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Header with Gradient */}
            <header className="mb-8 w-full bg-white border-b border-gray-200 rounded-b-[2.5rem] shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)] animate-fadeIn">
                <div className="max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-16 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.push("/intermediary/collections")}
                            className="flex items-center gap-1 text-gray-500 hover:text-emerald-700 font-bold text-xs uppercase cursor-pointer mb-4 transition-all duration-200 group"
                        >
                            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            Back to List
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Active Request</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-tighter">Live Tracking</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-1">
                            {request.requestNumber || `Request #${request.id.split('-')[0].toUpperCase()}`}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm">Hardware Lifecycle Management • Batch {request.category || 'A-12'}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100/80 p-1.5 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                        {['Details', 'History', 'Analysis', 'Actions'].map((label, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSection(idx)}
                                className={`px-5 py-2 text-sm transition-all duration-300 rounded-full ${currentSection === idx ? 'font-bold text-white bg-emerald-700 shadow-md' : 'font-medium text-gray-500 hover:text-emerald-700'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content Carousel */}


            <div className="overflow-hidden w-full relative">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSection * 100}%)` }}
                >
                    {/* Section 1: Details */}
                    <div className="w-full flex-shrink-0 px-2 sm:px-4">
                        <div className="w-full space-y-8 animate-fadeIn">
                            {/* Status Overview Section */}
                            <section className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl text-emerald-700">📊</span>
                                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Status Overview</h2>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                                            <span className="font-bold">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Overall Status</p>
                                            <p className="text-2xl font-black text-gray-900 tracking-tight">{request.status}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-100/50 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                                            <span>🚚</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Fulfillment</p>
                                            <p className="text-2xl font-black text-gray-900 tracking-tight">{request.fulfillmentStatus}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Device & Logistics Details */}
                            <section className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl text-emerald-700">📱</span>
                                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Device & Logistics Details</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Left: Device Info */}
                                    <div className="p-6 border-r border-gray-100 space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-gray-400">💻</span>
                                            <h3 className="text-sm font-bold text-gray-600">Device Information</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Device Model</span>
                                                <span className="text-sm font-black text-gray-800">{request.deviceModelName || "Unknown"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</span>
                                                <span className="text-sm font-black text-gray-800">{request.categoryName}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Condition</span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-[10px] font-black rounded-full border border-gray-200 uppercase">{request.conditionCode}</span>
                                            </div>
                                            <div className="mt-8 p-5 bg-emerald-50 rounded-2xl flex justify-between items-center border border-emerald-100/30 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">💰</span>
                                                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Estimated Amount</span>
                                                </div>
                                                <span className="text-2xl font-black text-emerald-700">₹{request.estimatedAmount}</span>
                                            </div>
                                            <div className="p-5 bg-teal-50 rounded-2xl flex justify-between items-center border border-teal-100/30 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">✓</span>
                                                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Final Amount</span>
                                                </div>
                                                <span className="text-2xl font-black text-teal-700">₹{request.finalAmount || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Logistics */}
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-gray-400">🚚</span>
                                            <h3 className="text-sm font-bold text-gray-600">Logistics</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment Type</span>
                                                <span className="px-4 py-1.5 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 bg-gray-50">{request.fulfillmentType}</span>
                                            </div>
                                            {request.fulfillmentType === "PICKUP" ? (
                                                <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100/30">
                                                    <div className="flex items-center gap-2 mb-2 text-emerald-800">
                                                        <span>📍</span>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">Pickup Address</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">{request.pickupAddress}, {request.pickupCity}, {request.pickupState} {request.pickupPincode}</p>
                                                </div>
                                            ) : (
                                                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100/30">
                                                    <div className="flex items-center gap-2 mb-2 text-purple-800">
                                                        <span>🏢</span>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">Facility</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">{request.facilityName}</p>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Driver</span>
                                                <span className="text-sm font-black text-gray-800">{request.driverName || (request.assignedDriverId ? request.assignedDriverId.split('-')[0] : "Not Assigned")}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Created At</span>
                                                <span className="text-sm font-black text-gray-800">{new Date(request.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Additional Support Elements Grid */}

                        </div>
                    </div>
                    {/* Section 2: History */}

                    <div className="w-full flex-shrink-0 px-2 sm:px-4 pb-20">
                        <div className="w-full max-w-[1600px] mx-auto">

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-fadeIn">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 tracking-tight">
                                        <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Status History
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                    {/* Request Status Column */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Request Status <span className="text-gray-400 font-normal ml-1">({recycleStatusHistory.length} updates)</span></h3>
                                        </div>

                                        {loadingHistory ? (
                                            <div className="text-sm text-gray-500">Loading history...</div>
                                        ) : (
                                            <div className="relative pl-4 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gray-200">
                                                {["CREATED", "APPROVED", "VERIFIED", "RECYCLED"].map((stage, idx) => {
                                                    const historyItem = recycleStatusHistory.find((h: any) => (h.newStatus || h.status) === stage);
                                                    const isCompleted = !!historyItem;
                                                    return (
                                                        <div key={idx} className={`relative pl-10 ${idx !== 3 ? 'pb-12' : ''}`}>
                                                            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 ${isCompleted ? (stage.includes('FAILED') ? 'bg-red-600' : 'bg-green-700') + ' text-white shadow-sm' : 'bg-gray-100 border border-gray-200 text-gray-400'}`}>
                                                                {isCompleted ? (
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wider ${isCompleted ? (stage.includes('FAILED') ? 'bg-red-600' : 'bg-green-700') + ' text-white' : 'bg-gray-400 text-white'}`}>
                                                                        {isCompleted ? (historyItem.newStatus || historyItem.status) : stage}
                                                                    </span>
                                                                    {isCompleted && (
                                                                        <span className="text-xs font-medium text-gray-400">
                                                                            {new Date(historyItem.timestamp || historyItem.changedAt).toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-sm ${isCompleted ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                                                                    {isCompleted ? (historyItem.comments || "Stage Completed") : "Pending Stage"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Fulfillment Status Column */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Fulfillment Status <span className="text-gray-400 font-normal ml-1">({fulfillmentHistory.length} updates)</span></h3>
                                        </div>

                                        {loadingHistory ? (
                                            <div className="text-sm text-gray-500">Loading history...</div>
                                        ) : (
                                            <div className="relative pl-4 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gray-200">
                                                {(request.fulfillmentType === "DROP_OFF"
                                                    ? ["DROP_PENDING", "DROPPED_AT_FACILITY", "DROP_VERIFIED"]
                                                    : (fulfillmentHistory.some((h: any) => (h.newStatus || h.status) === "PICKUP_FAILED")
                                                        ? ["PICKUP_REQUESTED", "PICKUP_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKUP_FAILED"]
                                                        : ["PICKUP_REQUESTED", "PICKUP_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKUP_COMPLETED"])
                                                ).map((stage, idx, arr) => {
                                                    const historyItem = fulfillmentHistory.find((h: any) => {
                                                        const s = (h.newStatus || h.status || "");
                                                        return s === stage || (stage === "DRIVER_ASSIGNED" && s.includes("ASSIGN"));
                                                    });
                                                    const isCompleted = !!historyItem;
                                                    const label = stage === "DRIVER_ASSIGNED" && historyItem ? (historyItem.newStatus || historyItem.status) : stage;
                                                    return (
                                                        <div key={idx} className={`relative pl-10 ${idx !== arr.length - 1 ? 'pb-12' : ''}`}>
                                                            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 ${isCompleted ? (stage.includes('FAILED') ? 'bg-red-600' : 'bg-green-700') + ' text-white shadow-sm' : 'bg-gray-100 border border-gray-200 text-gray-400'}`}>
                                                                {isCompleted ? (
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wider ${isCompleted ? (stage.includes('FAILED') ? 'bg-red-600' : 'bg-green-700') + ' text-white' : 'bg-gray-400 text-white'}`}>
                                                                        {label}
                                                                    </span>
                                                                    {isCompleted && (
                                                                        <span className="text-xs font-medium text-gray-400">
                                                                            {new Date(historyItem.timestamp || historyItem.changedAt).toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-sm ${isCompleted ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                                                                    {isCompleted ? (historyItem.comments || "Stage Completed") : "Pending Stage"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Impact and Quick Actions Blocks below History */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                                <div className="lg:col-span-8">
                                    <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-emerald-50 p-8 rounded-3xl relative overflow-hidden h-full shadow-lg">
                                        <div className="relative z-10">
                                            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] mb-8 text-emerald-200">Sustainability Impact</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-emerald-300">CO2 Avoided</span>
                                                    <span className="text-3xl font-extrabold text-white mt-1">{(grandTotal * 0.15).toFixed(1)} kg</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-emerald-300">Metals Recovered</span>
                                                    <span className="text-3xl font-extrabold text-white mt-1">{(grandTotal * 0.05).toFixed(1)} kg</span>
                                                </div>
                                                <div className="flex flex-col border-l border-emerald-700/50 pl-8">
                                                    <span className="text-sm font-bold text-emerald-300">Net Impact</span>
                                                    <span className="text-3xl font-black text-green-300 mt-1">A+ Rating</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500 rounded-full blur-[100px] opacity-40"></div>
                                    </div>
                                </div>
                                <div className="lg:col-span-4">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
                                        <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-gray-400">Quick Actions</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button className="flex flex-col items-center justify-center gap-3 p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
                                                <svg className="w-6 h-6 text-emerald-700 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                <span className="text-[10px] font-extrabold uppercase tracking-tight text-gray-700">Export CSV</span>
                                            </button>
                                            <button className="flex flex-col items-center justify-center gap-3 p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
                                                <svg className="w-6 h-6 text-emerald-700 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                <span className="text-[10px] font-extrabold uppercase tracking-tight text-gray-700">Share Log</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* Section 3: Analysis */}
                    <div className="w-full flex-shrink-0 px-2 sm:px-6 pb-20">
                        <div className="max-w-[1600px] mx-auto space-y-10">
                            {/* 1. Material Analysis Header */}
                            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest rounded-full">Automated Diagnostic</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                                            <span className="text-xs text-gray-500 font-medium">AI Engine Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition-colors">Export PDF</button>
                                    <button
                                        onClick={() => materialsData ? setMaterialsData(null) : handleAnalyzeMaterials()}
                                        disabled={analyzingMaterials}
                                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {analyzingMaterials ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Running Analysis...</span>
                                            </>
                                        ) : materialsData ? "New Analysis" : "Verify Analysis"}
                                    </button>
                                </div>
                            </section>

                            {!materialsData ? (
                                <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 max-w-2xl mx-auto flex flex-col items-center justify-center text-center animate-fadeIn relative overflow-hidden mt-6">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <span className="text-9xl">🔬</span>
                                    </div>
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
                                        <span className="text-3xl">🤖</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">AI Diagnostic Workflow</h3>
                                    <p className="text-gray-500 text-sm mb-8 max-w-md font-medium">Configure device properties and diagnostic overrides safely to run accurate secondary composition mapping calculations.</p>

                                    <div className="w-full max-w-md space-y-5 text-left bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Sub-Hardware Condition</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 text-lg flex items-center">
                                                    <span>💎</span>
                                                </div>
                                                <select
                                                    value={analysisCondition || "GOOD"}
                                                    onChange={e => setAnalysisCondition(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-4 bg-white border border-gray-100 shadow-[0_4px_25px_-12px_rgba(0,0,0,0.06)] rounded-2xl font-extrabold text-sm text-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none cursor-pointer appearance-none transition-all group-hover:border-emerald-500/50"
                                                >
                                                    <option value="EXCELLENT">EXCELLENT - Pristine/Working</option>
                                                    <option value="GOOD">GOOD - Normal wear/tear</option>
                                                    <option value="FAIR">FAIR - Minor damage/Faults</option>
                                                    <option value="POOR">POOR - Heavily damaged/Scrap</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Additional Verification Notes</label>
                                            <textarea
                                                rows={3}
                                                value={analysisNotes}
                                                onChange={e => setAnalysisNotes(e.target.value)}
                                                className="w-full px-5 py-4 bg-white border border-gray-200 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder-gray-400 font-medium"
                                                placeholder="Describe specific diagnosis details, broken shields, missing modules..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleAnalyzeMaterials}
                                            disabled={analyzingMaterials}
                                            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] mt-2 flex items-center justify-center gap-2 disabled:opacity-75"
                                        >
                                            {analyzingMaterials ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    <span>Formulating Data...</span>
                                                </>
                                            ) : 'Submit Diagnostics & Analyze'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* 2. Pricing Summary Cards */}
                                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Material Value */}
                                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <span className="text-6xl">📊</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-4">Estimated Material Value</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-emerald-700">₹{materialsData?.recyclingEstimate?.totalMaterialValue?.toLocaleString() || (grandTotal || 0).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">↑ +4.2% Market Shift</p>
                                        </div>

                                        {/* Recycling Price */}
                                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <span className="text-6xl">♻️</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-4">Current Recycling Price</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-gray-900">₹{materialsData?.recyclingEstimate?.suggestedRecyclingPrice?.toFixed(2) || ((grandTotal || 0) * 0.85).toFixed(2)}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 font-medium">After processing fees</p>
                                        </div>

                                        {/* Buyback Price */}
                                        <div className="bg-emerald-700 p-8 rounded-2xl shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                                <span className="text-6xl text-white">💰</span>
                                            </div>
                                            <p className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider mb-4">Guaranteed Buyback Price</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-white">₹{materialsData?.recyclingEstimate?.suggestedBuybackPrice?.toFixed(2) || ((grandTotal || 0) * 0.95).toFixed(2)}</span>
                                            </div>
                                            <p className="text-xs text-emerald-100/80 mt-2 font-medium">Valid for 48 hours</p>
                                        </div>
                                    </section>

                                    {/* Bento Layout for Composition and sidebar */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* 3. Material Composition Breakdown */}
                                        <section className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Material Composition Breakdown</h3>
                                                    <p className="text-sm text-gray-400 mt-1 font-medium">Detailed list of recoverable precious metals and industrial elements.</p>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100">
                                                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Material</th>
                                                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 text-center">Location</th>
                                                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 text-right">Quantity (g)</th>
                                                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 text-right">Rate (₹/g)</th>
                                                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 text-right">Value (₹)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {(materialsData?.materials || []).map((m: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${m.isPrecious ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                                                        <span className="font-bold text-gray-900 text-sm">{m.materialName || m.material}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5 text-xs text-gray-500 text-center font-bold tracking-tight">{m.foundIn || "Hardware Component"}</td>
                                                                <td className="px-6 py-5 text-sm text-gray-800 font-extrabold text-right">{m.estimatedQuantityGrams}g</td>
                                                                <td className="px-6 py-5 text-sm text-gray-500 font-medium text-right">
                                                                    <input
                                                                        type="number"
                                                                        value={m.editableRate}
                                                                        onChange={(e) => handleRateChange(idx, e.target.value)}
                                                                        className="w-24 p-1.5 text-xs text-right border border-gray-200 rounded-lg shadow-sm focus:ring-1 focus:ring-emerald-500 font-bold bg-gray-50/50 border-transparent outline-none"
                                                                        step="0.01"
                                                                    />
                                                                </td>
                                                                <td className="px-8 py-5 text-sm font-black text-emerald-700 text-right">
                                                                    ₹{(m.estimatedQuantityGrams * (m.editableRate || 0)).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-emerald-50/20 border-t border-emerald-100">
                                                            <td className="px-8 py-6 text-right font-black text-emerald-800 uppercase tracking-widest text-xs" colSpan={4}>Grand Total Material Value</td>
                                                            <td className="px-8 py-6 text-right font-black text-xl text-emerald-800">₹{grandTotal.toFixed(2)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </section>

                                        {/* Sidebar Column */}
                                        <aside className="lg:col-span-4 space-y-8">
                                            {/* Parameter Settings (Added To Retain Functionality) */}

                                            {/* Condition Impact Analysis */}
                                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                                                        <span>📊</span>
                                                    </div>
                                                    <h4 className="font-bold text-lg text-gray-900 tracking-tight">Condition Impact</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-emerald-600 text-lg mt-0.5">✓</span>
                                                        <p className="text-sm leading-relaxed text-gray-500 font-medium">
                                                            <span className="font-black text-gray-900">{analysisCondition || "GOOD"} Grade:</span> {materialsData?.recyclingEstimate?.conditionImpact || "Minor scratches or wear have negligible impact on the precious metal recovery rate but increase functional resale value with optimized extraction workflows."}
                                                        </p>
                                                    </div>
                                                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Impact Insight</p>
                                                        <p className="text-xs text-gray-600 font-medium">{analysisNotes || "The device structural integrity prevents battery contamination, maximizing the recovery value of cobalt and rare element yields."}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Market Price Comparison */}
                                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                                                        <span>🏪</span>
                                                    </div>
                                                    <h4 className="font-bold text-lg text-gray-900 tracking-tight">Current Market Check</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {materialsData?.devicePricing?.platformLinks && materialsData.devicePricing.platformLinks.length > 0 ? (
                                                        materialsData.devicePricing.platformLinks.map((platform: any, idx: number) => (
                                                            <a key={idx} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-emerald-200 transition-all font-black text-[10px] tracking-tight text-gray-400 hover:text-emerald-700 hover:bg-emerald-50/30 text-center" href={platform.link} target="_blank" rel="noopener noreferrer">
                                                                <span>{platform.platformName.toUpperCase()}</span>
                                                            </a>
                                                        ))
                                                    ) : (
                                                        ['Amazon', 'Flipkart', 'Croma', 'Vijay Sales'].map((mkt, idx) => (
                                                            <div key={idx} className="p-3 border border-gray-100 rounded-xl text-center font-black text-[10px] text-gray-400">
                                                                {mkt.toUpperCase()}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-4 text-center italic font-medium">Live market aggregation updated on diagnostics extraction</p>
                                            </div>
                                        </aside>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Section 4: Actions */}
                    <div className="w-full flex-shrink-0 px-2 sm:px-4 pb-20">
                        <div className="w-full max-w-4xl mx-auto space-y-12">

                            <div className="mb-4">
                                <h4 className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest mb-2">Logistics Command</h4>
                                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Operational Dashboard</h2>
                            </div>

                            {needsApproval && (
                                <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-10 animate-fadeIn">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-blue-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Approve Request</h3>
                                            <p className="text-sm text-gray-500 font-medium tracking-tight">Review AI estimation and finalize quote parameters</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-6 sm:p-8 rounded-[1.5rem] border border-gray-100/60">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Final Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                                                    <input
                                                        type="number"
                                                        className="w-full pl-11 px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-bold placeholder-gray-300 transition-all font-mono text-lg"
                                                        placeholder={grandTotal.toFixed(2)}
                                                        value={approveAmount}
                                                        onChange={e => setApproveAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Adjustment Reason (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Standard Approval..."
                                                    value={adjustmentReason}
                                                    onChange={e => setAdjustmentReason(e.target.value)}
                                                    className="w-full px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-gray-400 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center gap-6 mt-10 pt-6 border-t border-gray-200/60">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Save Draft</button>
                                            <button
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-extrabold rounded-[1.25rem] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)] flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? "Processing..." : "Confirm Approval"}
                                                {!actionLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {needsDriver && (
                                <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-10 animate-fadeIn">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Assign Driver</h3>
                                            <p className="text-sm text-gray-500 font-medium tracking-tight">Coordinate fleet deployment for Order #{request?.id?.slice(-4) || '8829'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-6 sm:p-8 rounded-[1.5rem] border border-gray-100/60">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Select Available Driver</label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedDriverId}
                                                        onChange={e => setSelectedDriverId(e.target.value)}
                                                        className="w-full px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Marcus Aurelius (Heavy Cargo)</option>
                                                        {drivers.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Dispatch Priority</label>
                                                <div className="flex gap-3">
                                                    <div className="flex-1 py-4 text-center text-sm font-bold text-gray-600 bg-white border border-gray-200/70 rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.03)] cursor-pointer hover:border-gray-300">Standard</div>
                                                    <div className="flex-1 py-4 text-center text-sm font-bold text-purple-700 bg-purple-100 border border-purple-200 rounded-[1.25rem] shadow-sm cursor-pointer">High Priority</div>
                                                    <div className="flex-1 py-4 text-center text-sm font-bold text-gray-600 bg-white border border-gray-200/70 rounded-[1.25rem] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.03)] cursor-pointer hover:border-gray-300">Emergency</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Special Instructions (Optional)</label>
                                            <textarea
                                                value={driverComments}
                                                onChange={e => setDriverComments(e.target.value)}
                                                placeholder="e.g. Gate code 1234, handle with care..."
                                                className="w-full px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium resize-none placeholder-gray-300"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end items-center gap-6 mt-10 pt-6 border-t border-gray-200/60">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Save Draft</button>
                                            <button
                                                onClick={handleAssignDriver}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-extrabold rounded-[1.25rem] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)] flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? "Processing..." : "Confirm Assignment"}
                                                {!actionLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {canMarkAsDropped && (
                                <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-10 animate-fadeIn">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Receive Drop-off</h3>
                                            <p className="text-sm text-gray-500 font-medium tracking-tight">Logistics receipt at facility checkpoint</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-6 sm:p-8 rounded-[1.5rem] border border-gray-100/60">
                                        <div className="flex justify-between items-center bg-white p-5 rounded-[1.25rem] border border-gray-200/70 shadow-sm mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-extrabold text-gray-900">Current Facility</p>
                                                    <p className="text-xs text-gray-500 font-medium">Main processing hub #41</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Ready</span>
                                        </div>

                                        <div className="flex justify-end items-center gap-6 mt-8 pt-6 border-t border-gray-200/60">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                                            <button
                                                onClick={handleMarkAsDropped}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-extrabold rounded-[1.25rem] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)] flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? "Processing..." : "Confirm Receipt"}
                                                {!actionLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {canVerifyDropOff && (
                                <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-10 animate-fadeIn">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Verify Physical Drop-off</h3>
                                            <p className="text-sm text-gray-500 font-medium tracking-tight">Confirm items received match manifest</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-6 sm:p-8 rounded-[1.5rem] border border-gray-100/60">
                                        <div className="flex justify-end items-center gap-6 mt-4">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Report Issue</button>
                                            <button
                                                onClick={handleVerifyDropOff}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-extrabold rounded-[1.25rem] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)] flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? "Processing..." : "Verify Package"}
                                                {!actionLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {needsConditionVerification && (
                                <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-10 animate-fadeIn">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Verify Condition</h3>
                                            <p className="text-sm text-gray-500 font-medium tracking-tight">Final quality inspection & hardware triage</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-6 sm:p-8 rounded-[1.5rem] border border-gray-100/60">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Hardware Condition</label>
                                                <div className="relative">
                                                    <select
                                                        value={conditionCode}
                                                        onChange={e => setConditionCode(e.target.value)}
                                                        className="w-full px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-extrabold appearance-none cursor-pointer"
                                                    >
                                                        <option value="FLAWLESS">⭐ Flawless (Grade A)</option>
                                                        <option value="GOOD">✓ Good (Grade B)</option>
                                                        <option value="FAIR">~ Fair (Grade C)</option>
                                                        <option value="POOR">✗ Poor / Parts Only</option>
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Payment Override (Optional)</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={finalAmount}
                                                        onChange={e => setFinalAmount(e.target.value)}
                                                        placeholder="Leave blank for estimate"
                                                        className="w-full pl-11 px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-extrabold placeholder-gray-400 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block">Quality Assurance Notes</label>
                                            <textarea
                                                value={verificationNotes}
                                                onChange={e => setVerificationNotes(e.target.value)}
                                                placeholder="e.g. Battery health 85%, minor chassis scratches..."
                                                className="w-full px-5 py-4 bg-white border border-gray-200/70 rounded-[1.25rem] text-sm text-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium resize-none placeholder-gray-300"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end items-center gap-6 mt-10 pt-6 border-t border-gray-200/60">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Flag as Defective</button>
                                            <button
                                                onClick={handleVerifyCondition}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-extrabold rounded-[1.25rem] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)] flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? "Processing..." : "Confirm Verification"}
                                                {!actionLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {canRecycle && (
                                <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-10 animate-fadeIn">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Complete Recycling</h3>
                                            <p className="text-sm text-gray-500 font-medium tracking-tight">Finalize order and release payment credits</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-6 sm:p-8 rounded-[1.5rem] border border-gray-100/60">
                                        <div className="flex justify-end items-center gap-6 mt-4">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                                            <button
                                                onClick={handleMarkRecycled}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-[1.25rem] shadow-[0_8px_20px_-8px_rgba(5,150,105,0.6)] flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? "Processing..." : "Complete Pipeline"}
                                                {!actionLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!needsApproval && !needsDriver && !canMarkAsDropped && !canVerifyDropOff && !needsConditionVerification && !canRecycle && (
                                <div className="text-center py-16 px-6 bg-slate-50/80 rounded-[2rem] border border-gray-200/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                    <div className="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">No Actions Needed</h3>
                                    <p className="text-gray-500 font-medium text-sm">All operations are up to date for this order.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
