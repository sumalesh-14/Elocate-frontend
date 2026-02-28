"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard,
    Recycle,
    History,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ChevronRight,
    User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { handleLogout, getUserName, getEmail } from '../sign-in/auth';
import { useToast } from '@/context/ToastContext';

interface CitizenDashboardLayoutProps {
    children: React.ReactNode;
}

export const CitizenDashboardLayout: React.FC<CitizenDashboardLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Listen for custom event from Navbar to toggle sidebar on mobile
    React.useEffect(() => {
        const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
        window.addEventListener('toggle-citizen-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-citizen-sidebar', handleToggle);
    }, []);

    // Menu Items
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/citizen/book-recycle' },
        { id: 'request', label: 'Recycle Request', icon: Recycle, href: '/citizen/book-recycle/new' },
        { id: 'history', label: 'My Requests', icon: History, href: '/citizen/book-recycle/requests' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden h-screen">

            {/* Sidebar */}
            <aside className={`
        fixed md:sticky top-[80px] left-0 z-40 h-[calc(100vh-80px)] w-80 bg-gradient-to-b from-white to-emerald-50/30 border-r border-emerald-100 text-gray-800 transition-transform duration-300 shadow-sm flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>


                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-6 space-y-3 sidebar-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 group relative
                  ${isActive
                                        ? 'bg-eco-600 text-white font-bold shadow-lg shadow-emerald-200/50 scale-[1.02]'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-eco-800 hover:translate-x-2'}
                `}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <Icon size={24} className={isActive ? 'text-white' : 'text-emerald-400 group-hover:text-eco-600 transition-colors'} />
                                    <span className="text-lg">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={18} className="text-white/70" />}
                            </Link>
                        );
                    })}
                </nav>

            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white">
                {/* Space for the fixed navbar */}
                <div className="h-[80px] shrink-0"></div>

                {/* Dynamic Page Content */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto scroll-smooth bg-white">
                    <div className="w-full pb-10 px-2">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
};
