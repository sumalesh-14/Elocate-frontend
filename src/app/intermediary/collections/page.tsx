"use client";

import React, { useState, useEffect } from "react";
import { getUser, getUserID } from "../../intermediary/sign-in/auth";
import { intermediaryApi } from "@/lib/intermediary-api";

const CollectionsPage = () => {
    const user = getUser();
    const facilityOwnerId = getUserID(); // In a real app this might be different if facility is a separate ID, assuming user ID = facility owner
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!facilityOwnerId) return;
            try {
                setLoading(true);
                const data = await intermediaryApi.requests.getAll(facilityOwnerId as string, filterStatus, searchTerm);
                setCollections(data);
            } catch (error) {
                console.error("Failed to load collections:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRequests();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [facilityOwnerId, filterStatus, searchTerm]);

    const getStatusClass = (status: string) => {
        const lower = (status || "").toLowerCase();
        if (lower === "pending") return "status-pending";
        if (lower === "approved" || lower === "scheduled") return "status-scheduled";
        if (lower === "completed" || lower === "recycled") return "status-completed";
        if (lower === "cancelled" || lower === "rejected") return "status-cancelled";
        return "status-pending";
    };

    return (
        <>
            <div className="page-header">
                <h1>Collections Management</h1>
                <p>View and manage your scheduled waste pick-ups.</p>
            </div>

            {/* Controls */}
            <div className="controls-container">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, ID, or location..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    {["All", "Pending", "Scheduled", "Completed", "Cancelled"].map((status) => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? "active" : ""}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Weight (Est.)</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-light)" }}>
                                    Loading collections...
                                </td>
                            </tr>
                        ) : collections.length > 0 ? (
                            collections.map((item) => (
                                <tr key={item.id}>
                                    <td><strong>{item.id.substring(0, 8).toUpperCase()}</strong></td>
                                    <td>User Data Int.</td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.deviceModelName || "Unknown"}
                                    </td>
                                    <td>—</td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.pickupAddress || item.facilityName}
                                    </td>
                                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <a href={`/intermediary/collections/${item.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", textDecoration: "none" }}>
                                                Manage
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-light)" }}>
                                    No collections found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default CollectionsPage;
