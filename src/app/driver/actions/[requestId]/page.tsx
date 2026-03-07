"use client";

import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function DriverActionPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const requestId = params.requestId as string;
    const token = searchParams.get("token") || "mock-token-123";

    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const handlePickupDone = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/recycle-requests/driver-action/${requestId}/pickup-done?token=${token}`);
            if (!res.ok) throw new Error("Failed to mark pickup as done");

            setStatusMessage("Pickup successfully marked as complete!");
        } catch (error: any) {
            setStatusMessage("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePickupFailed = async () => {
        if (!reason) {
            alert("Please enter a reason.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/recycle-requests/driver-action/${requestId}/pickup-failed`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Failed to report pickup failure");

            setStatusMessage("Pickup failure reported.");
        } catch (error: any) {
            setStatusMessage("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Driver Action</h1>
                    <p className="text-gray-500 mt-2">Request ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{requestId?.split('-')[0]}</span></p>
                </div>

                {statusMessage ? (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center font-medium">
                        {statusMessage}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <button
                            onClick={handlePickupDone}
                            disabled={loading}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Pickup Successful"}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-sm text-gray-500 font-medium">OR</span>
                            </div>
                        </div>

                        <div className="space-y-3 bg-red-50 p-4 rounded-xl border border-red-100">
                            <label className="block text-sm font-semibold text-red-900">Report Failure</label>
                            <input
                                type="text"
                                placeholder="Why did the pickup fail?"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            />
                            <button
                                onClick={handlePickupFailed}
                                disabled={loading}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-md shadow-red-500/20 transition-all disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Report Failure"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
