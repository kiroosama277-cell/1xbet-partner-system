import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "1XBET Affiliate — Partner Registration",
  description: "Register as a 1XBET affiliate partner and get a dedicated promo code for your marketing campaigns. Professional registration flow for partners.",
  keywords: ["1XBET", "affiliate", "promo code", "partner", "registration", "marketing"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`${cairo.variable} ${inter.variable} antialiased bg-background text-foreground font-sans overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
