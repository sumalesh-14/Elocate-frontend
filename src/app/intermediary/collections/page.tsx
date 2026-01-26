"use client";

import React, { useState } from "react";
import { getUser } from "../../intermediary/sign-in/auth";

// Define TypeScript interfaces
interface CollectionRequest {
    id: string;
    customerName: string;
    location: string;
    items: string;
    weight: string;
    date: string;
    status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
}

const CollectionsPage = () => {
    const user = getUser();
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Mock Data
    const collections: CollectionRequest[] = [
        {
            id: "REQ-001",
            customerName: "John Doe",
            location: "123 Green St, Springfield",
            items: "Old Laptop, 2 Phones",
            weight: "2.5 kg",
            date: "2024-01-28",
            status: "Pending",
        },
        {
            id: "REQ-002",
            customerName: "Alice Smith",
            location: "456 Eco Ave, Shelbyville",
            items: "Washing Machine",
            weight: "45 kg",
            date: "2024-01-27",
            status: "Scheduled",
        },
        {
            id: "REQ-003",
            customerName: "Bob Johnson",
            location: "789 Recycle Rd, Capital City",
            items: "CRT Monitor, Cables",
            weight: "12 kg",
            date: "2024-01-25",
            status: "Completed",
        },
        {
            id: "REQ-004",
            customerName: "Sarah Connor",
            location: "101 Skynet Blvd, Future City",
            items: "Robot Arm",
            weight: "15 kg",
            date: "2024-01-26",
            status: "Cancelled",
        },
        {
            id: "REQ-005",
            customerName: "Mike Ross",
            location: "500 Pearson St, New York",
            items: "Printer, Fax Machine",
            weight: "8 kg",
            date: "2024-01-29",
            status: "Pending",
        },
    ];

    // Filter Logic
    const filteredCollections = collections.filter((item) => {
        const matchesStatus = filterStatus === "All" || item.status === filterStatus;
        const matchesSearch =
            item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Pending": return "status-pending";
            case "Scheduled": return "status-scheduled";
            case "Completed": return "status-completed";
            case "Cancelled": return "status-cancelled";
            default: return "";
        }
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
                        {filteredCollections.length > 0 ? (
                            filteredCollections.map((item) => (
                                <tr key={item.id}>
                                    <td><strong>{item.id}</strong></td>
                                    <td>{item.customerName}</td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.items}
                                    </td>
                                    <td>{item.weight}</td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.location}
                                    </td>
                                    <td>{item.date}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                                View
                                            </button>
                                            {item.status === "Pending" && (
                                                <button className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                                    Accept
                                                </button>
                                            )}
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
