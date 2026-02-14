"use client";

import React, { useState } from "react";
import "./styles.css";

interface ScheduledCollection {
    id: string;
    clientName: string;
    clientType: "Residential" | "Business" | "Institution";
    location: string;
    address: string;
    scheduledDate: string;
    scheduledTime: string;
    estimatedWeight: number;
    status: "Pending" | "Assigned" | "Completed";
    assignedDriver?: string;
    driverEmail?: string;
    priority: "Low" | "Medium" | "High";
    driverMessages?: DriverMessage[];
    hasCriticalAlert?: boolean;
    adminHelpRequested?: boolean;
}

interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    availability: "Available" | "On Route" | "Busy";
}

interface DriverMessage {
    id: string;
    message: string;
    timestamp: string;
    isSystemMessage: boolean;
    isCritical?: boolean;
    alertType?: string;
    resolved?: boolean;
}

const AssignDriversPage = () => {
    const [selectedCollection, setSelectedCollection] = useState<ScheduledCollection | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showMessagesModal, setShowMessagesModal] = useState(false);
    const [showAdminRequestModal, setShowAdminRequestModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [selectedCriticalMessage, setSelectedCriticalMessage] = useState<DriverMessage | null>(null);
    const [adminRequestNote, setAdminRequestNote] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    // Mock Data - Scheduled Collections
    const [collections, setCollections] = useState<ScheduledCollection[]>([
        {
            id: "SC-001",
            clientName: "Grand Hotel & Spa",
            clientType: "Business",
            location: "12 Downtown Ave",
            address: "12 Downtown Ave, City Center, 10001",
            scheduledDate: "2026-02-16",
            scheduledTime: "10:00 AM",
            estimatedWeight: 45,
            status: "Pending",
            priority: "High"
        },
        {
            id: "SC-002",
            clientName: "Sarah Jenkins",
            clientType: "Residential",
            location: "45 Maple Drive",
            address: "45 Maple Drive, Greenwood, 10023",
            scheduledDate: "2026-02-16",
            scheduledTime: "02:00 PM",
            estimatedWeight: 8,
            status: "Pending",
            priority: "Low"
        },
        {
            id: "SC-003",
            clientName: "City High School",
            clientType: "Institution",
            location: "88 Education Ln",
            address: "88 Education Ln, University District, 10045",
            scheduledDate: "2026-02-17",
            scheduledTime: "09:00 AM",
            estimatedWeight: 120,
            status: "Assigned",
            assignedDriver: "John Smith",
            driverEmail: "john.smith@elocate.com",
            priority: "High",
            hasCriticalAlert: true,
            adminHelpRequested: false,
            driverMessages: [
                {
                    id: "MSG-001",
                    message: "Reached the e-waste collecting location",
                    timestamp: "2026-02-17 08:45 AM",
                    isSystemMessage: true,
                    isCritical: false
                },
                {
                    id: "MSG-002",
                    message: "Vehicle breakdown - engine won't start. Need immediate assistance!",
                    timestamp: "2026-02-17 09:15 AM",
                    isSystemMessage: false,
                    isCritical: true,
                    alertType: "Vehicle Breakdown",
                    resolved: false
                }
            ]
        },
        {
            id: "SC-004",
            clientName: "Tech Solutions Inc",
            clientType: "Business",
            location: "200 Cyber Park",
            address: "200 Cyber Park, Tech Valley, 10067",
            scheduledDate: "2026-02-17",
            scheduledTime: "11:30 AM",
            estimatedWeight: 210,
            status: "Assigned",
            assignedDriver: "David Lee",
            driverEmail: "david.lee@elocate.com",
            priority: "Medium",
            hasCriticalAlert: true,
            adminHelpRequested: true,
            driverMessages: [
                {
                    id: "MSG-005",
                    message: "Unable to reach collection location - road blocked",
                    timestamp: "2026-02-17 11:00 AM",
                    isSystemMessage: false,
                    isCritical: true,
                    alertType: "Unable to Reach Location",
                    resolved: true
                }
            ]
        },
        {
            id: "SC-005",
            clientName: "Michael Chen",
            clientType: "Residential",
            location: "702 River Road",
            address: "702 River Road, Riverside, 10089",
            scheduledDate: "2026-02-18",
            scheduledTime: "03:00 PM",
            estimatedWeight: 5,
            status: "Assigned",
            assignedDriver: "Maria Garcia",
            driverEmail: "maria.garcia@elocate.com",
            priority: "Low",
            hasCriticalAlert: false,
            driverMessages: [
                {
                    id: "MSG-003",
                    message: "On the way to facility",
                    timestamp: "2026-02-18 03:15 PM",
                    isSystemMessage: true,
                    isCritical: false
                },
                {
                    id: "MSG-004",
                    message: "Traffic is heavy, might be 15 minutes late",
                    timestamp: "2026-02-18 03:20 PM",
                    isSystemMessage: false,
                    isCritical: false
                }
            ]
        }
    ]);

    // Mock Data - Available Drivers
    const drivers: Driver[] = [
        {
            id: "DRV-001",
            name: "John Smith",
            email: "john.smith@elocate.com",
            phone: "+1 555-0201",
            vehicleNumber: "VAN-101",
            availability: "Available"
        },
        {
            id: "DRV-002",
            name: "Maria Garcia",
            email: "maria.garcia@elocate.com",
            phone: "+1 555-0202",
            vehicleNumber: "VAN-102",
            availability: "On Route"
        },
        {
            id: "DRV-003",
            name: "David Lee",
            email: "david.lee@elocate.com",
            phone: "+1 555-0203",
            vehicleNumber: "VAN-103",
            availability: "Available"
        },
        {
            id: "DRV-004",
            name: "Emma Wilson",
            email: "emma.wilson@elocate.com",
            phone: "+1 555-0204",
            vehicleNumber: "TRUCK-201",
            availability: "Available"
        }
    ];



    const filteredCollections = collections.filter(collection => {
        if (filterStatus === "All") return true;
        return collection.status === filterStatus;
    });

    const getCriticalAlertCount = (collection: ScheduledCollection): number => {
        if (!collection.driverMessages) return 0;
        return collection.driverMessages.filter(msg => msg.isCritical && !msg.resolved).length;
    };

    const handleAssignDriver = (collection: ScheduledCollection) => {
        setSelectedCollection(collection);
        setShowAssignModal(true);
    };

    const confirmAssignment = () => {
        if (selectedDriver && selectedCollection) {
            setCollections(collections.map(c =>
                c.id === selectedCollection.id
                    ? { ...c, status: "Assigned", assignedDriver: selectedDriver.name, driverEmail: selectedDriver.email, driverMessages: [] }
                    : c
            ));
            alert(`Assignment email sent to ${selectedDriver.name} with collection location and details!`);
            setShowAssignModal(false);
            setSelectedDriver(null);
            setSelectedCollection(null);
        }
    };

    const handleViewMessages = (collection: ScheduledCollection) => {
        setSelectedCollection(collection);
        setShowMessagesModal(true);
    };

    const handleRequestAdminHelp = (message: DriverMessage) => {
        setSelectedCriticalMessage(message);
        setShowAdminRequestModal(true);
    };

    const submitAdminRequest = () => {
        if (!adminRequestNote.trim()) {
            alert("Please add a note describing the issue for the admin.");
            return;
        }

        // Update the message as resolved and collection as admin help requested
        setCollections(collections.map(c => {
            if (c.id === selectedCollection?.id) {
                return {
                    ...c,
                    adminHelpRequested: true,
                    driverMessages: c.driverMessages?.map(msg =>
                        msg.id === selectedCriticalMessage?.id
                            ? { ...msg, resolved: true }
                            : msg
                    )
                };
            }
            return c;
        }));

        alert(`Admin request submitted successfully!\nNote: ${adminRequestNote}`);

        setShowAdminRequestModal(false);
        setAdminRequestNote("");
        setSelectedCriticalMessage(null);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "#ef4444";
            case "Medium": return "#f59e0b";
            case "Low": return "#10b981";
            default: return "#6b7280";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "#f59e0b";
            case "Assigned": return "#3b82f6";
            case "Completed": return "#10b981";
            default: return "#6b7280";
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Assign Drivers</h1>
                <p>Manage scheduled collections and assign drivers for pickup.</p>
            </div>

            {/* Filter Controls */}
            <div className="controls-container">
                <div className="filter-group">
                    {["All", "Pending", "Assigned", "Completed"].map((status) => (
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

            {/* Collections Grid */}
            <div className="collections-grid">
                {filteredCollections.map((collection) => {
                    const criticalCount = getCriticalAlertCount(collection);
                    return (
                        <div className="collection-card" key={collection.id}>
                            <div className="card-header">
                                <div className="card-title-section">
                                    <h3>{collection.clientName}</h3>
                                    <span className="client-type-badge">{collection.clientType}</span>
                                </div>
                                <div className="card-badges">
                                    <span
                                        className="priority-badge"
                                        style={{ backgroundColor: getPriorityColor(collection.priority) }}
                                    >
                                        {collection.priority}
                                    </span>
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(collection.status) }}
                                    >
                                        {collection.status}
                                    </span>
                                    {criticalCount > 0 && (
                                        <span className="critical-alert-badge">
                                            🚨 {criticalCount} Alert{criticalCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="card-details">
                                <div className="detail-row">
                                    <span className="detail-icon">📍</span>
                                    <span>{collection.address}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">📅</span>
                                    <span>{collection.scheduledDate} at {collection.scheduledTime}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">⚖️</span>
                                    <span>Est. Weight: {collection.estimatedWeight} kg</span>
                                </div>
                                {collection.assignedDriver && (
                                    <div className="detail-row assigned-driver">
                                        <span className="detail-icon">👤</span>
                                        <span><strong>{collection.assignedDriver}</strong> ({collection.driverEmail})</span>
                                    </div>
                                )}
                                {collection.driverMessages && collection.driverMessages.length > 0 && (
                                    <div className="detail-row messages-indicator">
                                        <span className="detail-icon">💬</span>
                                        <span><strong>{collection.driverMessages.length} message(s)</strong> from driver</span>
                                    </div>
                                )}
                                {collection.adminHelpRequested && (
                                    <div className="detail-row admin-help-requested">
                                        <span className="detail-icon">✅</span>
                                        <span><strong>Admin help requested</strong></span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                {collection.status === "Pending" ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAssignDriver(collection)}
                                    >
                                        Assign Driver
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleAssignDriver(collection)}
                                        >
                                            Reassign
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleViewMessages(collection)}
                                        >
                                            View Messages {collection.driverMessages && collection.driverMessages.length > 0 && `(${collection.driverMessages.length})`}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredCollections.length === 0 && (
                    <div className="empty-state">
                        No collections found for the selected filter.
                    </div>
                )}
            </div>

            {/* Assign Driver Modal */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Assign Driver</h2>
                            <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="collection-summary">
                                <h3>Collection Details</h3>
                                <p><strong>Client:</strong> {selectedCollection?.clientName}</p>
                                <p><strong>Location:</strong> {selectedCollection?.address}</p>
                                <p><strong>Scheduled:</strong> {selectedCollection?.scheduledDate} at {selectedCollection?.scheduledTime}</p>
                                <div className="info-box">
                                    <p>📧 An email with collection location and details will be sent to the selected driver.</p>
                                </div>
                            </div>

                            <div className="drivers-list">
                                <h3>Select Driver</h3>
                                {drivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        className={`driver-item ${selectedDriver?.id === driver.id ? "selected" : ""} ${driver.availability !== "Available" ? "unavailable" : ""}`}
                                        onClick={() => driver.availability === "Available" && setSelectedDriver(driver)}
                                    >
                                        <div className="driver-info">
                                            <div className="driver-name">
                                                <strong>{driver.name}</strong>
                                                <span className={`availability-badge ${driver.availability.toLowerCase().replace(" ", "-")}`}>
                                                    {driver.availability}
                                                </span>
                                            </div>
                                            <div className="driver-details">
                                                <span>📧 {driver.email}</span>
                                                <span>📞 {driver.phone}</span>
                                                <span>🚐 {driver.vehicleNumber}</span>
                                            </div>
                                        </div>
                                        {selectedDriver?.id === driver.id && (
                                            <span className="check-icon">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmAssignment}
                                disabled={!selectedDriver}
                            >
                                Confirm & Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Driver Messages Modal */}
            {showMessagesModal && (
                <div className="modal-overlay" onClick={() => setShowMessagesModal(false)}>
                    <div className="modal-content messages-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Driver Messages</h2>
                            <button className="close-btn" onClick={() => setShowMessagesModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="messages-header">
                                <div className="collection-info">
                                    <h3>{selectedCollection?.clientName}</h3>
                                    <p>{selectedCollection?.address}</p>
                                </div>
                                <div className="driver-info-box">
                                    <p><strong>Driver:</strong> {selectedCollection?.assignedDriver}</p>
                                    <p><strong>Email:</strong> {selectedCollection?.driverEmail}</p>
                                </div>
                            </div>

                            <div className="messages-list">
                                {selectedCollection?.driverMessages && selectedCollection.driverMessages.length > 0 ? (
                                    selectedCollection.driverMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`message-item ${msg.isCritical ? "critical-alert" : msg.isSystemMessage ? "system-message" : "custom-message"}`}
                                        >
                                            <div className="message-header">
                                                <span className="message-type">
                                                    {msg.isCritical ? "🚨 CRITICAL ALERT" : msg.isSystemMessage ? "📋 System Message" : "✍️ Custom Message"}
                                                </span>
                                                <span className="message-time">{msg.timestamp}</span>
                                            </div>
                                            {msg.isCritical && msg.alertType && (
                                                <div className="alert-type-label">
                                                    Type: {msg.alertType}
                                                </div>
                                            )}
                                            <div className="message-content">
                                                {msg.message}
                                            </div>
                                            {msg.isCritical && !msg.resolved && (
                                                <button
                                                    className="btn request-admin-btn"
                                                    onClick={() => handleRequestAdminHelp(msg)}
                                                >
                                                    Request Admin Help
                                                </button>
                                            )}
                                            {msg.isCritical && msg.resolved && (
                                                <div className="admin-requested-badge">
                                                    ✅ Admin Help Requested
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-messages">
                                        <p>No messages received from driver yet.</p>
                                        <p className="help-text">The driver can send status updates via email using predefined or custom messages.</p>
                                    </div>
                                )}
                            </div>

                            <div className="info-box">
                                <h4>Available System Messages for Drivers:</h4>
                                <ul>
                                    <li>Reached the e-waste collecting location</li>
                                    <li>Collected the e-waste</li>
                                    <li>On the way to facility</li>
                                    <li>Arrived at facility</li>
                                    <li>E-waste unloaded successfully</li>
                                    <li>Delayed due to traffic</li>
                                    <li>Unable to locate address - need assistance</li>
                                </ul>
                                <h4 style={{ marginTop: "1rem" }}>Critical Alert Types:</h4>
                                <ul>
                                    <li>Unable to reach collection location</li>
                                    <li>Vehicle breakdown/mechanical issue</li>
                                    <li>Safety concern at location</li>
                                    <li>Client unavailable/refused collection</li>
                                    <li>Other urgent issue</li>
                                </ul>
                                <p className="help-text">Drivers can also send custom messages for specific situations.</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowMessagesModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Request Modal */}
            {showAdminRequestModal && (
                <div className="modal-overlay" onClick={() => setShowAdminRequestModal(false)}>
                    <div className="modal-content admin-request-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Admin Assistance</h2>
                            <button className="close-btn" onClick={() => setShowAdminRequestModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="alert-summary">
                                <h3>🚨 Critical Alert Details</h3>
                                <div className="alert-info">
                                    <p><strong>Alert Type:</strong> {selectedCriticalMessage?.alertType}</p>
                                    <p><strong>Message:</strong> {selectedCriticalMessage?.message}</p>
                                    <p><strong>Time:</strong> {selectedCriticalMessage?.timestamp}</p>
                                </div>
                            </div>

                            <div className="collection-driver-info">
                                <div className="info-section">
                                    <h4>Collection Information</h4>
                                    <p><strong>Client:</strong> {selectedCollection?.clientName}</p>
                                    <p><strong>Location:</strong> {selectedCollection?.address}</p>
                                    <p><strong>Scheduled:</strong> {selectedCollection?.scheduledDate} at {selectedCollection?.scheduledTime}</p>
                                    <p><strong>Weight:</strong> {selectedCollection?.estimatedWeight} kg</p>
                                </div>
                                <div className="info-section">
                                    <h4>Driver Information</h4>
                                    <p><strong>Name:</strong> {selectedCollection?.assignedDriver}</p>
                                    <p><strong>Email:</strong> {selectedCollection?.driverEmail}</p>
                                </div>
                            </div>

                            <div className="admin-note-section" style={{ marginTop: "1.5rem" }}>
                                <h4>Describe the Issue for Admin</h4>
                                <textarea
                                    className="admin-note-input"
                                    placeholder="Describe the issue and any special instructions for the admin team..."
                                    value={adminRequestNote}
                                    onChange={(e) => setAdminRequestNote(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="info-box">
                                <p>📧 This request will be sent to the admin team to help resolve the issue.</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAdminRequestModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={submitAdminRequest}
                            >
                                Submit Request to Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignDriversPage;
