'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '../../sign-in/auth';
import './ProfileSettings.css';

const ProfileSettings = () => {
    const router = useRouter();
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        deviceAlerts: true,
        locationUpdates: false,
        recyclingReminders: true,
        newsUpdates: false
    });

    const [preferences, setPreferences] = useState({
        autoLocation: true,
        showNearbyFacilities: true,
        publicProfile: false,
        shareRecyclingStats: false
    });

    // Handle notification toggles
    const handleNotificationToggle = (key: string) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key as keyof typeof prev]
        }));
    };

    // Handle preference toggles
    const handlePreferenceToggle = (key: string) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key as keyof typeof prev]
        }));
    };

    // Handle logout
    const handleLogoutClick = () => {
        if (confirm('Are you sure you want to logout?')) {
            handleLogout();
        }
    };

    // Handle account deactivation
    const handleDeactivate = () => {
        setShowDeactivateModal(true);
    };

    const confirmDeactivate = () => {
        // Here you would make an API call to deactivate the account
        alert('Account deactivation requested. You will be logged out.');
        handleLogout();
    };

    const cancelDeactivate = () => {
        setShowDeactivateModal(false);
    };

    // Handle data export
    const handleExportData = () => {
        alert('Your data export has been requested. You will receive an email with a download link shortly.');
    };

    // Handle clear cache
    const handleClearCache = () => {
        if (confirm('This will clear all cached data. Continue?')) {
            localStorage.removeItem('cachedLocations');
            localStorage.removeItem('cachedDevices');
            alert('Cache cleared successfully!');
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-wrapper">
                <div className="settings-header">
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-subtitle">Manage your account and preferences</p>
                </div>

                {/* Account Settings */}
                <div className="settings-section">
                    <h2 className="section-title">Account Settings</h2>

                    <div className="settings-list">
                        <div className="setting-item clickable" onClick={() => router.push('/citizen/profile/edit-profile')}>
                            <div className="setting-left">
                                <div className="setting-icon">👤</div>
                                <div className="setting-info">
                                    <h3>Edit Profile</h3>
                                    <p>Update your personal information</p>
                                </div>
                            </div>
                            <div className="setting-arrow">→</div>
                        </div>

                        <div className="setting-item clickable" onClick={handleExportData}>
                            <div className="setting-left">
                                <div className="setting-icon">📥</div>
                                <div className="setting-info">
                                    <h3>Export Data</h3>
                                    <p>Download all your account data</p>
                                </div>
                            </div>
                            <div className="setting-arrow">→</div>
                        </div>

                        <div className="setting-item clickable" onClick={handleClearCache}>
                            <div className="setting-left">
                                <div className="setting-icon">🗑️</div>
                                <div className="setting-info">
                                    <h3>Clear Cache</h3>
                                    <p>Remove cached locations and devices</p>
                                </div>
                            </div>
                            <div className="setting-arrow">→</div>
                        </div>
                    </div>
                </div>

                {/* E-Waste Preferences */}
                <div className="settings-section">
                    <h2 className="section-title">E-Waste Locator Preferences</h2>

                    <div className="settings-list">
                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">📍</div>
                                <div className="setting-info">
                                    <h3>Auto-detect Location</h3>
                                    <p>Automatically find nearby e-waste facilities</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.autoLocation}
                                    onChange={() => handlePreferenceToggle('autoLocation')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">🏢</div>
                                <div className="setting-info">
                                    <h3>Show Nearby Facilities</h3>
                                    <p>Display recycling centers on map</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.showNearbyFacilities}
                                    onChange={() => handlePreferenceToggle('showNearbyFacilities')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">🌍</div>
                                <div className="setting-info">
                                    <h3>Public Profile</h3>
                                    <p>Make your recycling profile visible to others</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.publicProfile}
                                    onChange={() => handlePreferenceToggle('publicProfile')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">📊</div>
                                <div className="setting-info">
                                    <h3>Share Recycling Stats</h3>
                                    <p>Contribute to community recycling data</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.shareRecyclingStats}
                                    onChange={() => handlePreferenceToggle('shareRecyclingStats')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-section">
                    <h2 className="section-title">Notifications</h2>

                    <div className="settings-list">
                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">📧</div>
                                <div className="setting-info">
                                    <h3>Email Notifications</h3>
                                    <p>Receive updates via email</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.emailNotifications}
                                    onChange={() => handleNotificationToggle('emailNotifications')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">🔔</div>
                                <div className="setting-info">
                                    <h3>Device Alerts</h3>
                                    <p>Get notified about device status changes</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.deviceAlerts}
                                    onChange={() => handleNotificationToggle('deviceAlerts')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">📍</div>
                                <div className="setting-info">
                                    <h3>Location Updates</h3>
                                    <p>New facilities in your area</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.locationUpdates}
                                    onChange={() => handleNotificationToggle('locationUpdates')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">♻️</div>
                                <div className="setting-info">
                                    <h3>Recycling Reminders</h3>
                                    <p>Periodic reminders to recycle devices</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.recyclingReminders}
                                    onChange={() => handleNotificationToggle('recyclingReminders')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-left">
                                <div className="setting-icon">📰</div>
                                <div className="setting-info">
                                    <h3>News & Updates</h3>
                                    <p>E-waste news and platform updates</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.newsUpdates}
                                    onChange={() => handleNotificationToggle('newsUpdates')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="settings-section danger-zone">
                    <h2 className="section-title">Danger Zone</h2>

                    <div className="settings-list">
                        <div className="setting-item clickable" onClick={handleLogoutClick}>
                            <div className="setting-left">
                                <div className="setting-icon danger">🚪</div>
                                <div className="setting-info">
                                    <h3>Logout</h3>
                                    <p>Sign out of your account</p>
                                </div>
                            </div>
                            <div className="setting-arrow">→</div>
                        </div>

                        <div className="setting-item clickable danger-item" onClick={handleDeactivate}>
                            <div className="setting-left">
                                <div className="setting-icon danger">⚠️</div>
                                <div className="setting-info">
                                    <h3>Deactivate Account</h3>
                                    <p>Temporarily disable your account</p>
                                </div>
                            </div>
                            <div className="setting-arrow">→</div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="settings-actions">
                    <button className="btn btn-primary" onClick={() => {
                        alert('Settings saved successfully!');
                        router.push('/citizen/profile');
                        // Here you would save to backend
                    }}>
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Deactivate Modal */}
            {showDeactivateModal && (
                <div className="modal-overlay" onClick={cancelDeactivate}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Deactivate Account</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to deactivate your account?</p>
                            <p className="warning-text">This action will:</p>
                            <ul>
                                <li>Hide your profile from other users</li>
                                <li>Disable all notifications</li>
                                <li>Remove your devices from public listings</li>
                                <li>Log you out immediately</li>
                            </ul>
                            <p className="info-text">You can reactivate your account anytime by logging back in.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={cancelDeactivate}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDeactivate}>
                                Deactivate Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;