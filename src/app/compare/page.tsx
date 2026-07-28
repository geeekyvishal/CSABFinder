"use client";

import { useState, useMemo } from "react";
import vacanciesData from "@/data/vacancies.json";
import institutesData from "@/data/institutes.json";
import { VacancyItem } from "@/types/vacancy";
import { CATEGORIES, MAJOR_BRANCHES } from "@/data/states";
import { GitCompare, Building2, Layers } from "lucide-react";

export default function ComparePage() {
  const allVacancies = vacanciesData as VacancyItem[];

  const [selectedInst1, setSelectedInst1] = useState<string>("Dr. B R Ambedkar National Institute of Technology, Jalandhar");
  const [selectedInst2, setSelectedInst2] = useState<string>("Malaviya National Institute of Technology Jaipur");
  const [selectedInst3, setSelectedInst3] = useState<string>("Motilal Nehru National Institute of Technology Allahabad");

  const [category, setCategory] = useState<string>("OPEN");

  const getInstSummary = (instName: string) => {
    const instMeta = institutesData.find((i) => i.name === instName);
    const instVacancies = allVacancies.filter((v) => v.instituteName === instName && (category === "ALL" || v.category === category));

    const totalVacantSeats = instVacancies.reduce((a, b) => a + b.vacancy, 0);
    const branchesWithSeats = Array.from(new Set(instVacancies.map((v) => v.programName)));

    const branchBreakdown: Record<string, number> = {};
    MAJOR_BRANCHES.forEach((b) => {
      branchBreakdown[b] = 0;
    });

    instVacancies.forEach((v) => {
      MAJOR_BRANCHES.forEach((b) => {
        if (v.programName.toLowerCase().includes(b.toLowerCase())) {
          branchBreakdown[b] += v.vacancy;
        }
      });
    });

    return {
      meta: instMeta,
      totalVacantSeats,
      branchesWithSeatsCount: branchesWithSeats.length,
      branchBreakdown,
      items: instVacancies,
    };
  };

  const c1 = useMemo(() => getInstSummary(selectedInst1), [selectedInst1, category]);
  const c2 = useMemo(() => getInstSummary(selectedInst2), [selectedInst2, category]);
  const c3 = useMemo(() => getInstSummary(selectedInst3), [selectedInst3, category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
          <GitCompare className="h-3.5 w-3.5" />
          <span>Side-by-Side College Comparator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
          Compare College <span className="text-[#0071e3]">Vacancies</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg mx-auto mt-1">
          Compare available vacant seats side-by-side across 3 target colleges for your category.
        </p>

        <div className="mt-4 max-w-xs mx-auto">
          <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
            Category Filter
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] font-medium"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All Categories" : `Category: ${c}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* College 1 Select */}
        <div className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-[#0071e3] text-xs font-semibold uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>College 1</span>
          </div>
          <select
            value={selectedInst1}
            onChange={(e) => setSelectedInst1(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] font-medium"
          >
            {institutesData.map((i) => (
              <option key={i.name} value={i.name}>
                [{i.type}] {i.name}
              </option>
            ))}
          </select>

          <div className="pt-3 border-t border-black/[0.06] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">Total Vacancies ({category}):</span>
              <span className="font-bold text-[#0071e3] text-sm">{c1.totalVacantSeats} Seats</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">State / Type:</span>
              <span className="font-medium text-[#1d1d1f]">{c1.meta?.state} ({c1.meta?.type})</span>
            </div>
          </div>
        </div>

        {/* College 2 Select */}
        <div className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>College 2</span>
          </div>
          <select
            value={selectedInst2}
            onChange={(e) => setSelectedInst2(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] font-medium"
          >
            {institutesData.map((i) => (
              <option key={i.name} value={i.name}>
                [{i.type}] {i.name}
              </option>
            ))}
          </select>

          <div className="pt-3 border-t border-black/[0.06] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">Total Vacancies ({category}):</span>
              <span className="font-bold text-indigo-600 text-sm">{c2.totalVacantSeats} Seats</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">State / Type:</span>
              <span className="font-medium text-[#1d1d1f]">{c2.meta?.state} ({c2.meta?.type})</span>
            </div>
          </div>
        </div>

        {/* College 3 Select */}
        <div className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-purple-600 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>College 3</span>
          </div>
          <select
            value={selectedInst3}
            onChange={(e) => setSelectedInst3(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] font-medium"
          >
            {institutesData.map((i) => (
              <option key={i.name} value={i.name}>
                [{i.type}] {i.name}
              </option>
            ))}
          </select>

          <div className="pt-3 border-t border-black/[0.06] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">Total Vacancies ({category}):</span>
              <span className="font-bold text-purple-600 text-sm">{c3.totalVacantSeats} Seats</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">State / Type:</span>
              <span className="font-medium text-[#1d1d1f]">{c3.meta?.state} ({c3.meta?.type})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Comparison Table */}
      <div className="bg-white p-6 rounded-3xl border border-black/[0.08] shadow-sm">
        <h3 className="text-base font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#0071e3]" />
          <span>Branch-by-Branch Breakdown ({category})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#fafafa] text-[#86868b] uppercase text-[11px] font-semibold border-b border-black/[0.06]">
                <th className="py-3 px-4">Engineering Branch</th>
                <th className="py-3 px-4 text-[#0071e3] font-semibold">{selectedInst1.split(",")[0]}</th>
                <th className="py-3 px-4 text-indigo-600 font-semibold">{selectedInst2.split(",")[0]}</th>
                <th className="py-3 px-4 text-purple-600 font-semibold">{selectedInst3.split(",")[0]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {MAJOR_BRANCHES.map((b) => {
                const s1 = c1.branchBreakdown[b] || 0;
                const s2 = c2.branchBreakdown[b] || 0;
                const s3 = c3.branchBreakdown[b] || 0;

                if (s1 === 0 && s2 === 0 && s3 === 0) return null;

                return (
                  <tr key={b} className="hover:bg-[#f5f5f7]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1d1d1f]">{b}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        s1 > 0 ? "bg-blue-50 text-[#0071e3]" : "text-gray-300"
                      }`}>
                        {s1} Seats
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        s2 > 0 ? "bg-indigo-50 text-indigo-600" : "text-gray-300"
                      }`}>
                        {s2} Seats
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        s3 > 0 ? "bg-purple-50 text-purple-600" : "text-gray-300"
                      }`}>
                        {s3} Seats
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
