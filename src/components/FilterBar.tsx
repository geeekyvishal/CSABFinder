"use client";

import { FilterState } from "@/types/vacancy";
import { INDIAN_STATES, CATEGORIES, SEAT_POOLS, QUOTAS, MAJOR_BRANCHES } from "@/data/states";
import { 
  Search, 
  MapPin, 
  UserCheck, 
  Users, 
  Building2, 
  RotateCcw, 
  SlidersHorizontal,
  GraduationCap,
  TrendingUp,
  Sliders
} from "lucide-react";
import institutesData from "@/data/institutes.json";

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
}

export function FilterBar({ filters, setFilters, totalMatches }: FilterBarProps) {
  const handleReset = () => {
    setFilters({
      searchQuery: "",
      homeState: "ALL",
      category: "ALL",
      seatPool: "ALL",
      instituteType: "ALL",
      instituteName: "ALL",
      programName: "ALL",
      quota: "ALL",
      minVacancy: 1,
      eligibilityFilter: "ALL",
      showCutoff2025: false,
      showCutoff2024: false,
    });
  };

  return (
    <div className="bg-white border border-black/[0.08] p-5 rounded-2xl shadow-sm mb-6 space-y-4">
      {/* Top Search & State Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Query */}
        <div className="md:col-span-6 relative">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1.5 flex items-center gap-1">
            <Search className="h-3 w-3 text-[#0071e3]" />
            Search Institute, Branch or Code
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. NIT Trichy, Computer Science, 201, AI..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 pl-9 text-xs sm:text-sm text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all font-normal"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* State of Eligibility (Home State Auto Engine) */}
        <div className="md:col-span-6">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] mb-1.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#0071e3]" />
            State of Eligibility (Home State)
          </label>
          <select
            value={filters.homeState}
            onChange={(e) => setFilters((prev) => ({ ...prev, homeState: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-[#0071e3]/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all cursor-pointer font-medium"
          >
            <option value="ALL">Select Your State (Auto-tags HS vs OS Quotas)</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} {s.hasNIT ? "(Has NIT)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Category, Seat Pool, College Type, Quota */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            Seat Pool
          </label>
          <select
            value={filters.seatPool}
            onChange={(e) => setFilters((prev) => ({ ...prev, seatPool: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
          >
            {SEAT_POOLS.map((sp) => (
              <option key={sp} value={sp}>
                {sp === "ALL" ? "All Seat Pools" : sp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            College Type
          </label>
          <select
            value={filters.instituteType}
            onChange={(e) => setFilters((prev) => ({ ...prev, instituteType: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
          >
            <option value="ALL">All Colleges (NIT/IIIT/GFTI)</option>
            <option value="NIT">NITs Only (32)</option>
            <option value="IIIT">IIITs Only (39)</option>
            <option value="GFTI">GFTIs Only (43)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            Quota
          </label>
          <select
            value={filters.quota}
            onChange={(e) => setFilters((prev) => ({ ...prev, quota: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
          >
            {QUOTAS.map((q) => (
              <option key={q} value={q}>
                {q === "ALL" ? "All Quotas" : `Quota: ${q}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cutoff Columns Toggle Bar */}
      <div className="p-3 bg-[#f5f5f7] rounded-xl border border-black/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#0071e3]" />
          <span className="font-semibold text-[#1d1d1f]">Previous Year Cutoffs Columns:</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#1d1d1f]">
            <input
              type="checkbox"
              checked={filters.showCutoff2025}
              onChange={(e) => setFilters((prev) => ({ ...prev, showCutoff2025: e.target.checked }))}
              className="accent-[#0071e3] h-4 w-4 rounded cursor-pointer"
            />
            <span>Show 2025 Cutoff (OR - CR)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#1d1d1f]">
            <input
              type="checkbox"
              checked={filters.showCutoff2024}
              onChange={(e) => setFilters((prev) => ({ ...prev, showCutoff2024: e.target.checked }))}
              className="accent-[#0071e3] h-4 w-4 rounded cursor-pointer"
            />
            <span>Show 2024 Cutoff (OR - CR)</span>
          </label>
        </div>
      </div>

      {/* Row 3: Branch filter, Specific College dropdown, Minimum seats slider, & Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-2 border-t border-black/[0.06]">
        <div className="md:col-span-4">
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            Popular Branch
          </label>
          <select
            value={filters.programName}
            onChange={(e) => setFilters((prev) => ({ ...prev, programName: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
          >
            <option value="ALL">All Engineering Branches</option>
            {MAJOR_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            Specific College
          </label>
          <select
            value={filters.instituteName}
            onChange={(e) => setFilters((prev) => ({ ...prev, instituteName: e.target.value }))}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] truncate"
          >
            <option value="ALL">All 114 Colleges</option>
            {institutesData.map((inst) => (
              <option key={inst.name} value={inst.name}>
                [{inst.type}] {inst.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#86868b] font-medium text-[11px]">Min Seats:</span>
              <span className="font-semibold text-[#0071e3] text-xs">{filters.minVacancy}+</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={filters.minVacancy}
              onChange={(e) => setFilters((prev) => ({ ...prev, minVacancy: parseInt(e.target.value) || 1 }))}
              className="w-full accent-[#0071e3] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap self-end"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
