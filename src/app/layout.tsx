import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CSAB Vacancies 2024 — Official Seat Intelligence Portal",
  description: "Find vacant seats in CSAB Special Rounds across 114 NITs, IIITs & GFTIs. Filter by Home State, Category, Seat Pool, and College preferences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen flex flex-col bg-[#f5f5f7] text-[#1d1d1f] antialiased">
        <Navbar />
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
