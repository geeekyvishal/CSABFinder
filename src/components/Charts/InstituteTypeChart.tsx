"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { VacancyItem } from "@/types/vacancy";

interface ChartProps {
  vacancies: VacancyItem[];
}

const APPLE_COLORS = ["#0071e3", "#5e5ce6", "#af52de"];

export function InstituteTypeChart({ vacancies }: ChartProps) {
  const typeCounts = {
    NIT: 0,
    IIIT: 0,
    GFTI: 0,
  };

  vacancies.forEach((v) => {
    if (v.instituteType in typeCounts) {
      typeCounts[v.instituteType] += v.vacancy;
    }
  });

  const data = [
    { name: "NITs (32 Colleges)", value: typeCounts.NIT },
    { name: "IIITs (39 Colleges)", value: typeCounts.IIIT },
    { name: "GFTIs (43 Colleges)", value: typeCounts.GFTI },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm">
      <h3 className="text-sm font-semibold text-[#1d1d1f] mb-0.5">
        College Tier Seat Split
      </h3>
      <p className="text-xs text-[#86868b] mb-4">
        Vacancy distribution across NITs, IIITs, and GFTIs
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={APPLE_COLORS[index % APPLE_COLORS.length]} />
              ))}
            </Pie>
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
            <Legend 
              wrapperStyle={{ fontSize: "12px", color: "#86868b" }} 
              verticalAlign="bottom" 
              height={36} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
