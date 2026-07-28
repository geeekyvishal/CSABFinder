"use client";

import { useState, useMemo } from "react";
import vacanciesData from "@/data/vacancies.json";
import { VacancyItem } from "@/types/vacancy";
import { INDIAN_STATES, CATEGORIES, MAJOR_BRANCHES } from "@/data/states";
import { 
  Wand2, 
  MapPin, 
  UserCheck, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Download,
  Sparkles
} from "lucide-react";
import { VacancyTable } from "@/components/VacancyTable";
import { exportToCSV } from "@/utils/csvExport";

export default function WizardPage() {
  const allVacancies = vacanciesData as VacancyItem[];

  const [step, setStep] = useState<number>(1);
  const [homeState, setHomeState] = useState<string>("Punjab");
  const [category, setCategory] = useState<string>("OPEN");
  const [seatPool, setSeatPool] = useState<string>("Gender-Neutral");
  const [selectedBranches, setSelectedBranches] = useState<string[]>(["Computer Science", "Electronics and Communication", "Electrical"]);
  const [selectedCollegeTypes, setSelectedCollegeTypes] = useState<string[]>(["NIT", "IIIT", "GFTI"]);
  const [minSeats, setMinSeats] = useState<number>(1);

  const toggleBranch = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const toggleCollegeType = (type: string) => {
    if (selectedCollegeTypes.includes(type)) {
      if (selectedCollegeTypes.length > 1) {
        setSelectedCollegeTypes(selectedCollegeTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedCollegeTypes([...selectedCollegeTypes, type]);
    }
  };

  const recommendedVacancies = useMemo(() => {
    const userState = homeState.toLowerCase();

    return allVacancies.filter((item) => {
      if (item.category !== category) return false;
      if (seatPool !== "ALL" && item.seatPool !== seatPool) return false;
      if (item.vacancy < minSeats) return false;
      if (!selectedCollegeTypes.includes(item.instituteType)) return false;

      if (selectedBranches.length > 0) {
        const progLower = item.programName.toLowerCase();
        const matchesAny = selectedBranches.some((b) => progLower.includes(b.toLowerCase()));
        if (!matchesAny) return false;
      }

      if (item.quota === "HS") {
        if (item.instituteState.toLowerCase() !== userState) return false;
      } else if (item.quota === "OS") {
        if (item.instituteState.toLowerCase() === userState) return false;
      }

      return true;
    }).sort((a, b) => b.vacancy - a.vacancy);
  }, [allVacancies, homeState, category, seatPool, selectedBranches, selectedCollegeTypes, minSeats]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-black/[0.08] p-6 sm:p-8 rounded-3xl shadow-sm text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-2">
          <Wand2 className="h-3.5 w-3.5" />
          <span>Interactive Decision Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
          "Find My College" <span className="text-[#0071e3]">Wizard</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#515154] max-w-lg mx-auto mt-1.5">
          Answer 4 simple questions about your state, category, gender, and branch preferences to generate a custom vacancy preference list.
        </p>

        {/* Wizard Steps Progress Indicator */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-6">
          {[
            { num: 1, label: "Home State" },
            { num: 2, label: "Category & Gender" },
            { num: 3, label: "Branches & Tiers" },
            { num: 4, label: "Your Options" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? "bg-[#0071e3] text-white shadow-sm"
                    : step > s.num
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === s.num ? "text-[#0071e3] font-semibold" : "text-[#86868b]"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Home State */}
      {step === 1 && (
        <div className="bg-white border border-black/[0.08] p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
            <div className="h-9 w-9 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">Step 1: Select Your State of Eligibility</h2>
              <p className="text-xs text-[#86868b]">This automatically maps Home State (HS) vs Other State (OS) quotas for NITs.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {INDIAN_STATES.map((s) => (
              <button
                key={s.name}
                onClick={() => setHomeState(s.name)}
                className={`p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                  homeState === s.name
                    ? "bg-blue-50 border-[#0071e3] text-[#0071e3] font-semibold shadow-sm"
                    : "bg-[#f5f5f7] border-transparent text-[#1d1d1f] hover:bg-gray-200/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{s.name}</span>
                  {homeState === s.name && <CheckCircle2 className="h-3.5 w-3.5 text-[#0071e3]" />}
                </div>
                <span className="text-[10px] text-[#86868b] block mt-0.5">
                  {s.hasNIT ? "Has NIT" : "No NIT"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-black/[0.06]">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-xs sm:text-sm bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
            >
              <span>Next: Category & Gender</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Category & Gender */}
      {step === 2 && (
        <div className="bg-white border border-black/[0.08] p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">Step 2: Reservation Category & Gender</h2>
              <p className="text-xs text-[#86868b]">Select your official category and seat pool quota.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] mb-2">
                Reservation Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      category === c
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                        : "bg-[#f5f5f7] border-transparent text-[#1d1d1f] hover:bg-gray-200/70"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#86868b] mb-2">
                Seat Pool (Gender Quota)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "Gender-Neutral", title: "Gender-Neutral", desc: "Open for both Male & Female candidates" },
                  { id: "Female-only (including Supernumerary)", title: "Female-Only", desc: "Reserved specifically for female candidates" }
                ].map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => setSeatPool(pool.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      seatPool === pool.id
                        ? "bg-purple-50 border-purple-500 text-purple-700 font-semibold"
                        : "bg-[#f5f5f7] border-transparent text-[#1d1d1f] hover:bg-gray-200/70"
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">{pool.title}</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">{pool.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-black/[0.06]">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-xs text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-xs sm:text-sm bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
            >
              <span>Next: Preferred Branches</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preferred Branches & Tiers */}
      {step === 3 && (
        <div className="bg-white border border-black/[0.08] p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
            <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">Step 3: Preferred Engineering Branches & Tiers</h2>
              <p className="text-xs text-[#86868b]">Select one or multiple engineering branches you are interested in.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] mb-2">
                Engineering Branches
              </label>
              <div className="flex flex-wrap gap-2">
                {MAJOR_BRANCHES.map((b) => {
                  const isSelected = selectedBranches.includes(b);
                  return (
                    <button
                      key={b}
                      onClick={() => toggleBranch(b)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-blue-50 border-[#0071e3] text-[#0071e3] font-semibold"
                          : "bg-[#f5f5f7] border-transparent text-[#1d1d1f] hover:bg-gray-200/70"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{b}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#86868b] mb-2">
                College Tiers
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["NIT", "IIIT", "GFTI"].map((type) => {
                  const isSelected = selectedCollegeTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleCollegeType(type)}
                      className={`p-3 rounded-xl border font-semibold text-xs text-center transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "bg-[#f5f5f7] border-transparent text-gray-500"
                      }`}
                    >
                      {type}s
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-black/[0.06]">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-xs text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-xs sm:text-sm bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate My Options</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-white border border-black/[0.08] p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-1">
                <Sparkles className="h-3 w-3" />
                <span>Wizard Choice List Generated</span>
              </div>
              <h2 className="text-xl font-semibold text-[#1d1d1f]">
                Found <strong className="text-[#0071e3]">{recommendedVacancies.length}</strong> Matching Options
              </h2>
              <p className="text-xs text-[#86868b] mt-1">
                State: <strong>{homeState}</strong> | Category: <strong>{category}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(recommendedVacancies, `CSAB_Choice_List_${homeState}_${category}.csv`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <span>Edit Answers</span>
              </button>
            </div>
          </div>

          <VacancyTable vacancies={recommendedVacancies} userHomeState={homeState} />
        </div>
      )}
    </div>
  );
}
