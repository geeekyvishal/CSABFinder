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

// Generic stop words for institute matching
const GENERIC_INST_TOKENS = new Set([
  "national", "institute", "of", "technology", "indian", "information", "and", "management", "science", "engineering"
]);

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/b\.\s*tech\./g, "btech")
    .replace(/b\.tech/g, "btech")
    .replace(/bachelor of technology/g, "btech")
    .replace(/m\.\s*tech\./g, "mtech")
    .replace(/m\.tech/g, "mtech")
    .replace(/master of technology/g, "mtech")
    .replace(/master of business administration/g, "mba")
    .replace(/[\(\)\,\-\.\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDistinctTokens(name: string): { norm: string; tokens: Set<string> } {
  const norm = normalizeString(name);
  const rawTokens = norm.split(" ");
  const distinct = new Set(rawTokens.filter((t) => !GENERIC_INST_TOKENS.has(t) && t.length > 1));
  return { norm, tokens: distinct };
}

// Pre-index unique vacancies
interface IndexedVacancy {
  item: VacancyItem;
  instNorm: string;
  instTokens: Set<string>;
  progNorm: string;
  progTokens: Set<string>;
}

const uniqueVacanciesMap = new Map<string, IndexedVacancy>();

vacancies.forEach((item) => {
  const key = `${item.instituteCode}_${item.programCode}`;
  if (!uniqueVacanciesMap.has(key)) {
    const { norm: instNorm, tokens: instTokens } = getDistinctTokens(item.instituteName);
    const { norm: progNorm, tokens: progTokens } = getDistinctTokens(item.programName);
    uniqueVacanciesMap.set(key, {
      item,
      instNorm,
      instTokens,
      progNorm,
      progTokens,
    });
  }
});

const indexedVacancies = Array.from(uniqueVacanciesMap.values());

/**
 * Matches raw parsed choices against official CSAB vacancies dataset with high precision
 */
export function matchChoicesWithCutoffs(
  parsedChoices: ParsedChoice[],
  filterCategory: string = "OPEN",
  filterQuota: string = "OS",
  filterSeatPool: string = "Gender-Neutral",
  userRank: number | null = null
): MatchedChoice[] {
  return parsedChoices.map((choice, index) => {
    const { norm: rawInstNorm, tokens: rawInstTokens } = getDistinctTokens(choice.rawInstitute);
    const { norm: rawProgNorm, tokens: rawProgTokens } = getDistinctTokens(choice.rawProgram);

    let bestMatch: VacancyItem | undefined = undefined;
    let highestScore = -1;

    for (const iv of indexedVacancies) {
      // 1. Calculate Institute Similarity
      let instScore = 0;
      if (rawInstNorm === iv.instNorm) {
        instScore = 1.0;
      } else if (rawInstTokens.size > 0 && iv.instTokens.size > 0) {
        const overlap = new Set([...rawInstTokens].filter((x) => iv.instTokens.has(x)));
        if (overlap.size === rawInstTokens.size || overlap.size === iv.instTokens.size) {
          instScore = 0.9;
        } else {
          instScore = overlap.size / Math.max(rawInstTokens.size, iv.instTokens.size);
        }
      }

      // STRICT REQUIREMENT: Institute must have at least 0.4 similarity
      if (instScore < 0.4) {
        continue;
      }

      // 2. Calculate Program Similarity
      let progScore = 0;
      if (rawProgNorm === iv.progNorm) {
        progScore = 1.0;
      } else if (rawProgTokens.size > 0 && iv.progTokens.size > 0) {
        const overlap = new Set([...rawProgTokens].filter((x) => iv.progTokens.has(x)));
        progScore = overlap.size / Math.max(rawProgTokens.size, iv.progTokens.size);
      }

      // Combined weighted score: 60% Institute + 40% Program
      const totalScore = instScore * 0.6 + progScore * 0.4;

      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestMatch = iv.item;
      }
    }

    let cutoff: CutoffData | null = null;
    let status: MatchedChoice["status"] = "UNMATCHED";

    if (bestMatch && highestScore >= 0.45) {
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
          status = "SAFE";
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
      matchedVacancy: highestScore >= 0.45 ? bestMatch : undefined,
      cutoff,
      matchScore: highestScore >= 0 ? highestScore : 0,
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
