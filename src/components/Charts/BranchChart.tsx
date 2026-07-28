"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { VacancyItem } from "@/types/vacancy";
import { MAJOR_BRANCHES } from "@/data/states";

interface ChartProps {
  vacancies: VacancyItem[];
}

export function BranchChart({ vacancies }: ChartProps) {
  const branchCounts: Record<string, number> = {};

  MAJOR_BRANCHES.forEach((b) => {
    branchCounts[b] = 0;
  });

  vacancies.forEach((v) => {
    const prog = v.programName.toLowerCase();
    MAJOR_BRANCHES.forEach((b) => {
      if (prog.includes(b.toLowerCase())) {
        branchCounts[b] += v.vacancy;
      }
    });
  });

  const data = Object.keys(branchCounts)
    .map((b) => ({ branch: b, seats: branchCounts[b] }))
    .filter((d) => d.seats > 0)
    .sort((a, b) => b.seats - a.seats);

  return (
    <div className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm">
      <h3 className="text-sm font-semibold text-[#1d1d1f] mb-0.5">
        Vacant Seats by Engineering Branch
      </h3>
      <p className="text-xs text-[#86868b] mb-4">
        Popular engineering branches with maximum availability
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fill: "#86868b", fontSize: 11 }} />
            <YAxis 
              type="category" 
              dataKey="branch" 
              tick={{ fill: "#86868b", fontSize: 10 }}
              width={130}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                borderColor: "#e5e5ea", 
                borderRadius: "12px",
                color: "#1d1d1f",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
              formatter={(value: number) => [`${value.toLocaleString()} Seats`, "Vacancies"]}
            />
            <Bar dataKey="seats" fill="#0071e3" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
