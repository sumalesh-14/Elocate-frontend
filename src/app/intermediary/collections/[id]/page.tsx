"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { intermediaryApi } from "@/lib/intermediary-api";
import { analyzeDeviceMaterials } from "@/lib/image-analyzer-api";
import { useToast } from "@/context/ToastContext";

export default function CollectionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");


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
            await intermediaryApi.requests.assignDriver(params.id as string, selectedDriverId);
            showToast("Success\nDriver assigned successfully! Email sent.", "success");
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
            await intermediaryApi.requests.verifyCondition(params.id as string, conditionCode, "Condition verified on receipt.");
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
                country: "IN"
            };
            const res = await analyzeDeviceMaterials(payload);
            if (res.success && res.data) {
                const materialsWithRates = res.data.materials.map((m: any) => ({
                    ...m,
                    editableRate: m.marketRatePerGram
                }));
                res.data.materials = materialsWithRates;
                setMaterialsData(res.data);
                showToast("Analysis Complete\nMaterial composition data updated.", "success");
            } else {
                showToast("Analysis Failed\nCould not fetch material data.", "error");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            showToast("System Error\nError running material analysis.", "error");
        } finally {
            setAnalyzingMaterials(false);
        }
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
                            <span className="text-eco-700">Estimated Amount</span>
                            <span className="text-eco-900">₹{request.estimatedAmount}</span>
                        </div>
                        <div className="flex justify-between bg-green-50 p-2 rounded-lg font-bold">
                            <span className="text-green-700">Final Amount (Credited)</span>
                            <span className="text-green-900">₹{request.finalAmount || 0}</span>
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
                                <p className="text-sm text-gray-800 font-medium mb-4">📋 {materialsData.analysisDescription}</p>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Metal Name</th>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Found In</th>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Estimated Grams</th>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Market Rate (₹/g)</th>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {materialsData.materials.map((m: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-800">{m.materialName}</span>
                                                            {m.isPrecious && (
                                                                <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold border border-yellow-200">PRECIOUS</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={m.foundIn}>{m.foundIn}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{m.estimatedQuantityGrams}g</td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={m.editableRate}
                                                            onChange={(e) => handleRateChange(idx, e.target.value)}
                                                            className="w-24 p-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-green-600">
                                                        ₹{(m.estimatedQuantityGrams * (m.editableRate || 0)).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-800 uppercase tracking-widest text-sm">Grand Total (Value):</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">₹{grandTotal.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {needsApproval && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-yellow-800">1. Approve Request</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-700">Estimated Final Amount (Value)</span>
                                    <div className="p-2 border rounded-md bg-gray-100 font-bold text-green-700">₹{grandTotal.toFixed(2)}</div>
                                </div>
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Reason for Adjustment
                                    <input type="text" placeholder="e.g. Added premium for clean screen" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} className="p-2 border rounded-md" />
                                </label>
                            </div>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold shadow-sm w-fit"
                            >
                                {actionLoading ? "Processing..." : "Approve with " + "₹" + grandTotal.toFixed(2)}
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

                    {canMarkAsDropped && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-indigo-800">2. Receive Drop-off</h4>
                            <p className="text-sm text-indigo-700">Citizen is at the facility with the product. Mark it as received to proceed.</p>
                            <button
                                onClick={handleMarkAsDropped}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm w-fit mt-2"
                            >
                                {actionLoading ? "Processing..." : "Mark as Received at Facility"}
                            </button>
                        </div>
                    )}

                    {canVerifyDropOff && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col gap-4">
                            <h4 className="font-semibold text-purple-800">3. Verify Drop-off</h4>
                            <p className="text-sm text-purple-700">The product has been dropped at your facility. Verify it to proceed with condition assessment.</p>
                            <button
                                onClick={handleVerifyDropOff}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-sm w-fit mt-2"
                            >
                                {actionLoading ? "Processing..." : "Verify Drop-off Content"}
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

                    {!needsApproval && !needsDriver && !canMarkAsDropped && !canVerifyDropOff && !needsConditionVerification && !canRecycle && (
                        <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 italic">
                            No immediate actions available for this status.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
