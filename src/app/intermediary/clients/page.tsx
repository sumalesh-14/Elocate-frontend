"use client";

import React, { useState } from "react";
import { getUser } from "../../intermediary/sign-in/auth";

interface Client {
    id: string;
    name: string;
    type: "Residential" | "Business" | "Institution";
    location: string;
    phone: string;
    email: string;
    totalCollections: number; // in kg
    requestsCount: number;
    initials: string;
}

const ClientsPage = () => {
    const user = getUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    // Mock Data
    const clients: Client[] = [
        {
            id: "CL-001",
            name: "Grand Hotel & Spa",
            type: "Business",
            location: "12 Downtown Ave",
            phone: "+1 555-0123",
            email: "ops@grandhotel.com",
            totalCollections: 450,
            requestsCount: 12,
            initials: "GH"
        },
        {
            id: "CL-002",
            name: "Sarah Jenkins",
            type: "Residential",
            location: "45 Maple Drive",
            phone: "+1 555-0124",
            email: "sarah.j@email.com",
            totalCollections: 24,
            requestsCount: 3,
            initials: "SJ"
        },
        {
            id: "CL-003",
            name: "City High School",
            type: "Institution",
            location: "88 Education Ln",
            phone: "+1 555-0125",
            email: "admin@cityhigh.edu",
            totalCollections: 1200,
            requestsCount: 8,
            initials: "CH"
        },
        {
            id: "CL-004",
            name: "Tech Solutions Inc",
            type: "Business",
            location: "200 Cyber Park",
            phone: "+1 555-0126",
            email: "ewaste@techsol.com",
            totalCollections: 2100,
            requestsCount: 5,
            initials: "TS"
        },
        {
            id: "CL-005",
            name: "Michael Chen",
            type: "Residential",
            location: "702 River Road",
            phone: "+1 555-0127",
            email: "m.chen@email.com",
            totalCollections: 15,
            requestsCount: 2,
            initials: "MC"
        },
        {
            id: "CL-006",
            name: "Community Center",
            type: "Institution",
            location: "15 Public Square",
            phone: "+1 555-0128",
            email: "info@commcenter.org",
            totalCollections: 320,
            requestsCount: 6,
            initials: "CC"
        }
    ];

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "All" || client.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <>
            <div className="page-header">
                <h1>Client Directory</h1>
                <p>Manage and contact your waste collection sources.</p>
            </div>

            {/* Controls */}
            <div className="controls-container">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search clients by name or location..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    {["All", "Residential", "Business", "Institution"].map((type) => (
                        <button
                            key={type}
                            className={`filter-btn ${filterType === type ? "active" : ""}`}
                            onClick={() => setFilterType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clients Grid */}
            <div className="clients-grid">
                {filteredClients.map((client) => (
                    <div className="client-card" key={client.id}>
                        <div className="client-header">
                            <div className="client-avatar">
                                {client.initials}
                            </div>
                            <div className="client-identity">
                                <h3>{client.name}</h3>
                                <span className="client-type">{client.type}</span>
                            </div>
                        </div>

                        <div className="client-details">
                            <div className="detail-row">
                                <span className="detail-icon">📍</span>
                                <span>{client.location}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-icon">📞</span>
                                <span>{client.phone}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-icon">✉️</span>
                                <span style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{client.email}</span>
                            </div>
                        </div>

                        <div className="client-stats">
                            <div className="stat-item">
                                <span className="stat-val">{client.totalCollections} kg</span>
                                <span className="stat-lbl">Collected</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">{client.requestsCount}</span>
                                <span className="stat-lbl">Pickups</span>
                            </div>
                        </div>

                        <div className="client-actions">
                            <button className="btn btn-secondary">History</button>
                            <button className="btn btn-primary">Contact</button>
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-light)" }}>
                        No clients found matching your search.
                    </div>
                )}
            </div>
        </>
    );
};

export default ClientsPage;
