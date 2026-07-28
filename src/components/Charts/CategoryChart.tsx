"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { VacancyItem } from "@/types/vacancy";

interface ChartProps {
  vacancies: VacancyItem[];
}

const APPLE_COLORS = [
  "#0071e3", "#5e5ce6", "#af52de", "#ff2d55", 
  "#ff9500", "#34c759", "#30b0c7", "#5856d6"
];

export function CategoryChart({ vacancies }: ChartProps) {
  const categoryCounts: Record<string, number> = {};

  vacancies.forEach((v) => {
    categoryCounts[v.category] = (categoryCounts[v.category] || 0) + v.vacancy;
  });

  const data = Object.keys(categoryCounts).map((cat) => ({
    category: cat,
    seats: categoryCounts[cat],
  })).sort((a, b) => b.seats - a.seats);

  return (
    <div className="bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm">
      <h3 className="text-sm font-semibold text-[#1d1d1f] mb-0.5">
        Seat Distribution by Reservation Category
      </h3>
      <p className="text-xs text-[#86868b] mb-4">
        Vacant seats across OPEN, EWS, OBC, SC, ST and PwD quotas
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis 
              dataKey="category" 
              tick={{ fill: "#86868b", fontSize: 11 }}
              angle={-25}
              textAnchor="end"
            />
            <YAxis tick={{ fill: "#86868b", fontSize: 11 }} />
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
            <Bar dataKey="seats" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={APPLE_COLORS[index % APPLE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
