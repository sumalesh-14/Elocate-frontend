"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import logo from "../../../assets/ELocate-s.png";

interface SidebarProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: SidebarProps) {
    const pathname = usePathname();

    // Dynamic page title mapping
    const getPageTitle = (path: string) => {
        const titleMap: Record<string, string> = {
            '/admin': 'Admin Dashboard',
            '/admin/device-categories': 'Device Category Management',
            '/admin/device-brands': 'Device Brand Management',
            '/admin/device-models': 'Device Model Management',
        };
        return titleMap[path] || 'Admin Dashboard';
    };

    const navItems = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: "📊",
        },
        {
            name: "Device Categories",
            path: "/admin/device-categories",
            icon: "📱",
        },
        {
            name: "Device Brands",
            path: "/admin/device-brands",
            icon: "🏷️",
        },
        {
            name: "Device Models",
            path: "/admin/device-models",
            icon: "📦",
        },
    ];

    return (
        <div className="dashboard-container">
            {/* Unified Header - Single Line */}
            <header className="unified-header">
                <div className="header-branding">
                    <Image
                        src={logo}
                        alt="ELocate"
                        width={100}
                        height={100}
                        className="header-logo"
                    />
                    <span className="header-subtitle">E-Waste Management System</span>
                </div>
                <div className="header-content">
                    <h2 className="page-title">{getPageTitle(pathname)}</h2>
                    <div className="user-menu">
                        <span className="user-avatar">A</span>
                        <span className="user-name">Admin</span>
                    </div>
                </div>
            </header>

            {/* Sidebar - Navigation Only */}
            <aside className="sidebar">
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${pathname === item.path ? "active" : ""}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <p className="version">Version 1.0.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">{children}</div>
            </main>
        </div>
    );
}
