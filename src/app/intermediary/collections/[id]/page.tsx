"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { intermediaryApi } from "@/lib/intermediary-api";
import { analyzeDeviceMaterials } from "@/lib/image-analyzer-api";

export default function CollectionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");

    const [adjustedPoints, setAdjustedPoints] = useState<number>(0);
    const [adjustmentReason, setAdjustmentReason] = useState<string>("");

    const [conditionCode, setConditionCode] = useState<string>("GOOD");

    const [analyzingMaterials, setAnalyzingMaterials] = useState<boolean>(false);
    const [materialsData, setMaterialsData] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.id) return;
            try {
                setLoading(true);
                const data = await intermediaryApi.requests.getById(params.id as string);
                setRequest(data);
                setAdjustedPoints(data.estimatedPoints || 0);

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

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.approve(params.id as string, {
                adjustedEstimatedPoints: adjustedPoints,
                adjustmentReason: adjustmentReason || "Standard Approval"
            });
            alert("Request approved successfully.");
            window.location.reload();
        } catch (error) {
            alert("Failed to approve. Check console.");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignDriver = async () => {
        if (!selectedDriverId) {
            alert("Please select a driver first.");
            return;
        }
        try {
            setActionLoading(true);
            await intermediaryApi.requests.assignDriver(params.id as string, selectedDriverId);
            alert("Driver assigned successfully! An email has been sent.");
            window.location.reload();
        } catch (error) {
            alert("Failed to assign driver. Check console.");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyDropOff = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.verifyDropOff(params.id as string);
            alert("Verified Drop-off successfully.");
            window.location.reload();
        } catch (error) {
            alert("Failed to verify drop-off. Check console.");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyCondition = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.verifyCondition(params.id as string, conditionCode, "Condition verified on receipt.");
            alert("Condition verified successfully.");
            window.location.reload();
        } catch (error) {
            alert("Failed to verify condition. Check console.");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkRecycled = async () => {
        try {
            setActionLoading(true);
            await intermediaryApi.requests.markRecycled(params.id as string);
            alert("Marked as Recycled!");
            window.location.reload();
        } catch (error) {
            alert("Failed. Check console.");
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
                country: "US"
            };
            const res = await analyzeDeviceMaterials(payload);
            if (res.success && res.data) {
                setMaterialsData(res.data);
                // Calculate estimated raw value:
                let totalMarketValue = 0;
                res.data.materials.forEach(m => {
                    totalMarketValue += (m.estimatedQuantityGrams * m.marketRatePerGram);
                });

                // Set suggested points (roughly calculated as value * 10 for demo)
                const suggested = Math.round(totalMarketValue * 10);
                if (suggested > 0) {
                    setAdjustedPoints(suggested);
                }
            } else {
                alert("Failed to analyze materials.");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            alert("Error running material analysis.");
        } finally {
            setAnalyzingMaterials(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-eco-600">Loading collection details...</div>;
    if (!request) return <div className="p-8 text-center text-red-600">Failed to load request.</div>;

    const needsApproval = request.status === "PENDING" || request.status === "REQUESTED";
    const needsDriver = request.fulfillmentType === "PICKUP" && !request.assignedDriverId && request.status !== "CANCELLED" && request.status !== "COMPLETED" && request.status !== "PENDING" && request.status !== "REQUESTED";
    const needsDropVerification = request.fulfillmentType === "DROP_OFF" && request.fulfillmentStatus === "PENDING_DROP" && request.status === "APPROVED";
    const needsConditionVerification = (request.fulfillmentStatus === "PICKUP_COMPLETED" || request.fulfillmentStatus === "DROP_VERIFIED") && request.status !== "VERIFIED" && request.status !== "RECYCLED";
    const canRecycle = request.status === "VERIFIED";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-eco-900">Request #{request.id.split('-')[0].toUpperCase()}</h1>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                    Back to List
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">

                {/* Status Header */}
                <div className="flex gap-4 items-center p-4 bg-eco-50 rounded-xl border border-eco-100">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-eco-700">Overall Status</span>
                        <span className="text-xl font-bold text-eco-900">{request.status}</span>
                    </div>
                    <div className="h-10 w-px bg-eco-200 mx-4"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-eco-700">Fulfillment Status</span>
                        <span className={"text-xl font-bold " + (request.fulfillmentStatus === "COMPLETED" ? "text-green-600" : "text-amber-600")}>
                            {request.fulfillmentStatus}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Details Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Device & Points</h3>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Device Model</span>
                            <span className="font-medium">{request.deviceModelName || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Category</span>
                            <span className="font-medium">{request.categoryName} ({request.brandName})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Condition</span>
                            <span className="font-medium">{request.conditionCode}</span>
                        </div>
                        <div className="flex justify-between bg-eco-50 p-2 rounded-lg mt-2 font-bold">
                            <span className="text-eco-700">Estimated Points</span>
                            <span className="text-eco-900">{request.estimatedPoints} pts</span>
                        </div>
                        <div className="flex justify-between bg-green-50 p-2 rounded-lg font-bold">
                            <span className="text-green-700">Final Points (Credited)</span>
                            <span className="text-green-900">{request.finalPoints || 0} pts</span>
                        </div>
                    </div>

                    {/* Logistics Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Logistics</h3>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Fulfillment Type</span>
                            <span className="font-medium">{request.fulfillmentType}</span>
                        </div>
                        {request.fulfillmentType === "PICKUP" ? (
                            <>
                                <div>
                                    <span className="text-gray-500 block mb-1">Pickup Address</span>
                                    <span className="font-medium block text-sm">
                                        {request.pickupAddress}, {request.pickupCity}, {request.pickupState} {request.pickupPincode}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Assigned Driver ID</span>
                                    <span className="font-medium">{request.assignedDriverId ? request.assignedDriverId.split('-')[0] : "Not Assigned"}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500">Facility</span>
                                <span className="font-medium">{request.facilityName}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Created At</span>
                            <span className="font-medium">{new Date(request.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Panel */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-6">
                    <h3 className="text-xl font-bold text-gray-900">Actions</h3>

                    {/* ALWAYS show the new Analysis Tool for the facility */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-indigo-800">Advanced Material Analysis (AI)</h4>
                                <p className="text-sm text-indigo-700">Calculate precious materials and raw value based on make, model, and category.</p>
                            </div>
                            <button
                                onClick={handleAnalyzeMaterials}
                                disabled={analyzingMaterials}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold shadow-sm transition"
                            >
                                {analyzingMaterials ? "Analyzing..." : "Analyze Device Value"}
                            </button>
                        </div>

                        {materialsData && (
                            <div className="mt-4 bg-white/60 p-4 rounded-lg border border-indigo-100 space-y-3">
                                <p className="text-sm text-gray-800 font-medium">📋 {materialsData.analysisDescription}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {materialsData.materials.map((m: any, idx: number) => (
                                        <div key={idx} className="bg-white p-3 rounded shadow-sm border border-gray-100 flex flex-col gap-1 relative overflow-hidden">
                                            {m.isPrecious && (
                                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-bl font-bold">PRECIOUS</div>
                                            )}
                                            <span className="font-bold text-gray-800">{m.materialName}</span>
                                            <span className="text-xs text-gray-500">Found in: {m.foundIn}</span>
                                            <div className="flex justify-between items-end mt-2">
                                                <span className="text-sm font-medium text-gray-700">{m.estimatedQuantityGrams}g</span>
                                                <span className="text-sm font-bold text-green-600">${(m.estimatedQuantityGrams * m.marketRatePerGram).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {needsApproval && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-yellow-800">1. Approve Request</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Adjusted Points (Optional)
                                    <input type="number" value={adjustedPoints} onChange={e => setAdjustedPoints(Number(e.target.value))} className="p-2 border rounded-md" />
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Reason for Adjustment
                                    <input type="text" placeholder="e.g. Screen more damaged than reported" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} className="p-2 border rounded-md" />
                                </label>
                            </div>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold shadow-sm w-fit"
                            >
                                {actionLoading ? "Processing..." : "Approve Request"}
                            </button>
                        </div>
                    )}

                    {needsDriver && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-blue-800">2. Assign Driver</h4>
                            <p className="text-sm text-blue-600">Assign a driver to trigger the pickup workflow and send them the pickup links.</p>
                            <div className="flex gap-4 items-end">
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 w-64">
                                    Select Driver
                                    <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="p-2 border rounded-md bg-white">
                                        <option value="">-- Choose Driver --</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    onClick={handleAssignDriver}
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm h-10"
                                >
                                    {actionLoading ? "Assigning..." : "Assign Driver"}
                                </button>
                            </div>
                        </div>
                    )}

                    {needsDropVerification && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-purple-800">Verify Drop-off</h4>
                            <p className="text-sm text-purple-700">Citizen has dropped off the product at the facility.</p>
                            <button
                                onClick={handleVerifyDropOff}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-sm w-fit mt-2"
                            >
                                {actionLoading ? "Processing..." : "Mark as Drop-off Verified"}
                            </button>
                        </div>
                    )}

                    {needsConditionVerification && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-orange-800">Verify Device Condition</h4>
                            <p className="text-sm text-orange-700">The product has been received at the facility. Verify the final condition to finalize the points before crediting.</p>
                            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 w-64">
                                Condition Assessed:
                                <select value={conditionCode} onChange={e => setConditionCode(e.target.value)} className="p-2 border rounded-md">
                                    <option value="FLAWLESS">Flawless</option>
                                    <option value="GOOD">Good</option>
                                    <option value="FAIR">Fair</option>
                                    <option value="POOR">Poor</option>
                                </select>
                            </label>
                            <button
                                onClick={handleVerifyCondition}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold shadow-sm w-fit mt-2"
                            >
                                {actionLoading ? "Processing..." : "Verify Final Condition"}
                            </button>
                        </div>
                    )}

                    {canRecycle && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-green-800">Final Step: Complete Recycling</h4>
                            <p className="text-sm text-green-700">Mark this item as completely recycled. This will permanently credit the points to the user's wallet!</p>
                            <button
                                onClick={handleMarkRecycled}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm w-fit mt-2"
                            >
                                {actionLoading ? "Processing..." : "Mark as Recycled & Credit User"}
                            </button>
                        </div>
                    )}

                    {!needsApproval && !needsDriver && !needsDropVerification && !needsConditionVerification && !canRecycle && (
                        <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 italic">
                            No immediate actions available for this status.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
