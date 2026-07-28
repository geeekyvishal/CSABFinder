import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.csab2026.xyz"),
  title: {
    default: "CSAB 2026 Vacancies & Cutoffs — Official Seat Matrix & Rank Predictor",
    template: "%s | CSAB 2026 Vacancies Platform",
  },
  description: "Find vacant seats in CSAB 2026 Special Rounds across 114 NITs, IIITs & GFTIs. Check 2025 Round 1, 2, 3 Opening & Closing Ranks, Home State vs Other State quota, and JEE Main Rank Chance Predictor.",
  keywords: [
    "CSAB 2026",
    "CSAB Vacancies 2026",
    "CSAB Counselling 2026",
    "CSAB Seat Matrix 2026",
    "CSAB Opening and Closing Rank",
    "CSAB Round 1 2 3 Cutoffs",
    "NIT Vacant Seats 2026",
    "IIIT Vacant Seats 2026",
    "GFTI Vacancies",
    "JoSAA CSAB 2026",
    "JEE Main College Predictor 2026",
    "CSAB Special Round Eligibility",
  ],
  authors: [{ name: "CSAB Finder Team", url: "https://www.csab2026.xyz" }],
  creator: "CSAB Finder Platform",
  publisher: "CSAB 2026 Intelligence",
  alternates: {
    canonical: "https://www.csab2026.xyz",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.csab2026.xyz",
    title: "CSAB 2026 Vacancies & Cutoffs — Official Seat Matrix & Rank Predictor",
    description: "Search 15,423 vacant engineering seats across 114 NITs, IIITs & GFTIs. Filter by Home State, Category, CRL Rank & 2025 Special Round Cutoffs.",
    siteName: "CSAB 2026 Vacancies Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSAB 2026 Vacancies & Cutoffs Portal",
    description: "Instant Seat Matrix & Rank Chance Predictor for CSAB 2026 Special Rounds across all 114 NITs, IIITs, GFTIs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSAB 2026 Vacancies & Cutoffs Platform",
  "url": "https://www.csab2026.xyz",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "description": "Comprehensive seat vacancy finder and rank chance predictor for CSAB 2026 Special Rounds counselling across NITs, IIITs, and GFTIs in India.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
  },
  "creator": {
    "@type": "Organization",
    "name": "CSAB Finder Platform",
    "url": "https://www.csab2026.xyz"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f5f5f7] text-[#1d1d1f] antialiased">
        <Navbar />
        <main className="flex-grow max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
