"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Request, RecycleRequestApiResponse, mapApiResponseToRequest } from "./types";
import { downloadReceipt } from "./receiptForm";
import { recycleRequestApi } from "@/lib/admin-api";
import { getUserID } from "@/app/citizen/sign-in/auth";
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
    MdCheck
} from "react-icons/md";

const MyRequestsList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        const userId = getUserID();
        if (!userId) {
            setError("Could not determine user ID. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await recycleRequestApi.getByUserId(userId);
            const apiData: RecycleRequestApiResponse[] = response.data;
            const mapped = Array.isArray(apiData) ? apiData.map(mapApiResponseToRequest) : [];
            setRequests(mapped);
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
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

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
            pending: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", label: "Pending Setup" },
            confirmed: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500", label: "Confirmed" },
            "in-progress": { bg: "bg-indigo-100", text: "text-indigo-800", dot: "bg-indigo-500", label: "In Progress" },
            completed: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: "Completed" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Cancelled" },
        };

        const config = statusConfig[status] ?? statusConfig["pending"];
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase ${config.bg} ${config.text}`}>
                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };
    const getProgressSteps = (request: Request) => {
        const isDropOff = request.fulfillmentType === "DROP_OFF";
        const status = request.status;
        const fs = (request.fulfillmentStatus || "").toUpperCase();

        let steps: { id: string; label: string }[] = [];
        let activeIndex = 0;

        if (isDropOff) {
            steps = [
                { id: "created", label: "Created" },
                { id: "drop-pending", label: "Pending" },
                { id: "dropped-off", label: "Dropped" },
                { id: "approved", label: "Approved" },
                { id: "verified", label: "Verified" },
                { id: "recycled", label: "Recycled" }
            ];

            if (status === "cancelled") activeIndex = -1;
            else if (fs === "RECYCLED") activeIndex = 5;
            else if (fs === "DROP_VERIFIED" || fs === "VERIFIED") activeIndex = 4;
            else if (fs === "APPROVED") activeIndex = 3;
            else if (fs === "DROPPED_AT_FACILITY") activeIndex = 2;
            else if (fs === "DROP_PENDING") activeIndex = 1;
            else {
                // Fallbacks using 'status'
                if (status === "completed") activeIndex = 5;
                else if (status === "confirmed") activeIndex = 3; // roughly matches Approved
                else if (status === "in-progress") activeIndex = 2;
                else activeIndex = 0;
            }
        } else {
            // PICKUP flow
            steps = [
                { id: "created", label: "Created" },
                { id: "approved", label: "Approved" },
                { id: "in-transit", label: "Transit" },
                { id: "picked-up", label: "Picked Up" },
                { id: "dropped", label: "Dropped" },
                { id: "verified", label: "Verified" },
                { id: "recycled", label: "Recycled" }
            ];

            if (status === "cancelled") activeIndex = -1;
            else if (fs === "RECYCLED") activeIndex = 6;
            else if (fs === "VERIFIED" || fs === "DROP_VERIFIED") activeIndex = 5;
            else if (fs === "DROPPED_AT_FACILITY") activeIndex = 4;
            else if (fs === "PICKUP_COMPLETED") activeIndex = 3;
            else if (fs === "PICKUP_IN_PROGRESS") activeIndex = 2;
            else if (fs === "PICKUP_ASSIGNED" || fs === "PICKUP_SCHEDULED" || fs === "APPROVED") activeIndex = 1;
            else {
                // Fallbacks using 'status'
                if (status === "completed") activeIndex = 6;
                else if (status === "confirmed") activeIndex = 1;
                else if (status === "in-progress") activeIndex = 2;
                else activeIndex = 0;
            }
        }

        return { steps, activeIndex };
    };

    const handleCancelRequest = (requestId: string) => {
        if (confirm(`Are you sure you want to cancel request ${requestId}?`)) {
            // Note: In real app, make API call here.
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId ? { ...r, status: "cancelled" as const } : r
                )
            );
            alert(`Request ${requestId} has been cancelled successfully.`);
        }
    };

    const handleReceiptRequest = (requestId: string) => {
        const request = requests.find((r) => r.id === requestId);
        if (request) {
            downloadReceipt(request);
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
        inProgress: requests.filter((r) => r.status === "in-progress").length,
        completed: requests.filter((r) => r.status === "completed").length,
    };

    // ——— Loading skeleton ———
    if (loading) {
        return (
            <div className="w-full flex flex-col gap-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="h-10 bg-gray-200 rounded w-64 mb-3 animate-pulse" />
                        <div className="h-5 bg-gray-200 rounded w-96 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
                            <div className="h-8 bg-gray-200 rounded w-1/3" />
                        </div>
                    ))}
                </div>
                <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse h-64" />
                    ))}
                </div>
            </div>
        );
    }

    // ——— Error state ———
    if (error) {
        return (
            <div className="w-full flex flex-col gap-8 pb-12">
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-16 text-center">
                    <MdDevicesOther className="text-7xl text-red-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
                    <button
                        onClick={fetchRequests}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-md shadow-green-600/20 transition-all hover:-translate-y-0.5"
                    >
                        <MdRefresh className="text-xl" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8 pb-12">
            {/* Header section with Stats superimposed */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Recycling Hub</h1>
                        <p className="text-lg text-gray-500">Track and manage your sustainability journey</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchRequests}
                            title="Refresh"
                            className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white hover:border-gray-300 shadow-sm transition-all"
                        >
                            <MdRefresh className="text-xl" />
                        </button>
                        <Link
                            href="/citizen/book-recycle/new"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
                        >
                            <MdAddCircle className="text-xl" />
                            New Request
                        </Link>
                    </div>
                </div>

                {/* Modern Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-green-50/50 transition-colors"></div>
                        <p className="text-gray-500 text-sm font-medium mb-2 relative z-10">Total Requests</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <p className="text-4xl font-extrabold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50/50 rounded-full group-hover:bg-amber-100/50 transition-colors"></div>
                        <p className="text-gray-500 text-sm font-medium mb-2 relative z-10">Pending</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <p className="text-4xl font-extrabold text-amber-500">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50/50 rounded-full group-hover:bg-indigo-100/50 transition-colors"></div>
                        <p className="text-gray-500 text-sm font-medium mb-2 relative z-10">In Transit</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <p className="text-4xl font-extrabold text-indigo-500">{stats.inProgress}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50/50 rounded-full group-hover:bg-emerald-100/50 transition-colors"></div>
                        <p className="text-gray-500 text-sm font-medium mb-2 relative z-10">Completed</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <p className="text-4xl font-extrabold text-emerald-500">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                        type="text"
                        placeholder="Search by ID, category, brand, or model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all text-gray-900 placeholder-gray-400 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 px-2 md:px-0">
                    <div className="w-px h-8 bg-gray-100 hidden md:block mx-1"></div>
                    <MdFilterList className="text-gray-400 text-xl ml-2 hidden md:block" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-48 px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Setup</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Transit</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Requests Feed */}
            <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdDevicesOther className="text-5xl text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching requests</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            {searchQuery || filterStatus !== "all"
                                ? "We couldn't find any requests matching your filters. Try clearing them."
                                : "You haven't initiated any recycling requests yet. Start your journey today!"}
                        </p>
                        {!searchQuery && filterStatus === "all" && (
                            <Link
                                href="/citizen/book-recycle/new"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
                            >
                                <MdAddCircle className="text-xl" />
                                Create First Request
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredRequests.map((request) => {
                        const { steps, activeIndex } = getProgressSteps(request);
                        const isCancelled = request.status === "cancelled";

                        return (
                            <div
                                key={request.id}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300"
                            >
                                {/* Card Header */}
                                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                            {getDeviceIcon(request.deviceType, "text-3xl")}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {request.deviceBrand} {request.deviceModel}
                                                </h3>
                                            </div>
                                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                <span>{request.categoryName}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="truncate max-w-[150px]" title={request.id}>ID: ...{request.id.slice(-8)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(request.status)}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 md:p-8">
                                    {/* Timeline Stepper (Skip if cancelled) */}
                                    {!isCancelled ? (
                                        <div className="mb-10 w-full">
                                            <div className="flex w-full">
                                                {steps.map((step, idx) => {
                                                    const isCompleted = idx <= activeIndex;
                                                    const isCurrent = idx === activeIndex;
                                                    const isLineActive = idx < activeIndex; // if activeIndex is further ahead, color the line!

                                                    return (
                                                        <div key={step.id} className="flex-1 relative flex flex-col items-center">
                                                            {/* Segment Line (center to center) */}
                                                            {idx < steps.length - 1 && (
                                                                <div className="absolute top-4 left-1/2 w-full h-1 bg-gray-100 z-0 -translate-y-1/2">
                                                                    <div
                                                                        className={`h-full transition-all duration-500 ease-in-out ${isLineActive ? "w-full bg-green-500" : "w-0 bg-green-500"}`}
                                                                    ></div>
                                                                </div>
                                                            )}

                                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isCurrent ? "bg-green-600 text-white ring-4 ring-green-100" :
                                                                isCompleted ? "bg-green-500 text-white" : "bg-white border-2 border-gray-200 text-gray-400"
                                                                }`}>
                                                                {isCompleted ? <MdCheck /> : idx + 1}
                                                            </div>
                                                            <span className={`mt-2 text-xs font-semibold uppercase tracking-wider hidden sm:block text-center ${isCurrent ? "text-green-700" :
                                                                isCompleted ? "text-gray-900" : "text-gray-400"
                                                                }`}>{step.label}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                            <MdCancel className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-red-900">Request Cancelled</h4>
                                                <p className="text-sm text-red-700 mt-1">This request was cancelled and will not be processed. You can create a new request if needed.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                        {/* Column 1: Device Specifics */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-2">Device Details</h4>

                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Condition</p>
                                                <p className="font-semibold text-gray-900 capitalize">{request.deviceCondition.replace(/-/g, " ")}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Quantity Provided</p>
                                                <p className="font-semibold text-gray-900">{request.quantity} Unit(s)</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Creation Date</p>
                                                <p className="font-semibold text-gray-900">{request.requestDate}</p>
                                            </div>
                                        </div>

                                        {/* Column 2: Logistics */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-2">Logistics</h4>

                                            {request.fulfillmentStatusDisplay && (
                                                <div className="flex items-start gap-3">
                                                    <MdLocalShipping className="text-gray-400 text-lg mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Current Status</p>
                                                        <p className="font-semibold text-gray-900">{request.fulfillmentStatusDisplay}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {request.pickupDate && (
                                                <div className="flex items-start gap-3">
                                                    <MdDateRange className="text-gray-400 text-lg mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Scheduled Date</p>
                                                        <p className="font-semibold text-gray-900">{request.pickupDate}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {request.address && (
                                                <div className="flex items-start gap-3">
                                                    <MdLocationOn className="text-gray-400 text-lg mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Location</p>
                                                        <p className="font-medium text-gray-900 text-sm leading-relaxed">
                                                            {request.address}
                                                            {request.city && <><br />{request.city}</>}
                                                            {request.zipCode && `, ${request.zipCode}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Column 3: Rewards */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-2">Reward Value</h4>

                                            {request.estimatedValue && (
                                                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                                    <p className="text-sm text-green-700 font-medium mb-1">Estimated Points</p>
                                                    <div className="flex items-center gap-2">
                                                        <MdOutlineAccountBalanceWallet className="text-green-500 text-xl" />
                                                        <p className="text-2xl font-bold text-green-700">{request.estimatedValue}</p>
                                                    </div>
                                                    <p className="text-xs text-green-600/70 mt-2 leading-tight">Subject to final condition verification at center.</p>
                                                </div>
                                            )}

                                            {request.finalPoints != null && (
                                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                                    <p className="text-sm text-emerald-800 font-bold mb-1 flex items-center gap-1">
                                                        <MdCheckCircle className="text-emerald-600" />
                                                        Final Credited Points
                                                    </p>
                                                    <p className="text-2xl font-black text-emerald-700">{request.finalPoints} <span className="text-base font-bold text-emerald-600/80">pts</span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                {(request.status === "pending" || request.status === "completed") && (
                                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                                        {request.status === "pending" && (
                                            <button
                                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-all text-sm shadow-sm"
                                                onClick={() => handleCancelRequest(request.id)}
                                            >
                                                <MdCancel className="text-lg" />
                                                Cancel Request
                                            </button>
                                        )}
                                        {request.status === "completed" && (
                                            <button
                                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 border border-transparent text-white rounded-xl font-medium hover:bg-green-700 transition-all text-sm shadow-md shadow-green-600/20"
                                                onClick={() => handleReceiptRequest(request.id)}
                                            >
                                                <MdDownload className="text-lg" />
                                                Download Official Receipt
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyRequestsList;
