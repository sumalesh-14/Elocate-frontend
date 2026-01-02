"use client";

import { usePathname, useRouter } from "next/navigation";
import Script from "next/script";
import NextTopLoader from 'nextjs-toploader';
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

    const isAuthRoute = pathname === '/sign-in' || pathname?.startsWith('/sign-up');
    const isAdminRoute = pathname?.startsWith('/admin');
    const isPublicRoute = pathname === '/' || pathname === '/citizen' || pathname?.startsWith('/citizen/about') || pathname?.startsWith('/citizen/contactus') || pathname?.startsWith('/citizen/recycle');

    useEffect(() => {
        if (mounted && !isAuthRoute && !isPublicRoute && !isAuthenticated()) {
            router.replace('/sign-in');
        }
    }, [isAuthRoute, isPublicRoute, router, mounted]);

    // During hydration, render common shell to avoid mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen bg-white">
                <NextTopLoader color="#28af60" showSpinner={false} />
                <div className="pt-[80px]">{children}</div>
            </div>
        );
    }

    // Auth routes (sign-in, sign-up)
    if (isAuthRoute) {
        return <>{children}</>;
    }

    // Strict authentication check
    if (!isAuthenticated() && !isPublicRoute) {
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
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // Citizen/Intermediary routes with Navbar and Footer
    return (
        <>
            <NextTopLoader color="#28af60" showSpinner={false} />
            <Navbar />
            <main className="pt-[80px]">
                {children}
            </main>
            <Footer />
            <Script
                id="tawk_chatbot"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script");
                var s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/656e84bbbfb79148e59a22a3/1hgrrd06h';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
                s1.onerror = function() { console.warn("Tawk.to failed to load"); };
              })();
            `,
                }}
            />
        </>
    );
}
