export interface VacancyItem {
  id: number;
  instituteName: string;
  instituteCode: number;
  programName: string;
  programCode: string;
  quota: string; // HS, OS, AI, GO, JK, LA
  category: string; // OPEN, GEN-EWS, OBC-NCL, SC, ST, PwD variants
  seatPool: string; // Gender-Neutral, Female-only
  vacancy: number;
  instituteType: 'NIT' | 'IIIT' | 'GFTI';
  instituteState: string;
}

export interface CutoffRoundData {
  or: number;
  cr: number;
}

export interface CutoffData {
  r1?: CutoffRoundData | null;
  r2?: CutoffRoundData | null;
  r3?: CutoffRoundData | null;
  minOr?: number | null;
  maxCr?: number | null;
}

export interface InstituteSummary {
  code: number;
  name: string;
  type: 'NIT' | 'IIIT' | 'GFTI';
  state: string;
  totalVacancies: number;
  programCount: number;
}

export interface FilterState {
  searchQuery: string;
  homeState: string; // Selected Candidate State of Eligibility
  category: string;
  seatPool: string;
  instituteType: string; // 'ALL' | 'NIT' | 'IIIT' | 'GFTI'
  instituteName: string;
  programName: string;
  quota: string;
  minVacancy: number;
  eligibilityFilter: 'ALL' | 'HS_ONLY' | 'OS_ONLY';
  showRound1: boolean;
  showRound2: boolean;
  showRound3: boolean;
  userRank: string; // Candidate's JEE Main Rank
  rankDelta: number; // Rank Buffer / Delta (e.g. 5000, 10000, 20000)
}

export interface WizardState {
  step: number;
  homeState: string;
  category: string;
  seatPool: string;
  selectedBranches: string[];
  preferredInstituteTypes: string[];
  minSeats: number;
}
