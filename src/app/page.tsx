"use client";

import { useState, useMemo } from "react";
import vacanciesData from "@/data/vacancies.json";
import { VacancyItem, FilterState } from "@/types/vacancy";
import { filterVacancies, calculateStats } from "@/utils/vacancyFilter";
import { FilterBar } from "@/components/FilterBar";
import { VacancyTable } from "@/components/VacancyTable";
import { StatsOverview } from "@/components/StatsOverview";
import Link from "next/link";
import { Sparkles, Wand2, ArrowRight, Flame, AlertTriangle } from "lucide-react";

export default function Home() {
  const allVacancies = vacanciesData as VacancyItem[];

  const [filters, setFilters] = useState<FilterState>({
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
    showRound1: true,
    showRound2: false,
    showRound3: false,
    userRank: "",
    rankDelta: 10000,
  });

  const filteredVacancies = useMemo(() => {
    return filterVacancies(allVacancies, filters);
  }, [allVacancies, filters]);

  const stats = useMemo(() => {
    return calculateStats(filteredVacancies);
  }, [filteredVacancies]);

  return (
    <div className="space-y-6 w-full">
      {/* Hero Section - Apple Style */}
      <div className="bg-white border border-black/[0.08] p-6 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden text-center sm:text-left">
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official CSAB 2026 Seat Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] leading-tight">
            Find Vacant Seats in <span className="text-[#0071e3]">CSAB Special Rounds</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
            Search, filter, and compare <strong>15,423 vacant engineering seats</strong> across 114 NITs, IIITs, and GFTIs. Select your state to automatically classify <strong>Home State (HS)</strong> vs <strong>Other State (OS)</strong> seat quotas, toggle 2025 Round Cutoffs, and enter your JEE rank to color-code admission chances.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <Link
              href="/wizard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors shadow-sm"
            >
              <Wand2 className="h-4 w-4" />
              <span>Launch "Find My College" Wizard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/analytics"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors"
            >
              <Flame className="h-4 w-4 text-amber-500" />
              <span>View Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <StatsOverview
        totalSeats={stats.totalSeats}
        totalRecords={stats.totalRecords}
        uniqueInstitutes={stats.uniqueInstitutes}
        uniquePrograms={stats.uniquePrograms}
        nitSeats={stats.nitSeats}
        iiitSeats={stats.iiitSeats}
        gftiSeats={stats.gftiSeats}
        homeStateSelected={filters.homeState}
      />

      {/* Official Data Disclaimer Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start sm:items-center gap-2.5 text-xs text-amber-900 shadow-sm">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-amber-950">Notice to Candidates:</span>{" "}
          <span className="text-[#515154]">
            Data is provided for guidance. Minor discrepancies may exist. Please verify all details from the official CSAB portal (
            <a href="https://csab.nic.in" target="_blank" rel="noreferrer" className="text-[#0071e3] font-semibold underline">
              csab.nic.in
            </a>
          ). We are not responsible for choices locked.
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalMatches={stats.totalRecords}
      />

      {/* Data Table */}
      <VacancyTable
        vacancies={filteredVacancies}
        userHomeState={filters.homeState}
        showRound1={filters.showRound1}
        showRound2={filters.showRound2}
        showRound3={filters.showRound3}
        userRank={filters.userRank}
        rankDelta={filters.rankDelta}
      />
    </div>
  );
}
