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
        <div className="min-h-screen bg-slate-50 flex font-sans">

            {/* Sidebar */}
            <aside className={`
        fixed md:sticky top-24 left-0 z-40 md:h-[calc(100vh-96px)] w-72 bg-eco-950 text-white transition-transform duration-300 shadow-2xl flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive
                                        ? 'bg-gradient-to-r from-tech-lime to-emerald-400 text-eco-900 font-semibold shadow-lg'
                                        : 'text-eco-300 hover:bg-white/5 hover:text-white'}
                `}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <Icon size={18} className={isActive ? 'text-eco-900' : 'text-eco-400 group-hover:text-tech-lime transition-colors'} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="text-eco-900 opacity-70" />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                {/* Space for the fixed navbar */}
                <div className="h-24 shrink-0"></div>

                {/* Dynamic Page Content */}
                <main className="flex-1 p-6 lg:p-10 scroll-smooth">
                    <div className="w-full pb-10 px-2">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );

};
