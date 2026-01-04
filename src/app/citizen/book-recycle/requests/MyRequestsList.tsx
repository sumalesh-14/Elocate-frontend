"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardSidebar from "../../Components/DashboardSidebar";
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
    MdVisibility,
    MdCancel,
    MdAddCircle,
    MdDownload,
} from "react-icons/md";

// TypeScript Interfaces
interface Request {
    id: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    deviceCondition: string;
    quantity: number;
    status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
    pickupDate: string;
    pickupTime: string;
    address: string;
    city: string;
    zipCode: string;
    phoneNumber: string;
    requestDate: string;
    estimatedValue?: string;
}

const MyRequestsList = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Sample data - TODO: Replace with API call
    const requests: Request[] = [
        {
            id: "REQ-8821",
            deviceType: "laptop",
            deviceBrand: "Apple",
            deviceModel: 'MacBook Pro 15"',
            deviceCondition: "working",
            quantity: 1,
            status: "completed",
            pickupDate: "2026-10-24",
            pickupTime: "09:00 AM - 11:00 AM",
            address: "123 Green Valley Rd, Tech Park",
            city: "San Francisco",
            zipCode: "94103",
            phoneNumber: "+1 (555) 123-4567",
            requestDate: "2026-10-20",
            estimatedValue: "$450",
        },
        {
            id: "REQ-8822",
            deviceType: "smartphone",
            deviceBrand: "Apple",
            deviceModel: "iPhone 11",
            deviceCondition: "broken",
            quantity: 1,
            status: "in-progress",
            pickupDate: "2026-11-02",
            pickupTime: "11:00 AM - 01:00 PM",
            address: "123 Green Valley Rd, Tech Park",
            city: "San Francisco",
            zipCode: "94103",
            phoneNumber: "+1 (555) 123-4567",
            requestDate: "2026-10-28",
            estimatedValue: "$120",
        },
        {
            id: "REQ-8819",
            deviceType: "printer",
            deviceBrand: "Canon",
            deviceModel: "PIXMA MG3620",
            deviceCondition: "minor-issues",
            quantity: 1,
            status: "cancelled",
            pickupDate: "2026-10-15",
            pickupTime: "03:00 PM - 05:00 PM",
            address: "123 Green Valley Rd, Tech Park",
            city: "San Francisco",
            zipCode: "94103",
            phoneNumber: "+1 (555) 123-4567",
            requestDate: "2026-10-10",
        },
        {
            id: "REQ-8823",
            deviceType: "tv",
            deviceBrand: "Samsung",
            deviceModel: "55\" QLED 4K",
            deviceCondition: "working",
            quantity: 1,
            status: "confirmed",
            pickupDate: "2026-11-10",
            pickupTime: "01:00 PM - 03:00 PM",
            address: "123 Green Valley Rd, Tech Park",
            city: "San Francisco",
            zipCode: "94103",
            phoneNumber: "+1 (555) 123-4567",
            requestDate: "2026-11-01",
            estimatedValue: "$280",
        },
        {
            id: "REQ-8824",
            deviceType: "headphones",
            deviceBrand: "Sony",
            deviceModel: "WH-1000XM4",
            deviceCondition: "working",
            quantity: 2,
            status: "pending",
            pickupDate: "2026-11-15",
            pickupTime: "05:00 PM - 07:00 PM",
            address: "123 Green Valley Rd, Tech Park",
            city: "San Francisco",
            zipCode: "94103",
            phoneNumber: "+1 (555) 123-4567",
            requestDate: "2026-11-03",
            estimatedValue: "$180",
        },
    ];

    const getDeviceIcon = (deviceType: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            laptop: <MdLaptopMac className="text-2xl" />,
            smartphone: <MdSmartphone className="text-2xl" />,
            printer: <MdPrint className="text-2xl" />,
            tv: <MdTv className="text-2xl" />,
            headphones: <MdHeadphones className="text-2xl" />,
            smartwatch: <MdWatch className="text-2xl" />,
            keyboard: <MdKeyboard className="text-2xl" />,
            other: <MdDevicesOther className="text-2xl" />,
        };
        return icons[deviceType] || icons.other;
    };

    const getStatusBadge = (status: Request["status"]) => {
        const statusConfig = {
            pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
            confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
            "in-progress": { bg: "bg-purple-100", text: "text-purple-800", label: "In Progress" },
            completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
        };

        const config = statusConfig[status];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.deviceBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.deviceModel.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "all" || request.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        inProgress: requests.filter((r) => r.status === "in-progress").length,
        completed: requests.filter((r) => r.status === "completed").length,
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex flex-1">
                <DashboardSidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50 md:ml-80">
                    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Requests</h1>
                                        <p className="text-xl text-gray-600">Track and manage your recycling requests</p>
                                    </div>
                                    <Link
                                        href="/citizen/book-recycle/new"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md transition-all"
                                    >
                                        <MdAddCircle className="text-xl" />
                                        New Request
                                    </Link>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-gray-600 text-sm font-medium mb-1">Total Requests</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
                                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
                                        <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                                    </div>
                                </div>

                                {/* Search and Filter */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                            <input
                                                type="text"
                                                placeholder="Search by ID, brand, or model..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MdFilterList className="text-gray-500 text-xl" />
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="space-y-4">
                                {filteredRequests.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                        <MdDevicesOther className="text-6xl text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
                                        <p className="text-gray-600 mb-6">
                                            {searchQuery || filterStatus !== "all"
                                                ? "Try adjusting your search or filter"
                                                : "You haven't made any recycling requests yet"}
                                        </p>
                                        {!searchQuery && filterStatus === "all" && (
                                            <Link
                                                href="/citizen/book-recycle/new"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                            >
                                                <MdAddCircle />
                                                Create Your First Request
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                {/* Left Section - Device Info */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                                                        {getDeviceIcon(request.deviceType)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {request.deviceBrand} {request.deviceModel}
                                                            </h3>
                                                            {getStatusBadge(request.status)}
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Request ID</p>
                                                                <p className="font-medium text-gray-900">{request.id}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Condition</p>
                                                                <p className="font-medium text-gray-900 capitalize">
                                                                    {request.deviceCondition.replace("-", " ")}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Quantity</p>
                                                                <p className="font-medium text-gray-900">{request.quantity}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Pickup Date</p>
                                                                <p className="font-medium text-gray-900">{request.pickupDate}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Time Slot</p>
                                                                <p className="font-medium text-gray-900">{request.pickupTime}</p>
                                                            </div>
                                                            {request.estimatedValue && (
                                                                <div>
                                                                    <p className="text-gray-500">Est. Value</p>
                                                                    <p className="font-medium text-green-600">{request.estimatedValue}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Section - Actions */}
                                                <div className="flex flex-col gap-2 lg:w-40">
                                                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
                                                        <MdVisibility />
                                                        View Details
                                                    </button>
                                                    {request.status === "pending" && (
                                                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm">
                                                            <MdCancel />
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {request.status === "completed" && (
                                                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                                                            <MdDownload />
                                                            Receipt
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyRequestsList;
