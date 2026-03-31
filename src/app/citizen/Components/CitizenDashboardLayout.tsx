"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard,
    Recycle,
    History,
    Wallet,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CitizenDashboardLayoutProps {
    children: React.ReactNode;
}

export const CitizenDashboardLayout: React.FC<CitizenDashboardLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    React.useEffect(() => {
        const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
        window.addEventListener('toggle-citizen-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-citizen-sidebar', handleToggle);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/citizen/book-recycle' },
        { id: 'request', label: 'Recycle Request', icon: Recycle, href: '/citizen/book-recycle/new' },
        { id: 'history', label: 'My Requests', icon: History, href: '/citizen/book-recycle/requests' },
        { id: 'wallet', label: 'My Wallet', icon: Wallet, href: '/citizen/book-recycle/wallet' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">

            {/* Sidebar */}
            <aside className={`
        fixed md:sticky top-24 left-0 z-40 md:h-[calc(100vh-96px)] w-72 bg-white/80 backdrop-blur-md text-gray-900 transition-transform duration-300 border-r border-gray-100 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
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
                                        ? 'bg-eco-50 text-eco-700 font-semibold shadow-sm border border-eco-100'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-eco-600'}
                `}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <Icon size={18} className={isActive ? 'text-eco-600' : 'text-gray-400 group-hover:text-eco-500 transition-colors'} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="text-eco-500 opacity-70" />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <div className="h-24 shrink-0"></div>
                <main className={`flex-1 flex flex-col scroll-smooth relative ${pathname === '/citizen/book-recycle/requests' ? 'p-0' : 'p-6 lg:p-10'}`}>
                    <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>
                    <div className={`w-full relative z-10 ${pathname === '/citizen/book-recycle/requests' ? 'px-0 pb-0 flex-1 flex flex-col' : 'pb-10 px-2'}`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );

};
