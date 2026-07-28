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
  eligibilityFilter: 'ALL' | 'HS_ONLY' | 'OS_ONLY'; // Match state eligibility
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
