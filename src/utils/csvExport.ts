import { VacancyItem } from "@/types/vacancy";

export function exportToCSV(items: VacancyItem[], filename = "CSAB_Filtered_Vacancies.csv") {
  const headers = [
    "Sr.No",
    "Institute Name",
    "Institute Code",
    "Institute Type",
    "Institute State",
    "Program Name",
    "Program Code",
    "Quota",
    "Category",
    "Seat Pool",
    "Vacancy"
  ];

  const rows = items.map((item, index) => [
    index + 1,
    `"${item.instituteName.replace(/"/g, '""')}"`,
    item.instituteCode,
    item.instituteType,
    `"${item.instituteState}"`,
    `"${item.programName.replace(/"/g, '""')}"`,
    `"${item.programCode}"`,
    item.quota,
    item.category,
    `"${item.seatPool}"`,
    item.vacancy
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
