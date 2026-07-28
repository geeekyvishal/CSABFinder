"use client";

import vacanciesData from "@/data/vacancies.json";
import { VacancyItem } from "@/types/vacancy";
import { CategoryChart } from "@/components/Charts/CategoryChart";
import { BranchChart } from "@/components/Charts/BranchChart";
import { InstituteTypeChart } from "@/components/Charts/InstituteTypeChart";
import { BarChart2, Award } from "lucide-react";
import institutesData from "@/data/institutes.json";

export default function AnalyticsPage() {
  const vacancies = vacanciesData as VacancyItem[];

  const topInstitutes = [...institutesData]
    .sort((a, b) => b.totalVacancies - a.totalVacancies)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0071e3] text-xs font-semibold mb-2">
          <BarChart2 className="h-3.5 w-3.5" />
          <span>CSAB 2024 Data Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
          Vacancy <span className="text-[#0071e3]">Visual Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg mx-auto mt-1">
          Comprehensive visual breakdown of 15,423 vacant seats across NITs, IIITs, GFTIs, reservation categories, and branches.
        </p>
      </div>

      {/* Charts Grid 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CategoryChart vacancies={vacancies} />
        <InstituteTypeChart vacancies={vacancies} />
      </div>

      {/* Branch Chart */}
      <BranchChart vacancies={vacancies} />

      {/* Top 10 Colleges */}
      <div className="bg-white p-6 rounded-3xl border border-black/[0.08] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Top 10 Colleges with Highest Availability</span>
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Institutes offering the maximum total vacant seats in CSAB 2024
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#fafafa] text-[#86868b] uppercase text-[11px] font-semibold border-b border-black/[0.06]">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Institute Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-right">Vacant Seats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {topInstitutes.map((inst, idx) => (
                <tr key={inst.name} className="hover:bg-[#f5f5f7]/60 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-[#0071e3]">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1d1d1f]">
                    {inst.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {inst.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#86868b]">{inst.state}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0071e3]">
                      {inst.totalVacancies} Seats
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
