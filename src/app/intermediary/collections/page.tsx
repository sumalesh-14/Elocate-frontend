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
        const upper = (status || "").toUpperCase();
        if (upper === "CREATED") return "status-pending";
        if (upper === "APPROVED") return "status-scheduled";
        if (upper === "VERIFIED") return "status-scheduled";
        if (upper === "RECYCLED") return "status-completed";
        if (upper === "REJECTED" || upper === "CANCELLED") return "status-cancelled";
        return "status-pending";
    };

    return (
        <>
            <div className="page-header">
                <h1 style={{ fontSize: "2rem" }}>Collections Management</h1>
                <p style={{ fontSize: "1.1rem" }}>View and manage your scheduled waste pick-ups.</p>
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
                        style={{ fontSize: "1rem" }}
                    />
                </div>

                <div className="filter-group">
                    {["All", "CREATED", "APPROVED", "VERIFIED", "RECYCLED", "REJECTED", "CANCELLED"].map((status) => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? "active" : ""}`}
                            onClick={() => setFilterStatus(status)}
                            style={{ fontSize: "1rem", padding: "0.6rem 1.2rem" }}
                        >
                            {status === "All" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table" style={{ fontSize: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Request ID</th>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Customer</th>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Items</th>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Location</th>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Date</th>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Status</th>
                            <th style={{ fontSize: "1.05rem", padding: "1rem" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-light)", fontSize: "1.1rem" }}>
                                    Loading collections...
                                </td>
                            </tr>
                        ) : collections.length > 0 ? (
                            collections.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ padding: "1rem" }}><strong style={{ fontSize: "1rem" }}>{item.id.substring(0, 8).toUpperCase()}</strong></td>
                                    <td style={{ padding: "1rem", fontSize: "1rem" }}>User Data Int.</td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", padding: "1rem", fontSize: "1rem" }}>
                                        {item.deviceModelName || "Unknown"}
                                    </td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", padding: "1rem", fontSize: "1rem" }}>
                                        {item.pickupAddress || item.facilityName}
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "1rem" }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span className={`status-badge ${getStatusClass(item.status)}`} style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <a href={`/intermediary/collections/${item.id}`} className="btn btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "1rem", textDecoration: "none" }}>
                                                Manage
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-light)", fontSize: "1.1rem" }}>
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
