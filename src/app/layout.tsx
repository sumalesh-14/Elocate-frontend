import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import NextTopLoader from 'nextjs-toploader';
import { ChatWidget } from "@/components/ChatBot/ChatWidget";
import ConditionalLayout from "./ConditionalLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "ELocate",
  description: "ELocate - One stop solution to Recycle E-Waste, E-waste Facility Locator",
  icons: {
    icon: '/favicon.ico',
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

      <body className={poppins.className}>
        <NextTopLoader color="#28af60" showSpinner={false} />
        <ConditionalLayout>{children}</ConditionalLayout>
        <ChatWidget />
      </body>
    </html>
  );
}
