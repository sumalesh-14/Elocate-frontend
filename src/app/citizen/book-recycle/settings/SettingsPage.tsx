"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardSidebar from "../../Components/DashboardSidebar";
import {
    MdArrowBack,
    MdPerson,
    MdNotifications,
    MdSecurity,
    MdLanguage,
    MdPalette,
    MdLocationOn,
    MdDelete,
    MdDownload,
    MdEdit,
    MdSave,
    MdCancel,
    MdCheckCircle,
    MdEmail,
    MdPhone,
    MdLock,
    MdVisibility,
    MdVisibilityOff,
} from "react-icons/md";

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
}

interface NotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pickupReminders: boolean;
    statusUpdates: boolean;
    promotionalEmails: boolean;
}

interface PickupPreferences {
    defaultAddress: string;
    preferredTimeSlot: string;
    specialInstructions: string;
}

const SettingsPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("account");
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // User Profile State
    const [profile, setProfile] = useState<UserProfile>({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Green Valley Rd, Tech Park",
        city: "San Francisco",
        zipCode: "94103",
    });

    // Notification Settings State
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        smsNotifications: true,
        pickupReminders: true,
        statusUpdates: true,
        promotionalEmails: false,
    });

    // Pickup Preferences State
    const [pickupPrefs, setPickupPrefs] = useState<PickupPreferences>({
        defaultAddress: "123 Green Valley Rd, Tech Park, San Francisco, CA 94103",
        preferredTimeSlot: "09:00 AM - 11:00 AM",
        specialInstructions: "Please call before arrival",
    });

    // App Preferences State
    const [theme, setTheme] = useState("light");
    const [language, setLanguage] = useState("en");

    const tabs = [
        { id: "account", label: "Account", icon: <MdPerson /> },
        { id: "notifications", label: "Notifications", icon: <MdNotifications /> },
        { id: "pickup", label: "Pickup Preferences", icon: <MdLocationOn /> },
        { id: "privacy", label: "Privacy & Security", icon: <MdSecurity /> },
        { id: "preferences", label: "App Preferences", icon: <MdPalette /> },
    ];

    const handleProfileUpdate = () => {
        // TODO: Implement API call to update profile
        console.log("Profile updated:", profile);
        setIsEditing(false);
        alert("Profile updated successfully!");
    };

    const handleNotificationToggle = (key: keyof NotificationSettings) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            // TODO: Implement account deletion
            console.log("Account deletion requested");
            alert("Account deletion request submitted. You will receive a confirmation email.");
        }
    };

    const handleDownloadData = () => {
        // TODO: Implement data download
        console.log("Downloading user data...");
        alert("Your data download will begin shortly. You'll receive an email when it's ready.");
    };

    const handleSaveAndUpdations = () => {
        // TODO: Implement API call to update preferences
        console.log("Preferences saved:", { pickupPrefs, theme, language });
        setShowSuccessMessage(true);

        // Hide message after 3 seconds
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex flex-1">
                <DashboardSidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50 md:ml-80">
                    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <Link
                                    href="/citizen/book-recycle"
                                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4 transition-colors"
                                >
                                    <MdArrowBack className="text-xl" />
                                    Back to Dashboard
                                </Link>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
                                <p className="text-xl text-gray-600">Manage your account and preferences</p>
                            </div>

                            {/* Tabs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
                                <div className="flex border-b border-gray-200">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className="text-xl">{tab.icon}</span>
                                            <span className="hidden md:inline">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                                {/* Account Settings */}
                                {activeTab === "account" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
                                                <p className="text-gray-600 mt-1">Update your personal details</p>
                                            </div>
                                            {!isEditing ? (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <MdEdit />
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleProfileUpdate}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <MdSave />
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        <MdCancel />
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-green-500" : "bg-gray-50"
                                                        }`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={profile.email}
                                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                        disabled={!isEditing}
                                                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-green-500" : "bg-gray-50"
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={profile.phone}
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                        disabled={!isEditing}
                                                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-green-500" : "bg-gray-50"
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span> </label>
                                                <input
                                                    type="text"
                                                    value={profile.city}
                                                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-green-500" : "bg-gray-50"
                                                        }`}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <textarea
                                                    value={profile.address}
                                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                    disabled={!isEditing}
                                                    rows={3}
                                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-green-500" : "bg-gray-50"
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Current Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter current password"
                                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                        />
                                                        <button
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        New Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                onClick={() => handleSaveAndUpdations()} >
                                                Update Password
                                            </button>
                                            {showSuccessMessage && (
                                                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                                    <MdCheckCircle className="text-green-600 text-xl mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-green-900 font-medium">Password Updated</p>
                                                        <p className="text-sm text-green-700 mt-1">
                                                            Your password have been updated successfully.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Notification Settings */}
                                {activeTab === "notifications" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                                            <p className="text-gray-600">Choose how you want to be notified</p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { key: "emailNotifications", label: "Email Notifications", description: "Receive updates via email" },
                                                { key: "smsNotifications", label: "SMS Notifications", description: "Receive text message alerts" },
                                                { key: "pickupReminders", label: "Pickup Reminders", description: "Get reminded before scheduled pickups" },
                                                { key: "statusUpdates", label: "Status Updates", description: "Notifications when request status changes" },
                                                { key: "promotionalEmails", label: "Promotional Emails", description: "Receive news and special offers" },
                                            ].map((item) => (
                                                <div
                                                    key={item.key}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notifications[item.key as keyof NotificationSettings]}
                                                            onChange={() => handleNotificationToggle(item.key as keyof NotificationSettings)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pickup Preferences */}
                                {activeTab === "pickup" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pickup Preferences</h2>
                                            <p className="text-gray-600">Set your default pickup preferences</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Default Pickup Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={pickupPrefs.defaultAddress}
                                                onChange={(e) => setPickupPrefs({ ...pickupPrefs, defaultAddress: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Time Slot <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={pickupPrefs.preferredTimeSlot}
                                                onChange={(e) => setPickupPrefs({ ...pickupPrefs, preferredTimeSlot: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            >
                                                <option>09:00 AM - 11:00 AM</option>
                                                <option>11:00 AM - 01:00 PM</option>
                                                <option>01:00 PM - 03:00 PM</option>
                                                <option>03:00 PM - 05:00 PM</option>
                                                <option>05:00 PM - 07:00 PM</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Special Instructions
                                            </label>
                                            <textarea
                                                value={pickupPrefs.specialInstructions}
                                                onChange={(e) => setPickupPrefs({ ...pickupPrefs, specialInstructions: e.target.value })}
                                                rows={4}
                                                placeholder="Any special instructions for the pickup team..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>

                                        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            onClick={() => handleSaveAndUpdations()}
                                        >
                                            Save Preferences
                                        </button>

                                        {showSuccessMessage && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                                <MdCheckCircle className="text-green-600 text-xl mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-green-900 font-medium">Preferences Saved</p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Your pickup preferences have been updated successfully.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Privacy & Security */}
                                {activeTab === "privacy" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Security</h2>
                                            <p className="text-gray-600">Manage your data and security settings</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <MdSecurity className="text-blue-600 text-2xl mt-1" />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                                                        <p className="text-sm text-gray-700 mb-4">
                                                            Add an extra layer of security to your account
                                                        </p>
                                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                            Enable 2FA
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 mb-4">Data Management</h3>
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={handleDownloadData}
                                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <MdDownload className="text-green-600 text-xl" />
                                                            <div className="text-left">
                                                                <p className="font-medium text-gray-900">Download Your Data</p>
                                                                <p className="text-sm text-gray-600">Get a copy of your information</p>
                                                            </div>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        className="w-full flex items-center justify-between p-4 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <MdDelete className="text-red-600 text-xl" />
                                                            <div className="text-left">
                                                                <p className="font-medium text-red-900">Delete Account</p>
                                                                <p className="text-sm text-red-600">Permanently remove your account</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* App Preferences */}
                                {activeTab === "preferences" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">App Preferences</h2>
                                            <p className="text-gray-600">Customize your app experience</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MdPalette className="text-xl" />
                                                    Theme
                                                </div>
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {["light", "dark", "auto"].map((themeOption) => (
                                                    <button
                                                        key={themeOption}
                                                        onClick={() => setTheme(themeOption)}
                                                        className={`p-4 border-2 rounded-lg transition-all capitalize ${theme === themeOption
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-200 hover:border-green-300"
                                                            }`}
                                                    >
                                                        {themeOption === "light" && "☀️ Light"}
                                                        {themeOption === "dark" && "🌙 Dark"}
                                                        {themeOption === "auto" && "🔄 Auto"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MdLanguage className="text-xl" />
                                                    Language
                                                </div>
                                            </label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                                <option value="zh">中文</option>
                                            </select>
                                        </div>
                                        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            onClick={() => handleSaveAndUpdations()}
                                        >
                                            Save Preferences
                                        </button>

                                        {showSuccessMessage && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                                <MdCheckCircle className="text-green-600 text-xl mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-green-900 font-medium">Preferences Saved</p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Your app preferences have been updated successfully.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
