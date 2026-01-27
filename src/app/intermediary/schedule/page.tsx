"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../../intermediary/sign-in/auth";

// Define interfaces for form data
interface ScheduleFormData {
    // Customer Details
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: string;
    city: string;
    zipCode: string;

    // Device Details
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    deviceCondition: string;
    quantity: number;
    estimatedWeight: string,

    // Schedule Details
    pickupDate: string;
    pickupTime: string;
    notes: string;
}

const SchedulePickupPage = () => {
    const router = useRouter();
    const user = getUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Form State
    const [formData, setFormData] = useState<ScheduleFormData>({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        address: "",
        city: "",
        zipCode: "",
        deviceType: "",
        deviceBrand: "",
        deviceModel: "",
        deviceCondition: "working",
        quantity: 1,
        estimatedWeight: "",
        pickupDate: "",
        pickupTime: "",
        notes: ""
    });

    // Mock Options (matching citizen portal where applicable)
    const deviceTypes = [
        { id: "laptop", name: "Laptop" },
        { id: "smartphone", name: "Smartphone" },
        { id: "printer", name: "Printer" },
        { id: "tv", name: "Television" },
        { id: "headphones", name: "Audio Devices" },
        { id: "smartwatch", name: "Wearables" },
        { id: "keyboard", name: "Peripherals" },
        { id: "other", name: "Other" }
    ];

    const deviceConditions = [
        { value: "working", label: "Working" },
        { value: "minor-issues", label: "Minor Issues" },
        { value: "broken", label: "Broken" },
        { value: "parts-only", label: "Parts Only" }
    ];

    const timeSlots = [
        "09:00 AM - 11:00 AM",
        "11:00 AM - 01:00 PM",
        "01:00 PM - 03:00 PM",
        "03:00 PM - 05:00 PM",
        "05:00 PM - 07:00 PM"
    ];

    const handleCcange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("Submitting Pickup Request:", formData);

        // Mock Success
        alert("Pickup scheduled successfully!");
        setIsSubmitting(false);
        router.push("/intermediary/collections");
    };

    // Calculate min date (today)
    const today = new Date().toISOString().split("T")[0];

    return (
        <>
            <div className="page-header">
                <h1>Schedule Pickup</h1>
                <p>Manually schedule a waste pickup for a client.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Customer Information */}
                <div className="settings-section">
                    <h2 className="section-title">Customer Information</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Customer Name *</label>
                            <input
                                type="text"
                                name="customerName"
                                required
                                value={formData.customerName}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <input
                                type="tel"
                                name="customerPhone"
                                required
                                value={formData.customerPhone}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address (Optional)</label>
                            <input
                                type="email"
                                name="customerEmail"
                                value={formData.customerEmail}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="customer@example.com"
                            />
                        </div>
                    </div>
                    <div className="form-grid" style={{ marginTop: "1rem" }}>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Pickup Address *</label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="Street address, Apt, Suite"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City *</label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="City"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">ZIP Code *</label>
                            <input
                                type="text"
                                name="zipCode"
                                required
                                value={formData.zipCode}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="Zip Code"
                            />
                        </div>
                    </div>
                </div>

                {/* Device Details */}
                <div className="settings-section">
                    <h2 className="section-title">Device & Waste Details</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Device Type *</label>
                            <select
                                name="deviceType"
                                required
                                value={formData.deviceType}
                                onChange={handleCcange}
                                className="form-input"
                            >
                                <option value="">Select Device Type</option>
                                {deviceTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Condition *</label>
                            <select
                                name="deviceCondition"
                                required
                                value={formData.deviceCondition}
                                onChange={handleCcange}
                                className="form-input"
                            >
                                {deviceConditions.map(cond => (
                                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <input
                                type="text"
                                name="deviceBrand"
                                value={formData.deviceBrand}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="e.g. Samsung, Apple"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <input
                                type="text"
                                name="deviceModel"
                                value={formData.deviceModel}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="e.g. Galaxy S21"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                value={formData.quantity}
                                onChange={handleCcange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Est. Weight (kg)</label>
                            <input
                                type="text"
                                name="estimatedWeight"
                                value={formData.estimatedWeight}
                                onChange={handleCcange}
                                className="form-input"
                                placeholder="e.g. 2.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Scheduling */}
                <div className="settings-section">
                    <h2 className="section-title">Schedule Pickup</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Pickup Date *</label>
                            <input
                                type="date"
                                name="pickupDate"
                                required
                                min={today}
                                value={formData.pickupDate}
                                onChange={handleCcange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time Slot *</label>
                            <select
                                name="pickupTime"
                                required
                                value={formData.pickupTime}
                                onChange={handleCcange}
                                className="form-input"
                            >
                                <option value="">Select Time Slot</option>
                                {timeSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "1.5rem" }}>
                        <label className="form-label">Additional Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleCcange}
                            className="form-input"
                            rows={3}
                            placeholder="Gate code, instructions, etc."
                        />
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Scheduling..." : "Confirm Pickup"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default SchedulePickupPage;
