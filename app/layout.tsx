import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import MetaPixel from "@/components/tracking/MetaPixel";
import Clarity from "@/components/tracking/Clarity";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";
import TikTokPixel from "@/components/tracking/TikTokPixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afnan Mahmud",
  description: "Learn development with hands-on courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MetaPixel />
        <Clarity />
        <GoogleTagManager />
        <TikTokPixel />
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
