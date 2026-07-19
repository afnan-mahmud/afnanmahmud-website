import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import { Toaster } from "sonner";
import MetaPixel from "@/components/tracking/MetaPixel";
import "./globals.css";

const bangla = Hind_Siliguri({
  variable: "--font-bangla",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://course.afnanmahmud.com"),
  title: "Afnan Mahmud — Courses",
  description:
    "AI দিয়ে ওয়েব ও মোবাইল অ্যাপ ডেভেলপমেন্ট শিখুন — বাংলায়, স্টেপ বাই স্টেপ।",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" data-theme="light" className={`${bangla.variable}`}>
      <body className="min-h-screen antialiased">
        <MetaPixel />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
