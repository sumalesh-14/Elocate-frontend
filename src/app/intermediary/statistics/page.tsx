"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { getUser } from "../../intermediary/sign-in/auth";

const StatisticsPage = () => {
    const user = getUser();

    // Mock Data
    const revenueData = [
        { month: 'Jan', amount: 4000 },
        { month: 'Feb', amount: 3000 },
        { month: 'Mar', amount: 5000 },
        { month: 'Apr', amount: 2780 },
        { month: 'May', amount: 1890 },
        { month: 'Jun', amount: 6390 },
    ];

    const wasteComposition = [
        { name: 'Mobile', value: 400 },
        { name: 'Laptop', value: 300 },
        { name: 'Accessories', value: 300 },
        { name: 'Home Appliances', value: 200 },
    ];

    const monthlyTrends = [
        { name: 'Week 1', collections: 40, cancellations: 24 },
        { name: 'Week 2', collections: 30, cancellations: 13 },
        { name: 'Week 3', collections: 20, cancellations: 58 },
        { name: 'Week 4', collections: 27, cancellations: 39 },
        { name: 'Week 5', collections: 27, cancellations: 39 },
        { name: 'Week 6', collections: 27, cancellations: 39 },
        { name: 'Week 7', collections: 27, cancellations: 39 },
    ];

    const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];

    return (
        <>
            <div className="page-header">
                <h1>Statistics & Analytics</h1>
                <p>Detailed insights into your collection performance and revenue.</p>
            </div>

            {/* Overview Cards */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">$12,450</div>
                    <div className="stat-label">Total Revenue</div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-icon">⚖️</div>
                    <div className="stat-value">3,240 kg</div>
                    <div className="stat-label">Waste Collected</div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-icon">🔔</div>
                    <div className="stat-value">15</div>
                    <div className="stat-label">Active Requests</div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-value">4.8</div>
                    <div className="stat-label">Satisfaction Rate</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>

                {/* Revenue Chart */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ marginBottom: "1.5rem", color: "#1e293b", fontSize: "1.1rem" }}>Revenue Overview</h3>
                    <div style={{ height: "300px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#22c55e" fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Waste Composition */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ marginBottom: "1.5rem", color: "#1e293b", fontSize: "1.1rem" }}>Waste Composition</h3>
                    <div style={{ height: "300px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={wasteComposition}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {wasteComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Monthly Trends */}
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginBottom: "1.5rem", color: "#1e293b", fontSize: "1.1rem" }}>Monthly Collection Trends</h3>
                <div style={{ height: "300px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Legend />
                            <Bar dataKey="collections" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cancellations" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};

export default StatisticsPage;
