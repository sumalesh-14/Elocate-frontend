"use client";

import React, { useState } from "react";
import { getUser } from "../../intermediary/sign-in/auth";

const SettingsPage = () => {
    const user = getUser();

    // Profile State
    const [profile, setProfile] = useState({
        fullName: user?.fullname || "Intermediary User",
        email: user?.email || "user@example.com",
        phone: "+1 234 567 8900",
        company: "Green Cycle Solutions",
        address: "123 Eco Friendly Lane",
        city: "Clean City"
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        newRequests: true,
        dailySummary: true,
        weeklyReport: false,
        marketing: false
    });

    // Password State
    const [password, setPassword] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications({
            ...notifications,
            [key]: !notifications[key]
        });
    };

    return (
        <>
            <div className="page-header">
                <h1>Account Settings</h1>
                <p>Manage your profile, preferences, and account security.</p>
            </div>

            {/* Profile Settings */}
            <div className="settings-section">
                <h2 className="section-title">Profile Information</h2>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Company / Organization</label>
                        <input
                            type="text"
                            name="company"
                            value={profile.company}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={profile.address}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            name="city"
                            value={profile.city}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>
                </div>
                <div style={{ marginTop: "2rem", textAlign: "right" }}>
                    <button className="btn btn-primary">Save Profile</button>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="settings-section">
                <h2 className="section-title">Notifications</h2>
                <div style={{ marginTop: "1rem" }}>
                    <div className="notification-group">
                        <div className="notification-info">
                            <h4>New Collection Requests</h4>
                            <p>Get notified immediately when a new collection is requested in your area.</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications.newRequests}
                                onChange={() => handleNotificationToggle('newRequests')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-group">
                        <div className="notification-info">
                            <h4>Daily Summary</h4>
                            <p>Receive a daily email summarizing your scheduled pickups.</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications.dailySummary}
                                onChange={() => handleNotificationToggle('dailySummary')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="notification-group">
                        <div className="notification-info">
                            <h4>Weekly Performance Report</h4>
                            <p>Get insights on your weekly revenue and collection stats.</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications.weeklyReport}
                                onChange={() => handleNotificationToggle('weeklyReport')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
                <div style={{ marginTop: "2rem", textAlign: "right" }}>
                    <button className="btn btn-secondary">Update Preferences</button>
                </div>
            </div>

            {/* Security Settings */}
            <div className="settings-section">
                <h2 className="section-title">Security</h2>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input type="password" className="form-input" placeholder="Enter new password" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input type="password" className="form-input" placeholder="Confirm new password" />
                    </div>
                </div>
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button className="btn btn-secondary" style={{ color: "#dc2626", borderColor: "#fee2e2", background: "#fef2f2" }}>Delete Account</button>
                    <button className="btn btn-primary">Change Password</button>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
