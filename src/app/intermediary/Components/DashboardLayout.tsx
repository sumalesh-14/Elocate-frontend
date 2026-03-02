"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { ReactNode } from 'react';
import DashboardSidebar from './dashboardSidebar';
import { getUser, handleLogout } from '../sign-in/auth';
import { usePathname } from 'next/navigation';

interface LayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const user = getUser();

    const getPageTitle = (path: string) => {
        const titleMap: Record<string, string> = {
            '/intermediary': 'Dashboard',
            '/intermediary/collections': 'Collections',
            '/intermediary/clients': 'Client Directory',
            '/intermediary/settings': 'Settings',
            '/intermediary/assign-drivers': 'Assign Drivers',
            '/intermediary/schedule': 'Schedule',
            '/intermediary/reports': 'Reports',
            '/intermediary/dashboard': 'Dashboard',
        };
        return titleMap[path] || 'Intermediary Portal';
    };

    return (
        <div className="min-h-screen h-screen bg-slate-50 flex font-sans overflow-hidden">

            {/* Mobile backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-eco-950 text-white transition-transform duration-300 shadow-2xl flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                {/* Brand Header */}
                <div className="p-6 flex items-center gap-3 shrink-0 bg-eco-950">
                    <div className="w-10 h-10 bg-gradient-to-br from-tech-lime to-emerald-500 rounded-xl flex items-center justify-center text-eco-950 shadow-lg">
                        <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-display, inherit)' }}>EL</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight">ELocate</h1>
                        <p className="text-[10px] text-eco-400 uppercase tracking-widest">Intermediary Portal</p>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden ml-auto text-eco-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto">
                    <DashboardSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* User Footer */}
                <div className="p-4 bg-black/20 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-tech-lime flex items-center justify-center text-eco-900 font-bold text-xs">
                            {user?.fullname?.charAt(0)?.toUpperCase() || 'I'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                                {user?.fullname || 'Intermediary'}
                            </div>
                            <div className="text-xs text-eco-400 truncate">
                                {user?.email || 'intermediary@elocate.app'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/20 text-eco-200 hover:text-red-300 rounded-lg transition-colors text-sm font-medium border border-white/5 hover:border-red-500/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 shrink-0 px-6 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-eco-900 hover:bg-eco-50 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-eco-900 hidden sm:block">
                            {getPageTitle(pathname)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="hidden md:flex relative group">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-full text-sm w-60 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 focus:bg-white transition-all border border-transparent focus:border-tech-lime text-gray-900 placeholder-gray-500"
                            />
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eco-600 transition-colors" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 text-eco-600 hover:bg-eco-50 rounded-full transition-colors border border-transparent hover:border-eco-100">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {/* User Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tech-lime to-emerald-500 flex items-center justify-center text-eco-900 font-bold text-sm shadow-md">
                            {user?.fullname?.charAt(0)?.toUpperCase() || 'I'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 md:p-10 lg:px-14 overflow-y-auto scroll-smooth">
                    <div className="w-full pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}