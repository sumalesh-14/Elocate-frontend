"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, AlertTriangle, Truck, Bike, Ship, Container, Search, ChevronLeft, ChevronRight, ShieldCheck, Navigation, Clock } from "lucide-react";
import { intermediaryApi, Driver, DriverRequest, resolveFacilityId } from "@/lib/intermediary-api";

const DriversPage = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAvailability, setFilterAvailability] = useState("All");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(8);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [currentDriver, setCurrentDriver] = useState<Partial<Driver>>({});
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

    // Fetch Drivers
    const fetchDrivers = async (page: number = currentPage) => {
        try {
            const facilityId = await resolveFacilityId() || undefined;
            console.log("[DriversPage] facilityId resolved:", facilityId);
            const data = await intermediaryApi.drivers.getAll(searchTerm, filterAvailability, page, pageSize, facilityId);
            if (data && data.content) {
                setDrivers(data.content);
                setTotalPages(data.totalPages);
                setCurrentPage(data.number);
            } else if (Array.isArray(data)) {
                // Fallback for flat array response
                setDrivers(data);
                setTotalPages(1);
                setCurrentPage(0);
            }
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchDrivers(0); // Reset to page 0 on search/filter change
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm, filterAvailability]);

    useEffect(() => {
        fetchDrivers(currentPage);
    }, [currentPage]);

    // Handlers
    const handleAddClick = () => {
        setModalMode("add");
        setCurrentDriver({ availability: "AVAILABLE", vehicleType: "VAN" });
        setIsModalOpen(true);
    };

    const handleEditClick = (driver: Driver) => {
        setModalMode("edit");
        setCurrentDriver(driver);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (driver: Driver) => {
        setDriverToDelete(driver);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        console.log("Confirming delete for driver:", driverToDelete?.id);
        if (!driverToDelete) return;
        try {
            await intermediaryApi.drivers.delete(driverToDelete.id);
            setIsDeleteModalOpen(false);
            setDriverToDelete(null);
            console.log("Delete successful");
            fetchDrivers();
        } catch (e) {
            console.error(e);
            alert("Failed to delete driver.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const facilityId = await resolveFacilityId() || undefined;
            const driverToSave = {
                name: currentDriver.name!,
                email: currentDriver.email!,
                phone: currentDriver.phone!,
                vehicleNumber: currentDriver.vehicleNumber!,
                availability: currentDriver.availability,
                vehicleType: currentDriver.vehicleType || "VAN",
                facilityId: facilityId,
            } as DriverRequest;

            if (modalMode === "add") {
                await intermediaryApi.drivers.create(driverToSave);
            } else {
                await intermediaryApi.drivers.update(currentDriver.id!, driverToSave);
            }

            setIsModalOpen(false);
            fetchDrivers();
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Failed to save driver");
        }
    };

    // Derived logic
    const getInitials = (name: string) => {
        if (!name) return "DR";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const getVehicleIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'BIKE': return <Bike size={48} className="text-secondary opacity-20" />;
            case 'MINI_TRUCK': return <Truck size={48} className="text-primary opacity-20" />;
            case 'TRUCK': return <Container size={48} className="text-eco-700 opacity-20" />;
            default: return <Ship size={48} className="text-eco-500 opacity-20" />; // VAN as default Ship icon looks like a van sometimes or just use Truck
        }
    };

    const getVehicleImage = (type: string) => {
        // We use the generated sprite and crop/position based on type
        const spritePath = "/vehicles/all_vehicles.png";

        switch (type?.toUpperCase()) {
            case 'BIKE': return { path: spritePath, position: '0% 0%' };
            case 'VAN': return { path: spritePath, position: '100% 0%' };
            case 'MINI_TRUCK': return { path: spritePath, position: '0% 100%' };
            case 'TRUCK': return { path: spritePath, position: '100% 100%' };
            default: return { path: spritePath, position: '100% 0%' };
        }
    };

    return (
        <>
            <style>{`
                .driver-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 100;
                }
                .driver-modal-content {
                    background: white; border-radius: 1rem; width: 100%; max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: modalFadeIn 0.3s ease-out; overflow: hidden;
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Driver Management</h1>
                    <p>Manage fleet details, contact information, and operating status.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddClick}>
                    <Plus size={18} /> Add New Driver
                </button>
            </div>

            {/* Controls: Single Consolidated Row */}
            <div className="controls-container" style={{
                background: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'nowrap'
            }}>
                {/* Search Unit */}
                <div className="search-wrapper" style={{ flex: '1.2', minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            color: 'var(--text-light)',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search drivers..."
                        className="search-input"
                        style={{
                            paddingLeft: '3rem',
                            height: '38px',
                            fontSize: '0.85rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            width: '100%',
                            background: '#fdfdfd'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters Unit */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', alignItems: 'center', flex: '2', justifyContent: 'center' }}>
                    {["All", "AVAILABLE", "ON_ROUTE", "BUSY"].map((status) => (
                        <button
                            key={status}
                            className={`filter-btn ${filterAvailability === status ? "active" : ""}`}
                            onClick={() => setFilterAvailability(status)}
                            style={{
                                padding: '0.4rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                border: filterAvailability === status ? '1px solid var(--primary-color)' : '1px solid #e2e8f0',
                                background: filterAvailability === status ? '#f0fdf4' : 'transparent',
                                color: filterAvailability === status ? 'var(--primary-dark)' : 'var(--text-medium)',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: status === 'AVAILABLE' ? '#22c55e' : status === 'ON_ROUTE' ? '#3b82f6' : status === 'BUSY' ? '#f59e0b' : '#94a3b8'
                            }}></span>
                            {status === "All" ? "All" : status.replace("_", " ")}
                        </button>
                    ))}
                </div>

                {/* Pagination Unit */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '3px 6px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: currentPage === 0 ? 'default' : 'pointer',
                                    color: currentPage === 0 ? '#cbd5e1' : 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-medium)', minWidth: '60px', textAlign: 'center' }}>
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: currentPage === totalPages - 1 ? 'default' : 'pointer',
                                    color: currentPage === totalPages - 1 ? '#cbd5e1' : 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Drivers Grid (Using global clients classes for consistency) */}
            <div className="clients-grid">
                {drivers && drivers.map((driver) => (
                    <div className="client-card" key={driver.id}>
                        <div className="client-header">
                            <div className="client-avatar">
                                {getInitials(driver.name)}
                            </div>
                            <div className="client-identity">
                                <h3>{driver.name}</h3>
                            </div>
                            <div className="vehicle-badge-container" style={{ marginLeft: 'auto' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    backgroundImage: `url(${getVehicleImage(driver.vehicleType).path})`,
                                    backgroundSize: '200% 200%', // For 2x2 grid
                                    backgroundPosition: getVehicleImage(driver.vehicleType).position,
                                    backgroundRepeat: 'no-repeat',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.25rem', minHeight: '100px' }}>
                            <div className="client-details" style={{ border: 'none', marginBottom: 0 }}>
                                <div className="detail-row">
                                    <span className="detail-icon">📞</span>
                                    <span>{driver.phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">✉️</span>
                                    <span style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{driver.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-icon">🚐</span>
                                    <span>{driver.vehicleNumber}</span>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                paddingRight: '1rem',
                                paddingBottom: '0.5rem'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: driver.availability === 'AVAILABLE' ? '#f0fdf4' : driver.availability === 'ON_ROUTE' ? '#eff6ff' : '#fffbeb',
                                    color: driver.availability === 'AVAILABLE' ? '#22c55e' : driver.availability === 'ON_ROUTE' ? '#3b82f6' : '#f59e0b',
                                    boxShadow: `0 4px 12px ${driver.availability === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.15)' : driver.availability === 'ON_ROUTE' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                                }}>
                                    {driver.availability === 'AVAILABLE' ? <ShieldCheck size={28} /> :
                                        driver.availability === 'ON_ROUTE' ? <Navigation size={28} /> :
                                            <Clock size={28} />}
                                </div>
                                <span className="client-type" style={{
                                    backgroundColor: driver.availability === 'AVAILABLE' ? '#dcfce7' : driver.availability === 'ON_ROUTE' ? '#dbeafe' : '#fef3c7',
                                    color: driver.availability === 'AVAILABLE' ? '#16a34a' : driver.availability === 'ON_ROUTE' ? '#2563eb' : '#d97706',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.03em',
                                    whiteSpace: 'nowrap',
                                    textTransform: 'uppercase'
                                }}>
                                    {driver.availability.replace("_", " ")}
                                </span>
                            </div>
                        </div>

                        <div className="client-actions">
                            <button className="btn btn-secondary" onClick={() => handleEditClick(driver)} style={{ flex: '0.5' }}>
                                <Edit2 size={16} /> Edit
                            </button>
                            <button className="btn" style={{
                                flex: '0.5',
                                border: '1px solid #fee2e2',
                                background: '#fef2f2',
                                color: '#dc2626'
                            }} onClick={() => handleDeleteClick(driver)}>
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}

                {drivers.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-light)" }}>
                        No drivers found matching your search criteria.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <button
                        className="btn btn-secondary"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        style={{ padding: '0.5rem 1rem', opacity: currentPage === 0 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span style={{ fontWeight: 600, color: 'var(--text-medium)' }}>
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                        className="btn btn-secondary"
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        style={{ padding: '0.5rem 1rem', opacity: currentPage === totalPages - 1 ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}


            {/* Standardized Form Modal */}
            {isModalOpen && (
                <div className="driver-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="driver-modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                                {modalMode === 'add' ? 'Add New Driver' : 'Edit Driver'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    required
                                    value={currentDriver.name || ""}
                                    onChange={e => setCurrentDriver({ ...currentDriver, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    required
                                    value={currentDriver.email || ""}
                                    onChange={e => setCurrentDriver({ ...currentDriver, email: e.target.value })}
                                    placeholder="john.doe@elocate.com"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        className="form-input"
                                        type="tel"
                                        required
                                        value={currentDriver.phone || ""}
                                        onChange={e => setCurrentDriver({ ...currentDriver, phone: e.target.value })}
                                        placeholder="+1 555-0000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Reg. Number</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        required
                                        value={currentDriver.vehicleNumber || ""}
                                        onChange={e => setCurrentDriver({ ...currentDriver, vehicleNumber: e.target.value })}
                                        placeholder="VAN-1234"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Vehicle Type</label>
                                <select
                                    className="form-input"
                                    value={currentDriver.vehicleType || "VAN"}
                                    onChange={e => setCurrentDriver({ ...currentDriver, vehicleType: e.target.value })}
                                >
                                    <option value="BIKE">Bike</option>
                                    <option value="VAN">Van</option>
                                    <option value="MINI_TRUCK">Mini Truck</option>
                                    <option value="TRUCK">Heavy Truck</option>
                                </select>
                            </div>

                            {modalMode === 'edit' && (
                                <div className="form-group">
                                    <label className="form-label">Availability Status</label>
                                    <select
                                        className="form-input"
                                        value={currentDriver.availability || "AVAILABLE"}
                                        onChange={e => setCurrentDriver({ ...currentDriver, availability: e.target.value })}
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="ON_ROUTE">On Route</option>
                                        <option value="BUSY">Busy</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ padding: '1.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', margin: '0 -1.5rem -1.5rem -1.5rem', background: '#f8fafc' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'add' ? 'Save Driver' : 'Update Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="driver-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="driver-modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: '#fef2f2',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem'
                            }}>
                                <AlertTriangle size={32} />
                            </div>

                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                                Delete Driver?
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong>{driverToDelete?.name}</strong>? This action cannot be undone.
                            </p>
                        </div>

                        <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', gap: '0.75rem', borderTop: '1px solid #e2e8f0', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ minWidth: '100px', justifyContent: 'center' }}
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn"
                                style={{
                                    minWidth: '140px',
                                    justifyContent: 'center',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontWeight: 500
                                }}
                                onClick={handleConfirmDelete}
                            >
                                Delete Driver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DriversPage;
