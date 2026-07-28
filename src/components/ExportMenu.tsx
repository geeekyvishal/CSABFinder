"use client";

import { useState, useRef, useEffect } from "react";
import { VacancyItem } from "@/types/vacancy";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { exportToCSV } from "@/utils/csvExport";
import { exportToPDF } from "@/utils/pdfExport";

interface ExportMenuProps {
  items: VacancyItem[];
  filename?: string;
  userState?: string;
  buttonText?: string;
}

export function ExportMenu({ items, filename, userState, buttonText = "Export Options" }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20 transition-all border border-[#0071e3]/20 shadow-sm"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{buttonText}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-black/[0.08] shadow-lg py-1.5 z-50 text-xs animate-in fade-in-80 slide-in-from-top-2">
          <div className="px-3 py-1 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/[0.04]">
            Select Export Format
          </div>

          <button
            onClick={() => {
              exportToCSV(items, filename || "CSAB_Vacancies.csv");
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2.5 text-left font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <div className="flex flex-col">
              <span>Export as CSV</span>
              <span className="text-[10px] text-[#86868b]">Excel / Spreadsheet format</span>
            </div>
          </button>

          <button
            onClick={() => {
              exportToPDF(items, "CSAB 2024 Vacancy & Choice Locking Report", userState);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2.5 text-left font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] flex items-center gap-2 transition-colors border-t border-black/[0.04]"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            <div className="flex flex-col">
              <span>Export as PDF</span>
              <span className="text-[10px] text-[#86868b]">Printable PDF Report</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
