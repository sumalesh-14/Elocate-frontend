"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import logo from "../../../assets/ELocate-s.png";
import DashboardSidebar from "./dashboardSidebar";

interface SidebarProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: SidebarProps) {
    const pathname = usePathname();

    const getPageTitle = (path: string) => {
        const titleMap: Record<string, string> = {
            '/intermediary': 'Intermediary Dashboard',
            '/intermediary/statistics': 'Statistics',
            '/intermediary/collections': 'Collections',
            '/intermediary/clients': 'Clients',
            '/intermediary/settings': 'Settings',
        };
        return titleMap[path] || 'Intermediary Dashboard';
    };

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
                        <span className="user-avatar">I</span>
                        <span className="user-name">Intermediary</span>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    )
}