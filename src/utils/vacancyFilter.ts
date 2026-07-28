import { VacancyItem, FilterState } from "@/types/vacancy";

export function filterVacancies(
  items: VacancyItem[],
  filters: FilterState
): VacancyItem[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const selectedHomeState = filters.homeState.toLowerCase();

  return items.filter((item) => {
    // 1. Text Search
    if (query) {
      const matchName = item.instituteName.toLowerCase().includes(query);
      const matchCode = item.instituteCode.toString().includes(query);
      const matchProgram = item.programName.toLowerCase().includes(query);
      const matchProgCode = item.programCode.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchProgram && !matchProgCode) {
        return false;
      }
    }

    // 2. Minimum Vacancy Filter
    if (item.vacancy < filters.minVacancy) {
      return false;
    }

    // 3. Category Filter
    if (filters.category !== "ALL" && item.category !== filters.category) {
      return false;
    }

    // 4. Seat Pool Filter
    if (filters.seatPool !== "ALL" && item.seatPool !== filters.seatPool) {
      return false;
    }

    // 5. Institute Type Filter (NIT / IIIT / GFTI)
    if (filters.instituteType !== "ALL" && item.instituteType !== filters.instituteType) {
      return false;
    }

    // 6. Specific Institute Filter
    if (filters.instituteName !== "ALL" && item.instituteName !== filters.instituteName) {
      return false;
    }

    // 7. Specific Program Filter
    if (filters.programName !== "ALL" && !item.programName.toLowerCase().includes(filters.programName.toLowerCase())) {
      return false;
    }

    // 8. Specific Quota Filter
    if (filters.quota !== "ALL" && item.quota !== filters.quota) {
      return false;
    }

    // 9. Candidate State Eligibility Logic (HS vs OS Auto-Engine)
    if (filters.homeState !== "ALL" && selectedHomeState) {
      const isSameState = item.instituteState.toLowerCase() === selectedHomeState;

      if (filters.eligibilityFilter === "HS_ONLY") {
        // Must be Home State quota matching user's state or AI
        if (item.quota === "HS" && !isSameState) return false;
        if (item.quota === "OS") return false;
      } else if (filters.eligibilityFilter === "OS_ONLY") {
        // Must be Other State quota
        if (item.quota === "HS") return false;
        if (item.quota === "OS" && isSameState) return false;
      }
    }

    return true;
  });
}

export function calculateStats(items: VacancyItem[]) {
  const totalSeats = items.reduce((acc, curr) => acc + curr.vacancy, 0);
  const totalRecords = items.length;
  const uniqueInstitutes = new Set(items.map((i) => i.instituteName)).size;
  const uniquePrograms = new Set(items.map((i) => i.programName)).size;

  const nitSeats = items.filter((i) => i.instituteType === "NIT").reduce((a, b) => a + b.vacancy, 0);
  const iiitSeats = items.filter((i) => i.instituteType === "IIIT").reduce((a, b) => a + b.vacancy, 0);
  const gftiSeats = items.filter((i) => i.instituteType === "GFTI").reduce((a, b) => a + b.vacancy, 0);

  return {
    totalSeats,
    totalRecords,
    uniqueInstitutes,
    uniquePrograms,
    nitSeats,
    iiitSeats,
    gftiSeats,
  };
}
