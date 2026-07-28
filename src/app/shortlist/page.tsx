"use client";

import { useState, useEffect } from "react";
import { VacancyItem } from "@/types/vacancy";
import { Bookmark, Download, Trash2, ArrowUp, ArrowDown, GraduationCap } from "lucide-react";
import { exportToCSV } from "@/utils/csvExport";

export default function ShortlistPage() {
  const [shortlist, setShortlist] = useState<VacancyItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("csab_shortlist");
    if (saved) {
      try {
        setShortlist(JSON.parse(saved));
      } catch (e) {
        setShortlist([]);
      }
    }
  }, []);

  const saveList = (updated: VacancyItem[]) => {
    setShortlist(updated);
    localStorage.setItem("csab_shortlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const removeBookmark = (id: number) => {
    const updated = shortlist.filter((item) => item.id !== id);
    saveList(updated);
  };

  const clearAll = () => {
    saveList([]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...shortlist];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    saveList(copy);
  };

  const moveDown = (index: number) => {
    if (index === shortlist.length - 1) return;
    const copy = [...shortlist];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    saveList(copy);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2">
            <Bookmark className="h-3.5 w-3.5" />
            <span>My Choice Preference List</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">
            Bookmarked Options ({shortlist.length})
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Re-order your choices to prepare for official CSAB choice locking.
          </p>
        </div>

        {shortlist.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(shortlist, "My_CSAB_Choice_List.csv")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Shortlist Items List */}
      {shortlist.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-black/[0.08] text-center space-y-2 shadow-sm">
          <Bookmark className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-semibold text-[#1d1d1f]">Your Shortlist is Empty</h3>
          <p className="text-xs text-[#86868b] max-w-xs mx-auto">
            Click the bookmark icon on any vacancy option in the Finder or Wizard to save it here!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-sm overflow-hidden divide-y divide-black/[0.04]">
          {shortlist.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#f5f5f7]/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-[#0071e3] shrink-0 mt-0.5">
                  #{idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-blue-50 text-[#0071e3]">
                      {item.instituteType}
                    </span>
                    <h4 className="font-semibold text-[#1d1d1f] text-sm">{item.instituteName}</h4>
                  </div>

                  <p className="text-xs font-medium text-[#515154] mt-1 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                    {item.programName}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#86868b]">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Quota: {item.quota}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Category: {item.category}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Pool: {item.seatPool}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0071e3] font-bold">
                      {item.vacancy} Vacant {item.vacancy === 1 ? "Seat" : "Seats"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>

                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === shortlist.length - 1}
                  className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                <button
                  onClick={() => removeBookmark(item.id)}
                  className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 ml-2"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
