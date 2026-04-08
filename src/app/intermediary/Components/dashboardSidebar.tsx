"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Settings,
    Truck,
    Calendar,
    BarChart2,
    Contact,
    Banknote,
    Receipt,
    ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
    onNavigate?: () => void;
}

const navGroups = [
    {
        title: "Overview",
        items: [
            { name: "Dashboard", path: "/intermediary", icon: LayoutDashboard },
        ],
    },
    {
        title: "Operations",
        items: [
            { name: "Collections", path: "/intermediary/collections", icon: Package },
            { name: "Assign Drivers", path: "/intermediary/assign-drivers", icon: Truck },
            { name: "Schedule", path: "/intermediary/schedule", icon: Calendar },
        ],
    },
    {
        title: "Management",
        items: [
            { name: "Drivers", path: "/intermediary/drivers", icon: Contact },
            { name: "Withdrawals", path: "/intermediary/withdrawals", icon: Banknote },
            { name: "Transactions", path: "/intermediary/transactions", icon: Receipt },
            { name: "Reports", path: "/intermediary/reports", icon: BarChart2 },
            { name: "Settings", path: "/intermediary/settings", icon: Settings },
        ],
    },
];

const DashboardSidebar = ({ onNavigate }: DashboardSidebarProps) => {
    const pathname = usePathname();

    return (
        <nav className="p-4 space-y-8">
            <style>{`
        .sidebar-nav-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 20px; }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

            {navGroups.map((group, idx) => (
                <div key={idx}>
                    <h3 className="px-4 text-[11px] font-bold text-eco-500 uppercase tracking-widest mb-3 opacity-80">
                        {group.title}
                    </h3>
                    <div className="space-y-1.5">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            // Exact match for dashboard root, prefix match for sub-routes
                            const isActive =
                                item.path === "/intermediary"
                                    ? pathname === "/intermediary" || pathname === "/intermediary/dashboard"
                                    : pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={onNavigate}
                                    className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive
                                            ? "bg-gradient-to-r from-tech-lime to-emerald-400 text-eco-900 font-semibold shadow-lg"
                                            : "text-eco-300 hover:bg-white/5 hover:text-white"}
                  `}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <Icon
                                            size={18}
                                            className={
                                                isActive
                                                    ? "text-eco-900"
                                                    : "text-eco-400 group-hover:text-tech-lime transition-colors"
                                            }
                                        />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    {isActive && <ChevronRight size={16} className="text-eco-900 opacity-70" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
};

export default DashboardSidebar;