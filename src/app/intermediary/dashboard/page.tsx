"use client";
import { motion } from "framer-motion";
import { getUser } from "../../intermediary/sign-in/auth";
import DashboardSidebar from "../Components/dashboardSidebar";

const IntermediaryDashboard = () => {
    const user = getUser();
    return (
        <>
            <div className="page-header">
                <h1>Intermediary Dashboard</h1>
                <p>Welcome back, {user?.fullname || "Intermediary"}! Here's an overview of your collection activities.</p>
            </div>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">1,204</div>
                    <div className="stat-label">Total Collections</div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value">42</div>
                    <div className="stat-label">Pending Items</div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">94.2%</div>
                    <div className="stat-label">Completion Rate</div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-icon">♻️</div>
                    <div className="stat-value">2.8K</div>
                    <div className="stat-label">Recycled Items</div>
                </div>
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1e293b" }}>Recent Activity</h2>
                <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                    Track your collection activities and manage pickups efficiently.
                </p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <a href="/intermediary/collections" className="btn btn-primary">View Collections</a>
                    <a href="/intermediary/schedule" className="btn btn-primary">Schedule Pickup</a>
                    <a href="/intermediary/reports" className="btn btn-primary">View Reports</a>
                </div>
            </div>
        </>
    );
}

export default IntermediaryDashboard;
