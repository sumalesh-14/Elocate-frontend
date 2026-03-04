"use client";

import { getUser } from "../../intermediary/sign-in/auth";
import {
    Package,
    Clock,
    CheckCircle2,
    Recycle,
    ArrowUp,
    CalendarClock,
    Truck,
    Users,
} from "lucide-react";

const IntermediaryDashboard = () => {
    const user = getUser();

    const stats = [
        {
            label: "Total Collections",
            value: "1,204",
            unit: "items",
            change: "+8.2%",
            isPositive: true,
            icon: Package,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Pending Items",
            value: "42",
            unit: "pending",
            change: "-5",
            isPositive: true,
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "Completion Rate",
            value: "94.2%",
            unit: "this month",
            change: "+2.1%",
            isPositive: true,
            icon: CheckCircle2,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Recycled Items",
            value: "2.8K",
            unit: "units",
            change: "+12.5%",
            isPositive: true,
            icon: Recycle,
            color: "bg-tech-lime/20 text-eco-700",
        },
    ];

    const recentActivity = [
        { id: "#COL-1042", client: "Grand Hotel & Spa", date: "Today, 10:30 AM", status: "Completed", weight: "450 kg" },
        { id: "#COL-1041", client: "City High School", date: "Today, 09:00 AM", status: "In Transit", weight: "210 kg" },
        { id: "#COL-1040", client: "Tech Solutions Inc", date: "Yesterday", status: "Pending", weight: "830 kg" },
        { id: "#COL-1039", client: "Community Center", date: "Mar 1, 2026", status: "Completed", weight: "320 kg" },
    ];

    const statusColors: Record<string, string> = {
        Completed: "bg-green-100 text-green-700",
        "In Transit": "bg-blue-100 text-blue-700",
        Pending: "bg-yellow-100 text-yellow-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    return (
        <div className="space-y-8">

            {/* Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-eco-950">Dashboard Overview</h2>
                    <p className="text-eco-600 mt-1">
                        Welcome back, {user?.fullname || "Intermediary"}! Here's your collection summary.
                    </p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/intermediary/schedule"
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-eco-700 hover:bg-eco-50 shadow-sm transition-colors"
                    >
                        View Schedule
                    </a>
                    <a
                        href="/intermediary/collections"
                        className="px-4 py-2 bg-eco-900 text-white rounded-lg text-sm font-medium shadow-lg shadow-eco-900/20 hover:bg-eco-800 transition-colors"
                    >
                        All Collections
                    </a>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                    }`}
                            >
                                <ArrowUp size={12} className={stat.isPositive ? "" : "rotate-180"} />
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-eco-900">{stat.value}</div>
                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">
                            {stat.unit}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions + Live Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-xl text-eco-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Schedule Pickup", href: "/intermediary/schedule", icon: CalendarClock, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                            { label: "Assign Driver", href: "/intermediary/assign-drivers", icon: Truck, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                            { label: "View Clients", href: "/intermediary/clients", icon: Users, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                        ].map((action, i) => (
                            <a
                                key={i}
                                href={action.href}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all ${action.color} group`}
                            >
                                <action.icon size={28} className="transition-transform group-hover:scale-110" />
                                <span className="text-sm font-semibold text-center">{action.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Live Status Panel */}
                <div className="bg-eco-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-tech-lime rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3" />
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl">Live Status</h3>
                            <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-tech-lime animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-tech-lime" />
                                LIVE
                            </div>
                        </div>
                        <div className="space-y-5 flex-1">
                            {[
                                { text: "Driver Ravi assigned to COL-1041", time: "5m ago" },
                                { text: "COL-1042 marked as Completed", time: "30m ago" },
                                { text: "New pickup request from City High School", time: "2h ago" },
                                { text: "COL-1039 completed successfully", time: "Yesterday" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-tech-lime/50 group-hover:bg-tech-lime transition-colors shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-200 leading-snug group-hover:text-white transition-colors">
                                            {item.text}
                                        </p>
                                        <span className="text-xs text-eco-400/70">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-eco-400">Operations</div>
                                <div className="text-sm font-bold text-tech-lime">Active</div>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-tech-lime w-[88%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-eco-900">Recent Collections</h3>
                    <a href="/intermediary/collections" className="text-sm font-medium text-eco-600 hover:text-eco-800">
                        View All
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                {["Collection ID", "Client", "Date", "Status", "Weight"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentActivity.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-medium text-eco-900">{row.id}</td>
                                    <td className="px-8 py-4 text-sm text-gray-600">{row.client}</td>
                                    <td className="px-8 py-4 text-sm text-gray-500">{row.date}</td>
                                    <td className="px-8 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status] || "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-sm font-bold text-gray-700">{row.weight}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default IntermediaryDashboard;
