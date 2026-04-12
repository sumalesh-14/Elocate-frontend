import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import NextTopLoader from 'nextjs-toploader';
import ConditionalLayout from "./ConditionalLayout";
import { ToastProvider } from "@/context/ToastContext";
import ConditionalChatWidget from "./ConditionalChatWidget";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-poppins',
});

import { Outfit, Inter } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: '--font-outfit',
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "ELocate - E-Waste Recycling & Facility Locator in India",
  description: "ELocate helps you find certified e-waste recycling centers near you, book pickups, and dispose of electronic waste responsibly. India's e-waste management platform.",
  keywords: "e-waste recycling, electronic waste disposal, e-waste near me, recycle electronics India, e-waste pickup, certified recyclers, ELocate",
  authors: [{ name: "ELocate" }],
  metadataBase: new URL("https://elocate-ewaste.vercel.app"),
  alternates: {
    canonical: "/citizen",
  },
  openGraph: {
    title: "ELocate - E-Waste Recycling & Facility Locator in India",
    description: "Find certified e-waste recycling centers near you. Book pickups and dispose of electronics responsibly.",
    url: "https://elocate-ewaste.vercel.app/citizen",
    siteName: "ELocate",
    type: "website",
    images: [
      {
        url: "/e-waste-recycling.jpeg",
        width: 1200,
        height: 630,
        alt: "ELocate - E-Waste Recycling Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELocate - E-Waste Recycling & Facility Locator",
    description: "Find certified e-waste recycling centers near you in India.",
    images: ["/e-waste-recycling.jpeg"],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-5QLTMJKRNP"
      ></Script>
      <Script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NQV05PLN3T');
            `,
        }}
      />

      <body className={`${poppins.variable} ${outfit.variable} ${inter.variable} font-sans`}>
        <ToastProvider>
          <NextTopLoader color="#28af60" showSpinner={false} />
          <ConditionalLayout>{children}</ConditionalLayout>
          <ConditionalChatWidget />
        </ToastProvider>
      </body>
    </html>
  );
}
