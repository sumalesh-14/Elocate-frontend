"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Dashboard",
            path: "/intermediary",
            icon: "📊",
        },
        {
            name: "Collections",
            path: "/intermediary/collections",
            icon: "📦",
        },
        {
            name: "Clients",
            path: "/intermediary/clients",
            icon: "👥",
        },
        {
            name: "Settings",
            path: "/intermediary/settings",
            icon: "⚙️",
        },
    ];

    return (
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
    );
}

export default DashboardSidebar;