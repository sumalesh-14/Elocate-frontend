"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    MdDashboard,
    MdRecycling,
    MdHistory,
    MdSupportAgent,
    MdSettings,
    MdLogout,
    MdMenu,
} from "react-icons/md";

interface DashboardSidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    userStats?: {
        co2Diverted: string;
    };
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userStats = { co2Diverted: "124 kg" },
}) => {
    const pathname = usePathname();

    const navigationItems = [
        {
            label: "Dashboard",
            href: "/citizen/book-recycle",
            icon: <MdDashboard className="text-2xl" />,
        },
        {
            label: "Recycle Request",
            href: "/citizen/book-recycle/new",
            icon: <MdRecycling className="text-2xl" />,
        },
        {
            label: "My Requests",
            href: "/citizen/book-recycle/requests",
            icon: <MdHistory className="text-2xl" />,
        },
        // {
        //     label: "Support",
        //     href: "/support",
        //     icon: <MdSupportAgent className="text-2xl" />,
        // },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                        E
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">E-Cycle</h1>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-500 hover:text-green-600"
                >
                    <MdMenu className="text-2xl" />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`${isMobileMenuOpen ? "block" : "hidden"
                    } md:flex flex-col w-full md:w-80 bg-white border-r border-gray-200 md:fixed md:left-0 md:top-30 md:h-[calc(100vh-5rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto z-20 shadow-lg md:shadow-none`}
            >
                <div className="p-6 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-8">
                        {/* Logo - Commented out as per user's preference */}
                        {/* <div className="hidden md:flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-sm text-2xl">
                E
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold leading-normal text-gray-900">E-Cycle</h1>
                <p className="text-green-600 text-base font-medium leading-normal">Manage Waste</p>
              </div>
            </div> */}

                        {/* Navigation */}
                        <nav className="flex flex-col gap-4">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-colors ${isActive(item.href)
                                        ? "bg-green-50 border-l-4 border-green-500"
                                        : "hover:bg-gray-100"
                                        }`}
                                >
                                    <div
                                        className={`${isActive(item.href)
                                            ? "text-green-500"
                                            : "text-gray-500 group-hover:text-green-500"
                                            }`}
                                    >
                                        {item.icon}
                                    </div>
                                    <p
                                        className={`text-xl ${isActive(item.href)
                                            ? "text-gray-900 font-medium"
                                            : "text-gray-700 font-medium"
                                            }`}
                                    >
                                        {item.label}
                                    </p>
                                </Link>
                            ))}

                            <div className="my-3 border-t border-gray-200"></div>

                            <Link
                                href="/citizen/book-recycle/settings"
                                className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-colors ${isActive("/book-recycle/settings")
                                    ? "bg-green-50 border-l-4 border-green-500"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <MdSettings
                                    className={`text-2xl ${isActive("/book-recycle/settings")
                                        ? "text-green-500"
                                        : "text-gray-500"
                                        }`}
                                />
                                <p
                                    className={`text-xl ${isActive("/book-recycle/settings")
                                        ? "text-gray-900 font-medium"
                                        : "text-gray-700 font-medium"
                                        }`}
                                >
                                    Settings
                                </p>
                            </Link>
                        </nav>
                    </div>

                    {/* Bottom Section */}
                    {/* <div className="flex flex-col gap-4 mt-8">
                        {/* Impact Card */}
                    {/* <div className="bg-gray-900 p-5 rounded-xl relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 rounded-full blur-xl"></div>
                            <p className="text-sm text-green-400 font-bold uppercase tracking-wider mb-2">
                                Your Impact
                            </p>
                            <p className="text-white text-3xl font-bold">{userStats.co2Diverted}</p>
                            <p className="text-gray-400 text-sm">CO₂ diverted this year</p>
                        </div> */}

                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
