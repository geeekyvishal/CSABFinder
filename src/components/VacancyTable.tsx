"use client";

import { VacancyItem, CutoffData } from "@/types/vacancy";
import { useState, useEffect } from "react";
import { 
  Bookmark, 
  BookmarkCheck, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  GraduationCap,
  Sparkles,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import cutoffsDataRaw from "@/data/cutoffs.json";

const cutoffsData = cutoffsDataRaw as Record<string, CutoffData>;

interface TableProps {
  vacancies: VacancyItem[];
  userHomeState: string;
  showRound1?: boolean;
  showRound2?: boolean;
  showRound3?: boolean;
  userRank?: string;
  rankDelta?: number;
}

export function VacancyTable({ 
  vacancies, 
  userHomeState,
  showRound1 = true,
  showRound2 = false,
  showRound3 = false,
  userRank = "",
  rankDelta = 10000
}: TableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [shortlist, setShortlist] = useState<number[]>([]);
  const [sortField, setSortField] = useState<keyof VacancyItem>("vacancy");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const numericRank = userRank ? Number(userRank) : null;

  useEffect(() => {
    const saved = localStorage.getItem("csab_shortlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortlist(parsed.map((item: VacancyItem) => item.id));
      } catch (e) {
        setShortlist([]);
      }
    }
  }, []);

  const toggleBookmark = (item: VacancyItem) => {
    const saved = localStorage.getItem("csab_shortlist");
    let currentList: VacancyItem[] = [];
    if (saved) {
      try {
        currentList = JSON.parse(saved);
      } catch (e) {
        currentList = [];
      }
    }

    const exists = currentList.some((x) => x.id === item.id);
    let updated: VacancyItem[] = [];
    if (exists) {
      updated = currentList.filter((x) => x.id !== item.id);
    } else {
      updated = [...currentList, item];
    }

    localStorage.setItem("csab_shortlist", JSON.stringify(updated));
    setShortlist(updated.map((x) => x.id));
    window.dispatchEvent(new Event("storage"));
  };

  const handleSort = (field: keyof VacancyItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getCutoff = (item: VacancyItem): CutoffData | undefined => {
    const key = `${item.instituteCode}_${item.programCode}_${item.quota}_${item.category}_${item.seatPool}`;
    return cutoffsData[key];
  };

  // Rank Chance Calculation (Worst case of all 2025 rounds = maxCr)
  const getRankChance = (cutoff?: CutoffData) => {
    if (!numericRank || !cutoff || !cutoff.maxCr) return null;
    const maxCr = cutoff.maxCr;

    if (numericRank <= maxCr) {
      return { level: "HIGH", label: "High Chance", color: "emerald" };
    }
    if (numericRank <= maxCr + rankDelta) {
      return { level: "MODERATE", label: "Moderate Chance", color: "amber" };
    }
    return { level: "LOW", label: "Low Chance", color: "rose" };
  };

  const sortedVacancies = [...vacancies].sort((a, b) => {
    let aVal = a[sortField] ?? "";
    let bVal = b[sortField] ?? "";
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedVacancies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedVacancies.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [vacancies.length, itemsPerPage]);

  const totalColumns = 7 + (showRound1 ? 1 : 0) + (showRound2 ? 1 : 0) + (showRound3 ? 1 : 0) + (numericRank ? 1 : 0);

  return (
    <div className="space-y-3.5 w-full">
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-black/[0.08] shadow-sm">
        <div className="text-xs text-[#515154] font-medium flex items-center gap-2 flex-wrap">
          <span>Showing <strong className="text-[#0071e3] font-semibold">{sortedVacancies.length.toLocaleString()}</strong> vacant options</span>
          {userHomeState && userHomeState !== "ALL" && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] font-medium">
              State: {userHomeState}
            </span>
          )}
          {numericRank && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              Rank: {numericRank.toLocaleString()} (Buffer: ±{rankDelta.toLocaleString()})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ExportMenu items={sortedVacancies} userState={userHomeState} buttonText="Export Options" />

          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-[#f5f5f7] text-xs text-[#1d1d1f] border border-black/[0.08] rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
          >
            <option value={15}>15 Per Page</option>
            <option value={25}>25 Per Page</option>
            <option value={50}>50 Per Page</option>
            <option value={100}>100 Per Page</option>
          </select>
        </div>
      </div>

      {/* Main Full-Width Table */}
      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06] text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#1d1d1f] transition-colors"
                  onClick={() => handleSort("instituteName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Institute / College</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#1d1d1f] transition-colors"
                  onClick={() => handleSort("programName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Program / Branch</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Quota</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Seat Pool</th>

                {/* Vacant Seats */}
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#1d1d1f] transition-colors text-right"
                  onClick={() => handleSort("vacancy")}
                >
                  <div className="flex items-center gap-1 justify-end">
                    <span>Vacant Seats</span>
                    <ArrowUpDown className="h-3 w-3 text-[#0071e3]" />
                  </div>
                </th>

                {/* Cutoff Columns AFTER Vacant Seats */}
                {showRound1 && (
                  <th className="py-3.5 px-4 text-[#0071e3] font-bold whitespace-nowrap">2025 Round 1 Cutoff</th>
                )}

                {showRound2 && (
                  <th className="py-3.5 px-4 text-indigo-600 font-bold whitespace-nowrap">2025 Round 2 Cutoff</th>
                )}

                {showRound3 && (
                  <th className="py-3.5 px-4 text-purple-600 font-bold whitespace-nowrap">2025 Round 3 Cutoff</th>
                )}

                {/* Rank Admission Chance Column */}
                {numericRank && (
                  <th className="py-3.5 px-4 text-center font-bold text-gray-700 whitespace-nowrap">Admission Chance</th>
                )}

                <th className="py-3.5 px-4 text-center">Bookmark</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/[0.04]">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className="py-12 text-center text-[#86868b]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="h-8 w-8 text-gray-300" />
                      <p className="font-semibold text-[#1d1d1f]">No vacant seats match your filter criteria.</p>
                      <p className="text-xs text-[#86868b]">Try adjusting State of Eligibility, Rank Buffer, or Category filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const isBookmarked = shortlist.includes(item.id);
                  const isHS = item.quota === "HS";
                  const isOS = item.quota === "OS";
                  const isUserHomeCollege = userHomeState !== "ALL" && userHomeState && item.instituteState.toLowerCase() === userHomeState.toLowerCase();

                  const cutoff = getCutoff(item);
                  const chance = getRankChance(cutoff);

                  // Row highlight styling if Rank entered
                  let rowBgClass = "hover:bg-[#f5f5f7]/60";
                  if (chance) {
                    if (chance.level === "HIGH") {
                      rowBgClass = "bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500";
                    } else if (chance.level === "MODERATE") {
                      rowBgClass = "bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500";
                    } else {
                      rowBgClass = "bg-[#f5f5f7]/40 hover:bg-gray-100/60";
                    }
                  }

                  return (
                    <tr 
                      key={item.id}
                      className={`${rowBgClass} transition-colors group`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-gray-400 text-xs">
                        {startIndex + idx + 1}
                      </td>

                      <td className="py-3 px-4 max-w-sm sm:max-w-md">
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.instituteType === "NIT" 
                              ? "bg-blue-50 text-[#0071e3] border border-blue-200/60"
                              : item.instituteType === "IIIT"
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
                              : "bg-purple-50 text-purple-600 border border-purple-200/60"
                          }`}>
                            {item.instituteType}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors leading-tight">
                              {item.instituteName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#86868b]">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {item.instituteState}
                              </span>
                              <span>•</span>
                              <span>Code: {item.instituteCode}</span>
                              {isUserHomeCollege && (
                                <span className="px-1.5 py-0.2 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                  Home College
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-[#1d1d1f] flex items-start gap-1.5">
                          <GraduationCap className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <span>{item.programName}</span>
                            <p className="text-[10px] text-[#86868b] mt-0.5">Code: {item.programCode}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                          isHS 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isOS
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-sky-50 text-sky-700 border border-sky-200"
                        }`}>
                          {item.quota}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          item.seatPool.includes("Female")
                            ? "bg-pink-50 text-pink-700 border border-pink-200"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.seatPool.includes("Female") ? "Female-Only" : "Gender-Neutral"}
                        </span>
                      </td>

                      {/* Vacant Seats Column */}
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-[#0071e3]/10 text-[#0071e3]">
                          {item.vacancy} {item.vacancy === 1 ? "Seat" : "Seats"}
                        </span>
                      </td>

                      {/* 2025 Round 1 Cutoff Column */}
                      {showRound1 && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          {cutoff && cutoff.r1 ? (
                            <div className="flex flex-col text-xs font-mono leading-snug">
                              <span className="font-semibold text-[#0071e3]">OR: {cutoff.r1.or.toLocaleString()}</span>
                              <span className="font-semibold text-[#1d1d1f]">CR: {cutoff.r1.cr.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">N/A</span>
                          )}
                        </td>
                      )}

                      {/* 2025 Round 2 Cutoff Column */}
                      {showRound2 && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          {cutoff && cutoff.r2 ? (
                            <div className="flex flex-col text-xs font-mono leading-snug">
                              <span className="font-semibold text-indigo-600">OR: {cutoff.r2.or.toLocaleString()}</span>
                              <span className="font-semibold text-[#1d1d1f]">CR: {cutoff.r2.cr.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">N/A</span>
                          )}
                        </td>
                      )}

                      {/* 2025 Round 3 Cutoff Column */}
                      {showRound3 && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          {cutoff && cutoff.r3 ? (
                            <div className="flex flex-col text-xs font-mono leading-snug">
                              <span className="font-semibold text-purple-600">OR: {cutoff.r3.or.toLocaleString()}</span>
                              <span className="font-semibold text-[#1d1d1f]">CR: {cutoff.r3.cr.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">N/A</span>
                          )}
                        </td>
                      )}

                      {/* Admission Chance Column */}
                      {numericRank && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {chance ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              chance.level === "HIGH"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : chance.level === "MODERATE"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}>
                              {chance.level === "HIGH" && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                              {chance.level === "MODERATE" && <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                              {chance.level === "LOW" && <XCircle className="h-3.5 w-3.5 text-rose-600" />}
                              <span>{chance.label}</span>
                            </span>
                          ) : (
                            <span className="text-gray-300 italic text-xs">No Data</span>
                          )}
                        </td>
                      )}

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleBookmark(item)}
                          className={`p-1.5 rounded-full transition-all ${
                            isBookmarked
                              ? "bg-amber-100 text-amber-600 border border-amber-300"
                              : "bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                          }`}
                          title={isBookmarked ? "Remove from Shortlist" : "Add to Shortlist"}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4 fill-amber-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border-t border-black/[0.06] text-xs">
            <div className="text-[#86868b]">
              Page <strong className="text-[#1d1d1f]">{currentPage}</strong> of <strong className="text-[#1d1d1f]">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium ${
                        currentPage === pageNum
                          ? "bg-[#0071e3] text-white font-bold"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
