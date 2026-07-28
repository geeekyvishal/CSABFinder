import { Building2, BookOpen, Layers, CheckCircle2 } from "lucide-react";

interface StatsProps {
  totalSeats: number;
  totalRecords: number;
  uniqueInstitutes: number;
  uniquePrograms: number;
  nitSeats: number;
  iiitSeats: number;
  gftiSeats: number;
  homeStateSelected?: string;
}

export function StatsOverview({
  totalSeats,
  totalRecords,
  uniqueInstitutes,
  uniquePrograms,
  nitSeats,
  iiitSeats,
  gftiSeats,
  homeStateSelected,
}: StatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Metric 1 */}
      <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Matching Seats</p>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
              {totalSeats.toLocaleString()}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#86868b] mt-2">
          Across {totalRecords.toLocaleString()} options
        </p>
      </div>

      {/* Metric 2 */}
      <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Colleges</p>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
              {uniqueInstitutes}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#86868b] mt-2">
          NITs, IIITs & GFTIs
        </p>
      </div>

      {/* Metric 3 */}
      <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Seats Split</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-semibold text-[#0071e3]">NITs: {nitSeats}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-indigo-600">IIITs: {iiitSeats}</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#86868b] mt-2">
          GFTIs: <span className="font-semibold text-gray-700">{gftiSeats} seats</span>
        </p>
      </div>

      {/* Metric 4 */}
      <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Programs</p>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
              {uniquePrograms}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <BookOpen className="h-4 w-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#86868b] mt-2">
          {homeStateSelected && homeStateSelected !== "ALL" ? `State: ${homeStateSelected}` : "All Quotas"}
        </p>
      </div>
    </div>
  );
}
