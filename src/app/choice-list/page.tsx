"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  extractTextFromPDF, 
  parseChoicesFromText, 
  ParsedChoice 
} from "@/utils/pdfParser";
import { 
  matchChoicesWithCutoffs, 
  sortChoices, 
  MatchedChoice, 
  SortOption, 
  SAMPLE_CHOICE_LIST 
} from "@/utils/choiceMatcher";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Save, 
  Download, 
  Trash2, 
  Plus, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface SavedChoiceList {
  id: string;
  name: string;
  date: string;
  choices: ParsedChoice[];
  category: string;
  quota: string;
  seatPool: string;
  userRank: string;
}

export default function ChoiceListPage() {
  // Input state
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Core choice state
  const [rawChoices, setRawChoices] = useState<ParsedChoice[]>([]);

  // Filter state
  const [userRank, setUserRank] = useState<string>("25000");
  const [category, setCategory] = useState<string>("OPEN");
  const [quota, setQuota] = useState<string>("OS");
  const [seatPool, setSeatPool] = useState<string>("Gender-Neutral");
  const [sortBy, setSortBy] = useState<SortOption>("ORIGINAL");

  // Storage state
  const [savedLists, setSavedLists] = useState<SavedChoiceList[]>([]);
  const [listName, setListName] = useState<string>("My CSAB Choice List");

  // Load sample on initial load if empty
  useEffect(() => {
    setRawChoices(SAMPLE_CHOICE_LIST);

    // Restore saved choice lists from localStorage
    const saved = localStorage.getItem("csab_saved_choice_lists");
    if (saved) {
      try {
        setSavedLists(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved choice lists:", e);
      }
    }
  }, []);

  // PDF File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const buffer = await file.arrayBuffer();
      const extractedText = await extractTextFromPDF(buffer);
      const choices = parseChoicesFromText(extractedText);

      if (choices.length === 0) {
        setParseError("Could not automatically extract choices from this PDF format. Try pasting the text manually below!");
      } else {
        setRawChoices(choices);
      }
    } catch (err: any) {
      setParseError(err.message || "Failed to read PDF file.");
    } finally {
      setIsParsing(false);
    }
  };

  // Text Paste Parsing Handler
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    setParseError(null);

    try {
      const choices = parseChoicesFromText(pastedText);
      if (choices.length === 0) {
        setParseError("Could not identify choices from text. Ensure text format has choice numbers, institute names, and program names.");
      } else {
        setRawChoices(choices);
      }
    } catch (err: any) {
      setParseError("Error parsing pasted text.");
    } finally {
      setIsParsing(false);
    }
  };

  // Load Sample Choice List
  const handleLoadSample = () => {
    setRawChoices(SAMPLE_CHOICE_LIST);
    setParseError(null);
  };

  // Match raw choices with official cutoff ranks data
  const matchedChoices = useMemo(() => {
    const rankNum = userRank ? parseInt(userRank, 10) : null;
    const matched = matchChoicesWithCutoffs(
      rawChoices,
      category,
      quota,
      seatPool,
      isNaN(rankNum!) ? null : rankNum
    );
    return sortChoices(matched, sortBy);
  }, [rawChoices, category, quota, seatPool, userRank, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = matchedChoices.length;
    const safe = matchedChoices.filter((c) => c.status === "SAFE").length;
    const borderline = matchedChoices.filter((c) => c.status === "BORDERLINE").length;
    const risk = matchedChoices.filter((c) => c.status === "HIGH_RISK").length;
    const matchedCount = matchedChoices.filter((c) => c.cutoff !== null).length;

    return { total, safe, borderline, risk, matchedCount };
  }, [matchedChoices]);

  // Move choice up/down
  const handleMoveChoice = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rawChoices.length) return;

    const newRaw = [...rawChoices];
    const temp = newRaw[index];
    newRaw[index] = newRaw[targetIndex];
    newRaw[targetIndex] = temp;

    // Update choice numbers
    newRaw.forEach((c, idx) => (c.choiceNo = idx + 1));
    setRawChoices(newRaw);
  };

  // Delete choice
  const handleDeleteChoice = (index: number) => {
    const newRaw = rawChoices.filter((_, idx) => idx !== index);
    newRaw.forEach((c, idx) => (c.choiceNo = idx + 1));
    setRawChoices(newRaw);
  };

  // Save current choice list to localStorage
  const handleSaveList = () => {
    if (rawChoices.length === 0) return;

    const newList: SavedChoiceList = {
      id: `list-${Date.now()}`,
      name: listName || `Choice List ${savedLists.length + 1}`,
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      choices: rawChoices,
      category,
      quota,
      seatPool,
      userRank,
    };

    const updated = [newList, ...savedLists];
    setSavedLists(updated);
    localStorage.setItem("csab_saved_choice_lists", JSON.stringify(updated));
    alert(`Choice list "${newList.name}" saved successfully!`);
  };

  // Restore saved choice list
  const handleLoadSavedList = (saved: SavedChoiceList) => {
    setRawChoices(saved.choices);
    setCategory(saved.category || "OPEN");
    setQuota(saved.quota || "OS");
    setSeatPool(saved.seatPool || "Gender-Neutral");
    setUserRank(saved.userRank || "");
    setListName(saved.name);
  };

  // Delete saved choice list
  const handleDeleteSavedList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedLists.filter((l) => l.id !== id);
    setSavedLists(updated);
    localStorage.setItem("csab_saved_choice_lists", JSON.stringify(updated));
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (matchedChoices.length === 0) return;

    const headers = [
      "Choice No",
      "Institute Name",
      "Academic Program Name",
      "Quota",
      "Category",
      "Seat Pool",
      "Round 1 OR",
      "Round 1 CR",
      "Round 2 OR",
      "Round 2 CR",
      "Round 3 OR",
      "Round 3 CR",
      "Status",
    ];

    const rows = matchedChoices.map((c) => [
      c.choiceNo,
      `"${c.matchedVacancy?.instituteName || c.rawInstitute}"`,
      `"${c.matchedVacancy?.programName || c.rawProgram}"`,
      quota,
      category,
      seatPool,
      c.cutoff?.r1?.or ?? "-",
      c.cutoff?.r1?.cr ?? "-",
      c.cutoff?.r2?.or ?? "-",
      c.cutoff?.r2?.cr ?? "-",
      c.cutoff?.r3?.or ?? "-",
      c.cutoff?.r3?.cr ?? "-",
      c.status || "UNMATCHED",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${listName.replace(/\s+/g, "_")}_cutoffs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Choice List PDF Parser & Cutoffs Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Parse Choice PDF & Match Cutoffs
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload your official <strong>JoSAA / CSAB Choice List PDF</strong> (or paste choice text). We instantly extract your choices, cross-reference them with <strong>2025 CSAB Cutoffs (R1, R2, R3)</strong>, calculate admission probability against your JEE rank, and let you sort by cutoffs!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-xs sm:text-sm bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span>Load 10 Sample Choices</span>
            </button>

            {savedLists.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                  <span>Load Saved List ({savedLists.length})</span>
                </button>

                <div className="absolute left-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block z-50">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">Saved Choice Lists</div>
                  {savedLists.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => handleLoadSavedList(l)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-100 cursor-pointer group/item"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{l.name}</div>
                        <div className="text-[10px] text-slate-500">{l.choices.length} choices • {l.date}</div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSavedList(l.id, e)}
                        className="text-slate-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 p-1"
                        title="Delete list"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Method Tabs & Upload Box */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload PDF File</span>
            </button>

            <button
              onClick={() => setActiveTab("paste")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "paste"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Paste Text / CSV</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            100% Client-Side Private Extraction
          </span>
        </div>

        {activeTab === "upload" ? (
          <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 rounded-2xl p-8 text-center transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {isParsing ? "Extracting choices from PDF..." : "Click or Drag & Drop your JoSAA / CSAB Choice PDF"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports standard JoSAA choice summary printouts & CSAB locked choices PDFs.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste choice list text or CSV format here... e.g.&#10;1   National Institute of Technology Trichy   Computer Science and Engineering&#10;2   Dr. B R Ambedkar NIT Jalandhar   Electronics and Communication Engineering"
              className="w-full h-36 p-3.5 text-xs font-mono border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
            />
            <button
              onClick={handleParsePastedText}
              disabled={isParsing || !pastedText.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Parse Pasted Choices</span>
            </button>
          </div>
        )}

        {parseError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Cutoff Matching & Ranking Filters</h2>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Choice List Title"
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-full w-44 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSaveList}
              disabled={rawChoices.length === 0}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save className="h-3.5 w-3.5 text-amber-400" />
              <span>Save List</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={matchedChoices.length === 0}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* JEE Main Rank */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Your JEE Main Rank</label>
            <input
              type="number"
              value={userRank}
              onChange={(e) => setUserRank(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-semibold"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Seat Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-semibold"
            >
              <option value="OPEN">OPEN (General)</option>
              <option value="GEN-EWS">GEN-EWS</option>
              <option value="OBC-NCL">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OPEN (PwD)">OPEN (PwD)</option>
              <option value="GEN-EWS(PwD)">GEN-EWS (PwD)</option>
              <option value="OBC-NCL(PwD)">OBC-NCL (PwD)</option>
              <option value="SC (PwD)">SC (PwD)</option>
              <option value="ST (PwD)">ST (PwD)</option>
            </select>
          </div>

          {/* Quota */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Quota (State)</label>
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-semibold"
            >
              <option value="OS">OS (Other State)</option>
              <option value="HS">HS (Home State)</option>
              <option value="AI">AI (All India)</option>
              <option value="JK">JK (Jammu & Kashmir)</option>
              <option value="LA">LA (Ladakh)</option>
            </select>
          </div>

          {/* Seat Pool */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender / Seat Pool</label>
            <select
              value={seatPool}
              onChange={(e) => setSeatPool(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-semibold"
            >
              <option value="Gender-Neutral">Gender-Neutral</option>
              <option value="Female-only (including Supernumerary)">Female-only (Supernumerary)</option>
            </select>
          </div>

          {/* Sort By Cutoff Rank */}
          <div>
            <label className="block text-[11px] font-bold text-blue-600 mb-1 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              <span>Sort Choices By</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 text-xs border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50 font-bold text-blue-900"
            >
              <option value="ORIGINAL">PDF Choice # Order</option>
              <option value="RANK_ASC">⬆️ Closing Rank (Increasing / Toughest First)</option>
              <option value="RANK_DESC">⬇️ Closing Rank (Decreasing / Easiest First)</option>
              <option value="OPENING_RANK_ASC">📈 Opening Rank (Increasing)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-center shadow-sm">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Choices</div>
          <div className="text-xl font-bold text-slate-800">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-center shadow-sm">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Cutoff Match Rate</div>
          <div className="text-xl font-bold text-blue-600">
            {stats.total > 0 ? `${Math.round((stats.matchedCount / stats.total) * 100)}%` : "0%"}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center shadow-sm">
          <div className="text-[11px] text-emerald-700 font-semibold uppercase flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>High Chance</span>
          </div>
          <div className="text-xl font-bold text-emerald-700">{stats.safe}</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center shadow-sm">
          <div className="text-[11px] text-amber-700 font-semibold uppercase flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span>Borderline</span>
          </div>
          <div className="text-xl font-bold text-amber-700">{stats.borderline}</div>
        </div>

        <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-center shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] text-red-700 font-semibold uppercase flex items-center justify-center gap-1">
            <XCircle className="h-3 w-3 text-red-600" />
            <span>High Risk</span>
          </div>
          <div className="text-xl font-bold text-red-700">{stats.risk}</div>
        </div>
      </div>

      {/* Choices Table List */}
      <div className="bg-white border border-black/[0.08] rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Extracted Choice List & 2025 Cutoffs</h2>
            <p className="text-xs text-slate-500">
              Showing cutoffs for <strong>{category}</strong> category under <strong>{quota}</strong> quota ({seatPool}).
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {matchedChoices.length} choices
          </div>
        </div>

        {matchedChoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No choices loaded yet.</p>
            <p className="text-xs text-slate-400">Upload a PDF choice summary or click "Load Sample Choices" above to test!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold w-16 text-center">Choice #</th>
                  <th className="py-3 px-4 font-bold">Institute Name</th>
                  <th className="py-3 px-4 font-bold">Academic Program</th>
                  <th className="py-3 px-4 font-bold text-center">2025 R1 Cutoff</th>
                  <th className="py-3 px-4 font-bold text-center">2025 R2 Cutoff</th>
                  <th className="py-3 px-4 font-bold text-center">2025 R3 Cutoff</th>
                  <th className="py-3 px-4 font-bold text-center">Closing Rank (CR)</th>
                  <th className="py-3 px-4 font-bold text-center">Admission Chance</th>
                  <th className="py-3 px-4 font-bold text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matchedChoices.map((choice, index) => {
                  const instName = choice.matchedVacancy?.instituteName || choice.rawInstitute;
                  const progName = choice.matchedVacancy?.programName || choice.rawProgram;
                  const instType = choice.matchedVacancy?.instituteType;

                  return (
                    <tr key={choice.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Choice # */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-900 text-white font-bold text-[11px]">
                          {choice.choiceNo}
                        </span>
                      </td>

                      {/* Institute */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 leading-snug">{instName}</div>
                        {instType && (
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              instType === "NIT"
                                ? "bg-blue-100 text-blue-800"
                                : instType === "IIIT"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {instType}
                          </span>
                        )}
                      </td>

                      {/* Program */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-700 leading-snug">{progName}</div>
                      </td>

                      {/* Round 1 Cutoff */}
                      <td className="py-3.5 px-4 text-center">
                        {choice.cutoff?.r1 ? (
                          <div className="font-mono text-[11px]">
                            <span className="text-slate-500">{choice.cutoff.r1.or}</span>
                            <span className="text-slate-400 mx-1">-</span>
                            <span className="font-bold text-slate-900">{choice.cutoff.r1.cr}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Round 2 Cutoff */}
                      <td className="py-3.5 px-4 text-center">
                        {choice.cutoff?.r2 ? (
                          <div className="font-mono text-[11px]">
                            <span className="text-slate-500">{choice.cutoff.r2.or}</span>
                            <span className="text-slate-400 mx-1">-</span>
                            <span className="font-bold text-slate-900">{choice.cutoff.r2.cr}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Round 3 Cutoff */}
                      <td className="py-3.5 px-4 text-center">
                        {choice.cutoff?.r3 ? (
                          <div className="font-mono text-[11px]">
                            <span className="text-slate-500">{choice.cutoff.r3.or}</span>
                            <span className="text-slate-400 mx-1">-</span>
                            <span className="font-bold text-slate-900">{choice.cutoff.r3.cr}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Max Closing Rank Highlight */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-blue-700">
                        {choice.cutoff?.maxCr || choice.cutoff?.r3?.cr || choice.cutoff?.r1?.cr ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                            CR: {choice.cutoff.maxCr || choice.cutoff.r3?.cr || choice.cutoff.r1?.cr}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">No Data</span>
                        )}
                      </td>

                      {/* Admission Status */}
                      <td className="py-3.5 px-4 text-center">
                        {choice.status === "SAFE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3 w-3" /> High Chance
                          </span>
                        )}
                        {choice.status === "BORDERLINE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                            <AlertTriangle className="h-3 w-3" /> Borderline
                          </span>
                        )}
                        {choice.status === "HIGH_RISK" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-[11px]">
                            <XCircle className="h-3 w-3" /> High Risk
                          </span>
                        )}
                        {(choice.status === "NO_CUTOFF" || choice.status === "UNMATCHED") && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            No Rank Data
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMoveChoice(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveChoice(index, "down")}
                            disabled={index === matchedChoices.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteChoice(index)}
                            className="p-1 rounded text-slate-400 hover:text-red-600"
                            title="Delete Choice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
