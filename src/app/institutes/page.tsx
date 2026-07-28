"use client";

import { useState, useMemo } from "react";
import institutesData from "@/data/institutes.json";
import { Building2, Search, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function InstitutesPage() {
  const [query, setQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return institutesData.filter((inst) => {
      if (typeFilter !== "ALL" && inst.type !== typeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchState = inst.state.toLowerCase().includes(q);
        const matchCode = inst.code.toString().includes(q);
        if (!matchName && !matchState && !matchCode) return false;
      }
      return true;
    });
  }, [query, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
          <Building2 className="h-3.5 w-3.5" />
          <span>CSAB 2024 College Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
          All 114 Participating <span className="text-[#0071e3]">Colleges</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg mx-auto mt-1">
          Explore summary metrics, state locations, total vacant seats, and programs across 32 NITs, 39 IIITs, and 43 GFTIs.
        </p>
      </div>

      {/* Search & Type Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search college name, code, or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 pl-9 text-xs sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["ALL", "NIT", "IIIT", "GFTI"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                typeFilter === t
                  ? "bg-[#0071e3] text-white font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "ALL" ? "All (114)" : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inst) => (
          <div
            key={inst.name}
            className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  inst.type === "NIT"
                    ? "bg-blue-50 text-[#0071e3]"
                    : inst.type === "IIIT"
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-purple-50 text-purple-600"
                }`}>
                  {inst.type}
                </span>

                <span className="text-[11px] font-mono text-[#86868b]">
                  Code: {inst.code}
                </span>
              </div>

              <h3 className="font-semibold text-[#1d1d1f] text-sm leading-snug line-clamp-2 mb-2">
                {inst.name}
              </h3>

              <p className="text-xs text-[#86868b] flex items-center gap-1 mb-4">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                State: <strong className="text-[#1d1d1f] font-medium">{inst.state}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#86868b] block text-[10px]">Total Vacant Seats</span>
                <span className="font-bold text-[#0071e3] text-sm">{inst.totalVacancies} Seats</span>
              </div>

              <Link
                href={`/?searchQuery=${encodeURIComponent(inst.name)}`}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-[#0071e3] hover:bg-blue-50 font-medium text-xs flex items-center gap-1"
              >
                <span>View Seats</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
