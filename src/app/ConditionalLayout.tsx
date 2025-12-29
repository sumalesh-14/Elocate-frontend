"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import NextTopLoader from 'nextjs-toploader';
import Navbar from "./citizen/Header/Navbar";
import Footer from "./citizen/Footer/Footer";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthRoute = pathname === '/sign-in' || pathname?.startsWith('/sign-up');
    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute || isAuthRoute) {
        return <>{children}</>;
    }

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
              })();
            `,
                }}
            />
        </>
    );
}
