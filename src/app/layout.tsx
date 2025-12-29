import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import ConditionalLayout from "./ConditionalLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "ELocate",
  description: "ELocate - One stop solution to Recycle E-Waste, E-waste Facility Locator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/favicon.ico?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head>
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
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
