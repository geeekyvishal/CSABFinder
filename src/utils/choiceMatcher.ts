import vacanciesData from "@/data/vacancies.json";
import cutoffsData from "@/data/cutoffs.json";
import { VacancyItem, CutoffData } from "@/types/vacancy";
import { ParsedChoice } from "./pdfParser";

export interface MatchedChoice {
  id: string; // Unique ID for keying & drag/drop
  choiceNo: number;
  rawInstitute: string;
  rawProgram: string;
  matchedVacancy?: VacancyItem;
  cutoff?: CutoffData | null;
  matchScore: number; // 0 to 1 confidence
  status?: "SAFE" | "BORDERLINE" | "HIGH_RISK" | "NO_CUTOFF" | "UNMATCHED";
}

const vacancies = vacanciesData as VacancyItem[];
const cutoffsMap = cutoffsData as Record<string, CutoffData>;

// Helper to normalize strings for comparison
function clean(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/nationalinstituteoftechnology/g, "nit")
    .replace(/indianinstituteofinformationtechnology/g, "iiit")
    .replace(/bacheloroftechnology/g, "btech")
    .replace(/4years/g, "");
}

/**
 * Matches raw parsed choices against official CSAB vacancies dataset
 */
export function matchChoicesWithCutoffs(
  parsedChoices: ParsedChoice[],
  filterCategory: string = "OPEN",
  filterQuota: string = "OS",
  filterSeatPool: string = "Gender-Neutral",
  userRank: number | null = null
): MatchedChoice[] {
  // Pre-index unique institute/program pairs from vacancies
  const uniqueProgramsMap = new Map<string, VacancyItem>();
  vacancies.forEach((item) => {
    const key = `${item.instituteCode}_${item.programCode}`;
    if (!uniqueProgramsMap.has(key)) {
      uniqueProgramsMap.set(key, item);
    }
  });

  return parsedChoices.map((choice, index) => {
    const rawInstClean = clean(choice.rawInstitute);
    const rawProgClean = clean(choice.rawProgram);

    let bestMatch: VacancyItem | undefined = undefined;
    let highestScore = 0;

    // Search through unique vacancy items
    for (const item of vacancies) {
      const instClean = clean(item.instituteName);
      const progClean = clean(item.programName);

      let score = 0;

      // Institute matching
      if (rawInstClean === instClean) {
        score += 0.5;
      } else if (rawInstClean.includes(instClean) || instClean.includes(rawInstClean)) {
        score += 0.35;
      } else {
        // Check Institute Code match
        if (choice.rawInstitute.includes(item.instituteCode.toString())) {
          score += 0.4;
        }
      }

      // Program matching
      if (rawProgClean === progClean) {
        score += 0.5;
      } else if (rawProgClean.includes(progClean) || progClean.includes(rawProgClean)) {
        score += 0.35;
      } else {
        // Token match
        const progTokens = rawProgClean.split(/\s+/);
        const matchedTokens = progTokens.filter((t) => t.length > 2 && progClean.includes(t));
        if (matchedTokens.length > 0) {
          score += (matchedTokens.length / progTokens.length) * 0.4;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    let cutoff: CutoffData | null = null;
    let status: MatchedChoice["status"] = "UNMATCHED";

    if (bestMatch && highestScore >= 0.3) {
      // Form lookup key: {instituteCode}_{programCode}_{quota}_{category}_{seatPool}
      // Note: Gender pool normalized string matching
      let normalizedPool = filterSeatPool;
      if (filterSeatPool.toLowerCase().includes("female")) {
        normalizedPool = "Female-only (including Supernumerary)";
      } else {
        normalizedPool = "Gender-Neutral";
      }

      const cutoffKey = `${bestMatch.instituteCode}_${bestMatch.programCode}_${filterQuota}_${filterCategory}_${normalizedPool}`;
      cutoff = cutoffsMap[cutoffKey] || null;

      // Fallback: If quota HS/OS exact cutoff not found, try AI or alternative quota
      if (!cutoff) {
        const altKey = `${bestMatch.instituteCode}_${bestMatch.programCode}_AI_${filterCategory}_${normalizedPool}`;
        cutoff = cutoffsMap[altKey] || null;
      }

      // Evaluate admission chance status based on user rank vs max closing rank
      if (cutoff && (cutoff.maxCr || cutoff.r3?.cr || cutoff.r1?.cr)) {
        const closingRank = cutoff.maxCr || cutoff.r3?.cr || cutoff.r1?.cr || 0;
        
        if (userRank && userRank > 0) {
          if (userRank <= closingRank) {
            status = "SAFE";
          } else if (userRank <= closingRank * 1.15) {
            status = "BORDERLINE";
          } else {
            status = "HIGH_RISK";
          }
        } else {
          status = "SAFE"; // default if no rank provided
        }
      } else {
        status = "NO_CUTOFF";
      }
    }

    return {
      id: `choice-${choice.choiceNo}-${index}-${Date.now()}`,
      choiceNo: choice.choiceNo,
      rawInstitute: choice.rawInstitute,
      rawProgram: choice.rawProgram,
      matchedVacancy: highestScore >= 0.3 ? bestMatch : undefined,
      cutoff,
      matchScore: highestScore,
      status,
    };
  });
}

/**
 * Sort options for choices list
 */
export type SortOption = 
  | "ORIGINAL"
  | "RANK_ASC"  // Increasing Closing Rank (10,000 before 20,000 -> most competitive first)
  | "RANK_DESC" // Decreasing Closing Rank (20,000 before 10,000)
  | "OPENING_RANK_ASC";

export function sortChoices(choices: MatchedChoice[], sortBy: SortOption): MatchedChoice[] {
  const sorted = [...choices];

  switch (sortBy) {
    case "RANK_ASC":
      return sorted.sort((a, b) => {
        const crA = a.cutoff?.maxCr ?? a.cutoff?.r3?.cr ?? a.cutoff?.r1?.cr ?? Infinity;
        const crB = b.cutoff?.maxCr ?? b.cutoff?.r3?.cr ?? b.cutoff?.r1?.cr ?? Infinity;
        return crA - crB;
      });

    case "RANK_DESC":
      return sorted.sort((a, b) => {
        const crA = a.cutoff?.maxCr ?? a.cutoff?.r3?.cr ?? a.cutoff?.r1?.cr ?? -1;
        const crB = b.cutoff?.maxCr ?? b.cutoff?.r3?.cr ?? b.cutoff?.r1?.cr ?? -1;
        return crB - crA;
      });

    case "OPENING_RANK_ASC":
      return sorted.sort((a, b) => {
        const orA = a.cutoff?.minOr ?? a.cutoff?.r1?.or ?? Infinity;
        const orB = b.cutoff?.minOr ?? b.cutoff?.r1?.or ?? Infinity;
        return orA - orB;
      });

    case "ORIGINAL":
    default:
      return sorted.sort((a, b) => a.choiceNo - b.choiceNo);
  }
}

/**
 * Sample Preset JoSAA / CSAB Choice List for instant 1-click testing
 */
export const SAMPLE_CHOICE_LIST: ParsedChoice[] = [
  {
    choiceNo: 1,
    rawInstitute: "National Institute of Technology Tiruchirappalli",
    rawProgram: "Computer Science and Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 2,
    rawInstitute: "National Institute of Technology Karnataka, Surathkal",
    rawProgram: "Computer Science and Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 3,
    rawInstitute: "National Institute of Technology Warangal",
    rawProgram: "Computer Science and Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 4,
    rawInstitute: "Malaviya National Institute of Technology Jaipur",
    rawProgram: "Computer Science and Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 5,
    rawInstitute: "Dr. B R Ambedkar National Institute of Technology, Jalandhar",
    rawProgram: "Computer Science and Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 6,
    rawInstitute: "National Institute of Technology Calicut",
    rawProgram: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 7,
    rawInstitute: "Indian Institute of Information Technology, Allahabad",
    rawProgram: "Information Technology (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 8,
    rawInstitute: "Dr. B R Ambedkar National Institute of Technology, Jalandhar",
    rawProgram: "Electronics and Communication Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 9,
    rawInstitute: "Malaviya National Institute of Technology Jaipur",
    rawProgram: "Electrical Engineering (4 Years, Bachelor of Technology)",
  },
  {
    choiceNo: 10,
    rawInstitute: "Dr. B R Ambedkar National Institute of Technology, Jalandhar",
    rawProgram: "Data Science and Engineering (4 Years, Bachelor of Technology)",
  },
];
