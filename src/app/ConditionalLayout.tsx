"use client";

import { usePathname, useRouter } from "next/navigation";

import Navbar from "@/app/citizen/Header/Navbar";
import Footer from "@/app/citizen/Footer/Footer";
import { isAuthenticated } from "@/app/citizen/sign-in/auth";
import { useEffect, useState } from "react";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAuthRoute = pathname.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname === '/citizen/sign-up' || pathname === '/citizen/sign-in' || pathname === '/citizen/sign-up/verify-email';
    const isAdminRoute = pathname?.startsWith('/admin');
    const isPublicRoute = pathname === '/' || pathname === '/citizen/sign-up' || pathname === '/citizen' || pathname?.startsWith('/citizen/about') || pathname?.startsWith('/citizen/contactus') || pathname?.startsWith('/citizen/recycle') || pathname?.startsWith('/citizen/education') || pathname?.startsWith('/citizen/rules') || pathname?.startsWith('/citizen/e-facilities');

    useEffect(() => {
        if (mounted && !isAuthRoute && !isPublicRoute && !isAuthenticated()) {
            router.replace('/sign-in');
        }
    }, [isAuthRoute, isPublicRoute, router, mounted]);

    // We unify the structure to prevent children from remounting when 'mounted' flips to true
    const renderContent = () => {
        // Auth routes (sign-in, sign-up)
        if (isAuthRoute) return children;

        // Strict authentication check
        if (mounted && !isAuthenticated() && !isPublicRoute) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white font-montserrat">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 bg-emerald-100 rounded-full mb-4"></div>
                        <div className="h-4 w-32 bg-gray-100 rounded"></div>
                        <p className="mt-4 text-emerald-600 font-bold">Verifying Session...</p>
                    </div>
                </div>
            );
        }

        // Admin routes
        if (isAdminRoute) return children;

        // Intermediary routes
        if (pathname?.startsWith('/intermediary')) {
            return (
                <div className="flex flex-col min-h-screen bg-white">
                    <main className="flex-grow">{children}</main>
                </div>
            );
        }

        // Citizen routes
        if (pathname?.startsWith('/citizen')) {
            return (
                <div className="flex flex-col min-h-screen bg-white">
                    {mounted && <Navbar />}
                    <main className="flex-grow pt-[80px] md:pt-0">
                        {children}
                    </main>
                    {mounted && (
                        <div className={pathname?.startsWith('/citizen/book-recycle') ? "relative z-[30]" : ""}>
                            <Footer />
                        </div>
                    )}
                </div>
            );
        }

        // Default shell
        return (
            <div className="flex flex-col min-h-screen bg-white pt-[80px]">
                {children}
            </div>
        );
    };

    return renderContent();
}
