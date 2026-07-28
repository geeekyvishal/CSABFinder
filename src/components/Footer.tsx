import Link from "next/link";
import { GraduationCap, ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#f5f5f7] text-[#86868b] py-10 mt-12">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-black text-white flex items-center justify-center font-bold">
                <GraduationCap className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-[#1d1d1f] text-sm">
                CSAB Vacancy Platform 2026
              </span>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed max-w-md">
              Designed for JEE Main aspirants across India. Easily find vacant seats in CSAB Special Rounds across 114 NITs, IIITs, and GFTIs with automatic Home State (HS) vs Other State (OS) classification.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#0071e3] transition-colors">
                  Vacancy Finder
                </Link>
              </li>
              <li>
                <Link href="/wizard" className="hover:text-[#0071e3] transition-colors">
                  College Wizard
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#0071e3] transition-colors">
                  College Comparator
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#0071e3] transition-colors">
                  Analytics & Visual Charts
                </Link>
              </li>
              <li>
                <Link href="/institutes" className="hover:text-[#0071e3] transition-colors">
                  Participating Colleges
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-3">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://csab.nic.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#0071e3] transition-colors"
                >
                  <span>CSAB Official Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://josaa.nic.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#0071e3] transition-colors"
                >
                  <span>JoSAA Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Extracted from CSAB 2026 Official Vacancy Data (15,423 Total Vacancies).</span>
          </div>
          <div>
            CSAB Vacancies 2026 Platform
          </div>
        </div>
      </div>
    </footer>
  );
}
