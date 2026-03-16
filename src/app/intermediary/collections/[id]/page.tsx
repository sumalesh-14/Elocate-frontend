"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { intermediaryApi } from "@/lib/intermediary-api";
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
            <span className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 text-center transition-colors">
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
    const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false); // Closed by default

    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.id) return;
            try {
                setLoading(true);
                const data = await intermediaryApi.requests.getById(params.id as string);
                setRequest(data);

                // Initialize analysis condition with request's condition
                setAnalysisCondition(data.conditionCode || "GOOD");
                setAnalysisNotes(data.conditionNotes || "");

                // Fetch drivers right away so we have them if needed
                const driversData = await intermediaryApi.drivers.getAll();
                setDrivers(driversData?.content || []);
            } catch (error) {
                console.error("Failed to fetch request:", error);
            } finally {
                setLoading(false);
            }
        };
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
            await intermediaryApi.requests.approve(params.id as string, {
                adjustedEstimatedAmount: grandTotal,
                adjustmentReason: adjustmentReason || "Standard Approval",
                aiPricingResponse: materialsData || undefined
            });
            showToast("Success\nRequest approved successfully.", "success");
            setTimeout(() => window.location.reload(), 1500);
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
            setTimeout(() => window.location.reload(), 1500);
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
            setTimeout(() => window.location.reload(), 1500);
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
            setTimeout(() => window.location.reload(), 1500);
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
            setTimeout(() => window.location.reload(), 1500);
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
            setTimeout(() => window.location.reload(), 1500);
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

    const needsConditionVerification = (request.fulfillmentStatus === "PICKUP_COMPLETED" || request.fulfillmentStatus === "DROP_VERIFIED") && request.status !== "VERIFIED" && request.status !== "RECYCLED";
    const canRecycle = request.status === "VERIFIED";

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-eco-600 via-eco-500 to-green-500 rounded-2xl p-6 mb-6 shadow-lg animate-fadeIn">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📋</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-md">
                                Request #{request.id.split('-')[0].toUpperCase()}
                            </h1>
                        </div>
                        <p className="text-eco-50 text-sm ml-13">Collection Management Dashboard</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card with Animation */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slideInLeft">
                        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsStatusOpen(!isStatusOpen)}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-eco-500 to-green-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">📊</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Status Overview</h2>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg 
                                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Status Cards Grid */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 overflow-hidden ${isStatusOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-gradient-to-br from-eco-50 to-green-50 rounded-xl p-4 border-2 border-eco-200 hover:border-eco-300 transition-all duration-300 transform hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-eco-500 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white text-xl font-bold">✓</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-eco-700 uppercase tracking-wide">Overall Status</span>
                                        <div className="text-2xl font-bold text-eco-900 mt-1">{request.status}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 transform hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className={"w-12 h-12 rounded-full flex items-center justify-center shadow-md " + (request.fulfillmentStatus === "COMPLETED" ? "bg-green-500" : "bg-amber-500")}>
                                        <span className="text-white text-xl font-bold">🚚</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Fulfillment</span>
                                        <div className={"text-2xl font-bold mt-1 " + (request.fulfillmentStatus === "COMPLETED" ? "text-green-600" : "text-amber-600")}>
                                            {request.fulfillmentStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device & Logistics Details Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slideInLeft" style={{animationDelay: '0.1s'}}>
                        <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => setIsDeviceDetailsOpen(!isDeviceDetailsOpen)}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">📱</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Device & Logistics Details</h2>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg 
                                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isDeviceDetailsOpen ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <div className={`transition-all duration-300 overflow-hidden ${isDeviceDetailsOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Device Details Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-gray-200">
                                    <span className="text-lg">💻</span>
                                    <h3 className="text-base font-bold text-gray-800">Device Information</h3>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Device Model</span>
                                        <span className="font-bold text-gray-800">{request.deviceModelName || "Unknown"}</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                                        <span className="font-bold text-gray-800">{request.categoryName} ({request.brandName})</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Condition</span>
                                        <span className="font-bold text-gray-800 px-3 py-1 bg-white rounded-full border border-gray-300">{request.conditionCode}</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-eco-50 to-green-50 rounded-lg p-4 border-2 border-eco-200 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-eco-700">💰 Estimated Amount</span>
                                        <span className="text-2xl font-bold text-eco-900">₹{request.estimatedAmount}</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-green-700">✓ Final Amount</span>
                                        <span className="text-2xl font-bold text-green-900">₹{request.finalAmount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-gray-200">
                                    <span className="text-lg">🚚</span>
                                    <h3 className="text-base font-bold text-gray-800">Logistics</h3>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Fulfillment Type</span>
                                        <span className="font-bold text-gray-800 px-3 py-1 bg-white rounded-full border border-gray-300">{request.fulfillmentType}</span>
                                    </div>
                                </div>
                                
                                {request.fulfillmentType === "PICKUP" ? (
                                    <>
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <span className="text-xs font-semibold text-blue-700 uppercase block mb-2">📍 Pickup Address</span>
                                            <span className="font-medium text-gray-800 text-sm block leading-relaxed">
                                                {request.pickupAddress}, {request.pickupCity}, {request.pickupState} {request.pickupPincode}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Assigned Driver</span>
                                                <span className="font-bold text-gray-800">{request.assignedDriverId ? request.assignedDriverId.split('-')[0] : "Not Assigned"}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                        <span className="text-xs font-semibold text-purple-700 uppercase block mb-2">🏢 Facility</span>
                                        <span className="font-bold text-gray-800">{request.facilityName}</span>
                                    </div>
                                )}
                                
                                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Created At</span>
                                        <span className="font-medium text-gray-800 text-sm">{new Date(request.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Status History Timeline */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
                        <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={handleToggleHistory}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">📜</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Status History</h2>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg 
                                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <div className={`transition-all duration-300 overflow-hidden ${showHistory ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {loadingHistory ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                    <p>Loading history...</p>
                                </div>
                            ) : statusHistory.length > 0 ? (
                                <div>
                                    {/* Filter/Group Status History */}
                                    {(() => {
                                        const recycleStatusHistory = statusHistory.filter((item: any) => item.statusType === 'RECYCLE_STATUS');
                                        const fulfillmentHistory = statusHistory.filter((item: any) => item.statusType === 'FULFILLMENT_STATUS');
                                        
                                        return (
                                            <div className="space-y-6">
                                                {/* Main Request Status Timeline */}
                                                {recycleStatusHistory.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-purple-200">
                                                            <span className="text-lg">🎯</span>
                                                            <h3 className="text-base font-bold text-gray-800">Request Status</h3>
                                                            <span className="text-xs text-gray-500">({recycleStatusHistory.length} updates)</span>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-green-200"></div>
                                                            <div className="space-y-4">
                                                                {recycleStatusHistory.map((item: any, idx: number) => (
                                                                    <div key={item.id} className="relative pl-16 animate-fadeIn" style={{animationDelay: `${idx * 0.1}s`}}>
                                                                        <div className={`absolute left-3 w-6 h-6 rounded-full bg-gradient-to-br ${getStatusColor(item.newStatus)} shadow-lg flex items-center justify-center text-white text-xs font-bold border-4 border-white`}>
                                                                            {getStatusIcon(item.newStatus)}
                                                                        </div>
                                                                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-md">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(item.newStatus)} text-white rounded-full text-sm font-bold shadow-sm`}>
                                                                                    {item.newStatus}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">{new Date(item.changedAt).toLocaleString()}</span>
                                                                            </div>
                                                                            {item.comments && (
                                                                                <p className="text-sm text-gray-700 leading-relaxed">{item.comments}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Fulfillment/Operational Timeline */}
                                                {fulfillmentHistory.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-200">
                                                            <span className="text-lg">🚚</span>
                                                            <h3 className="text-base font-bold text-gray-800">Fulfillment Status</h3>
                                                            <span className="text-xs text-gray-500">({fulfillmentHistory.length} updates)</span>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-cyan-200"></div>
                                                            <div className="space-y-4">
                                                                {fulfillmentHistory.map((item: any, idx: number) => (
                                                                    <div key={item.id} className="relative pl-16 animate-fadeIn" style={{animationDelay: `${idx * 0.1}s`}}>
                                                                        <div className={`absolute left-3 w-6 h-6 rounded-full bg-gradient-to-br ${getStatusColor(item.newStatus)} shadow-lg flex items-center justify-center text-white text-xs font-bold border-4 border-white`}>
                                                                            {getStatusIcon(item.newStatus)}
                                                                        </div>
                                                                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-md">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(item.newStatus)} text-white rounded-full text-sm font-bold shadow-sm`}>
                                                                                    {item.newStatus}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">{new Date(item.changedAt).toLocaleString()}</span>
                                                                            </div>
                                                                            {item.comments && (
                                                                                <p className="text-sm text-gray-700 leading-relaxed">{item.comments}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p>No status history available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Material Analysis Results - Moved to Left Column */}
                    {materialsData && (
                        <div className="space-y-6 animate-slideInUp">
                            {/* Pricing Summary Cards */}
                            {materialsData.recyclingEstimate && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsPricingSummaryOpen(!isPricingSummaryOpen)}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-lg">💰</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Pricing Summary</h3>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg 
                                                className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isPricingSummaryOpen ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300 overflow-hidden ${isPricingSummaryOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {/* Material Value Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                                <span className="text-2xl">💎</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Material Value</h4>
                                        </div>
                                        <p className="text-4xl font-bold text-blue-900 mb-2">
                                            ₹{materialsData.recyclingEstimate.totalMaterialValue?.toFixed(2) || grandTotal.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-blue-700 font-medium">Total raw material worth</p>
                                    </div>

                                    {/* Recycling Price Card */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                                <span className="text-2xl">♻️</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-green-900 uppercase tracking-wide">Recycling Price</h4>
                                        </div>
                                        <p className="text-4xl font-bold text-green-900 mb-2">
                                            ₹{materialsData.recyclingEstimate.suggestedRecyclingPrice?.toFixed(2) || (grandTotal * 0.55).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-green-700 font-medium">Condition-adjusted value</p>
                                    </div>

                                    {/* Buyback Price Card */}
                                    {materialsData.recyclingEstimate.suggestedBuybackPrice && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                                                    <span className="text-2xl">💰</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Buyback Price</h4>
                                            </div>
                                            <p className="text-4xl font-bold text-purple-900 mb-2">
                                                ₹{materialsData.recyclingEstimate.suggestedBuybackPrice.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-purple-700 font-medium">
                                                🚀 {(materialsData.recyclingEstimate.suggestedBuybackPrice / materialsData.recyclingEstimate.suggestedRecyclingPrice).toFixed(1)}x better than recycling
                                            </p>
                                        </div>
                                    )}
                                </div>
                                </div>
                            )}

                            {/* Condition Impact Banner */}
                            {materialsData.recyclingEstimate?.conditionImpact && (
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl">ℹ️</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-indigo-900 mb-2 text-base">Condition Impact Analysis</h4>
                                            <p className="text-sm text-indigo-800 leading-relaxed">{materialsData.recyclingEstimate.conditionImpact}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* E-Commerce Platform Links */}
                            {materialsData.devicePricing?.platformLinks && materialsData.devicePricing.platformLinks.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xl">🛒</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Check Current Market Price</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {materialsData.devicePricing.platformLinks.map((platform: any, idx: number) => (
                                            <PlatformLink key={idx} platform={platform} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Material Breakdown Table */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xl">🔬</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Material Composition Breakdown</h3>
                                        <p className="text-sm text-gray-500">Detailed analysis of recoverable materials</p>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-indigo-700">📋 Analysis Method:</span> {materialsData.analysisDescription}
                                    </p>
                                </div>

                                <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-sm">
                                    <table className="min-w-full text-left bg-white">
                                        <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                                            <tr>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Material</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right">Quantity (g)</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right">Rate (₹/g)</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right">Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {materialsData.materials.map((m: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${m.isPrecious ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse' : 'bg-gray-400'}`}></div>
                                                            <div>
                                                                <span className="font-bold text-gray-900 text-base">{m.materialName}</span>
                                                                {m.isPrecious && (
                                                                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-600 shadow-sm">
                                                                        ⭐ PRECIOUS
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                        <span className="line-clamp-2">{m.foundIn}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-semibold text-gray-800 text-base">{m.estimatedQuantityGrams}g</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <input
                                                            type="number"
                                                            value={m.editableRate}
                                                            onChange={(e) => handleRateChange(idx, e.target.value)}
                                                            className="w-32 p-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-right font-medium transition-all hover:border-indigo-300 bg-white"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-green-600 text-lg">
                                                            ₹{(m.estimatedQuantityGrams * (m.editableRate || 0)).toFixed(2)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                                            <tr>
                                                <td colSpan={4} className="px-6 py-5 text-right font-bold uppercase tracking-widest text-base">
                                                    💰 Grand Total:
                                                </td>
                                                <td className="px-6 py-5 text-right font-bold text-2xl">
                                                    ₹{grandTotal.toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Actions Panel (Sticky on large screens) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4 animate-slideInRight">

                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                        </div>
                        
                        {/* Material Analysis Card - Collapsible, Closed by Default */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsActionsOpen(!isActionsOpen)}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">AI</span>
                                    </div>
                                    <h4 className="font-bold text-indigo-900">Material Analysis</h4>
                                </div>
                                <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                    <svg 
                                        className={`w-5 h-5 text-indigo-600 transition-transform duration-300 ${isActionsOpen ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className={`transition-all duration-300 overflow-hidden ${isActionsOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 pb-5">
                            <p className="text-xs text-indigo-700 mb-4 font-medium">Calculate value based on device condition</p>
                            
                            <div className="space-y-3">
                                {/* Condition Override */}
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1">
                                        <span>🔍</span>
                                        Device Condition
                                        <span className="text-indigo-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={analysisCondition} 
                                            onChange={e => setAnalysisCondition(e.target.value)} 
                                            className="w-full p-3 text-sm border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer font-medium transition-all hover:border-indigo-300"
                                        >
                                            <option value="EXCELLENT">⭐ EXCELLENT - Pristine/Working</option>
                                            <option value="GOOD">✓ GOOD - Fair/Minor Issues</option>
                                            <option value="FAIR">~ FAIR - Broken/Damaged</option>
                                            <option value="POOR">✗ POOR - Scrap/Parts</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-white rounded-lg border border-indigo-200">
                                        <p className="text-[10px] font-semibold text-indigo-700">
                                            {analysisCondition === "EXCELLENT" && "💎 65% recycling, 70% buyback"}
                                            {analysisCondition === "GOOD" && "✓ 55% recycling, 55% buyback"}
                                            {analysisCondition === "FAIR" && "⚠️ 45% recycling, 35% buyback"}
                                            {analysisCondition === "POOR" && "♻️ 30% recycling, no buyback"}
                                        </p>
                                    </div>
                                </div>

                                {/* Condition Notes */}
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1">
                                        <span>📝</span>
                                        Condition Notes
                                    </label>
                                    <textarea
                                        value={analysisNotes}
                                        onChange={e => setAnalysisNotes(e.target.value)}
                                        placeholder="e.g., Minor scratches, battery 85%, screen perfect"
                                        className="w-full p-3 text-xs border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all hover:border-indigo-300"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    onClick={handleAnalyzeMaterials}
                                    disabled={analyzingMaterials}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {analyzingMaterials ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : "🔬 Analyze Device"}
                                </button>
                            </div>
                            </div>
                            </div>
                        </div>

                        {needsApproval && (
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsApproveOpen(!isApproveOpen)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                        <h4 className="font-bold text-yellow-900">Approve Request</h4>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                        <svg 
                                            className={`w-5 h-5 text-yellow-600 transition-transform duration-300 ${isApproveOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isApproveOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-700 block mb-2">Final Amount</span>
                                        <div className="p-3 border-2 border-yellow-300 rounded-lg bg-white font-bold text-green-700 text-center text-lg shadow-inner">
                                            ₹{grandTotal.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Adjustment Reason</label>
                                        <input 
                                            type="text" 
                                            placeholder="Optional reason for adjustment" 
                                            value={adjustmentReason} 
                                            onChange={e => setAdjustmentReason(e.target.value)} 
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all" 
                                        />
                                    </div>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 font-bold shadow-md hover:shadow-lg text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {actionLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : `✓ Approve ₹${grandTotal.toFixed(2)}`}
                                    </button>
                                </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {needsDriver && (
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsAssignDriverOpen(!isAssignDriverOpen)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                        <h4 className="font-bold text-blue-900">Assign Driver</h4>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                        <svg 
                                            className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${isAssignDriverOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isAssignDriverOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5">
                                        <p className="text-xs text-blue-700 mb-3 font-medium">Trigger pickup workflow</p>
                                        <div className="space-y-3">
                                    <div className="relative">
                                        <select 
                                            value={selectedDriverId} 
                                            onChange={e => setSelectedDriverId(e.target.value)} 
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="">🚗 Choose Driver</option>
                                            {drivers.map(d => (
                                                <option key={d.id} value={d.id}>👤 {d.name} ({d.vehicleType})</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Driver Instructions/Comments */}
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-700 mb-1.5">
                                            📝 Special Instructions for Driver (Optional)
                                        </label>
                                        <textarea
                                            value={driverComments}
                                            onChange={e => setDriverComments(e.target.value)}
                                            placeholder="e.g., Call customer 30 minutes before arrival. Building has parking restrictions. Handle with care - screen is cracked."
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">These instructions will be sent to the driver via email</p>
                                    </div>
                                    
                                    <button
                                        onClick={handleAssignDriver}
                                        disabled={actionLoading}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-bold shadow-md hover:shadow-lg text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {actionLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Assigning...
                                            </span>
                                        ) : "🚚 Assign Driver"}
                                    </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {canMarkAsDropped && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsMarkDroppedOpen(!isMarkDroppedOpen)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                        <h4 className="font-bold text-indigo-900">Receive Drop-off</h4>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                        <svg 
                                            className={`w-5 h-5 text-indigo-600 transition-transform duration-300 ${isMarkDroppedOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isMarkDroppedOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5">
                                <p className="text-xs text-indigo-700 mb-3 font-medium">Mark as received at facility</p>
                                <button
                                    onClick={handleMarkAsDropped}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-bold shadow-md hover:shadow-lg text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {actionLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : "📦 Mark Received"}
                                </button>
                                </div>
                                </div>
                            </div>
                        )}

                        {canVerifyDropOff && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsVerifyDropOffOpen(!isVerifyDropOffOpen)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                        <h4 className="font-bold text-purple-900">Verify Drop-off</h4>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                        <svg 
                                            className={`w-5 h-5 text-purple-600 transition-transform duration-300 ${isVerifyDropOffOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isVerifyDropOffOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5">
                                <p className="text-xs text-purple-700 mb-3 font-medium">Verify dropped content</p>
                                <button
                                    onClick={handleVerifyDropOff}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold shadow-md hover:shadow-lg text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {actionLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : "✓ Verify Drop-off"}
                                </button>
                                </div>
                                </div>
                            </div>
                        )}

                        {needsConditionVerification && (
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsVerifyConditionOpen(!isVerifyConditionOpen)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                                        <h4 className="font-bold text-orange-900">Verify Condition</h4>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                        <svg 
                                            className={`w-5 h-5 text-orange-600 transition-transform duration-300 ${isVerifyConditionOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isVerifyConditionOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Device Condition</label>
                                        <div className="relative">
                                            <select 
                                                value={conditionCode} 
                                                onChange={e => setConditionCode(e.target.value)} 
                                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all cursor-pointer bg-white"
                                            >
                                                <option value="FLAWLESS">⭐ Flawless</option>
                                                <option value="GOOD">✓ Good</option>
                                                <option value="FAIR">~ Fair</option>
                                                <option value="POOR">✗ Poor</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Verification Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-orange-700 mb-1.5">
                                            📝 Verification Notes
                                        </label>
                                        <textarea
                                            value={verificationNotes}
                                            onChange={e => setVerificationNotes(e.target.value)}
                                            placeholder="e.g., Device in excellent condition. All accessories included. Battery health at 85%. Minor scratches on back panel."
                                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    
                                    {/* Final Amount */}
                                    <div>
                                        <label className="block text-xs font-semibold text-orange-700 mb-1.5">
                                            💰 Final Amount (Optional)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={finalAmount}
                                                onChange={e => setFinalAmount(e.target.value)}
                                                placeholder="Enter final amount"
                                                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Leave empty to use estimated amount. This will be the final payment.</p>
                                    </div>
                                    
                                    <button
                                        onClick={handleVerifyCondition}
                                        disabled={actionLoading}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 font-bold shadow-md hover:shadow-lg text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {actionLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : "✓ Verify Condition"}
                                    </button>
                                </div>
                                </div>
                                </div>
                            </div>
                        )}

                        {canRecycle && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
                                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setIsMarkRecycledOpen(!isMarkRecycledOpen)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                                        <h4 className="font-bold text-green-900">Complete Recycling</h4>
                                    </div>
                                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                        <svg 
                                            className={`w-5 h-5 text-green-600 transition-transform duration-300 ${isMarkRecycledOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 overflow-hidden ${isMarkRecycledOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5">
                                <p className="text-xs text-green-700 mb-3 font-medium">Credit points to user</p>
                                <button
                                    onClick={handleMarkRecycled}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold shadow-md hover:shadow-lg text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {actionLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : "♻️ Mark Recycled"}
                                </button>
                                </div>
                                </div>
                            </div>
                        )}

                        {!needsApproval && !needsDriver && !canMarkAsDropped && !canVerifyDropOff && !needsConditionVerification && !canRecycle && (
                            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-gray-500 italic text-sm border border-gray-200">
                                <div className="text-3xl mb-2">✓</div>
                                <div>No actions available</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
