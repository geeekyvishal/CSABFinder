export interface StateInfo {
  name: string;
  code: string;
  hasNIT: boolean;
}

export const INDIAN_STATES: StateInfo[] = [
  { name: "Andhra Pradesh", code: "AP", hasNIT: true },
  { name: "Arunachal Pradesh", code: "AR", hasNIT: true },
  { name: "Assam", code: "AS", hasNIT: true },
  { name: "Bihar", code: "BR", hasNIT: true },
  { name: "Chhattisgarh", code: "CG", hasNIT: true },
  { name: "Goa", code: "GA", hasNIT: true },
  { name: "Gujarat", code: "GJ", hasNIT: true },
  { name: "Haryana", code: "HR", hasNIT: true },
  { name: "Himachal Pradesh", code: "HP", hasNIT: true },
  { name: "Jammu and Kashmir", code: "JK", hasNIT: true },
  { name: "Jharkhand", code: "JH", hasNIT: true },
  { name: "Karnataka", code: "KA", hasNIT: true },
  { name: "Kerala", code: "KL", hasNIT: true },
  { name: "Ladakh", code: "LA", hasNIT: false },
  { name: "Madhya Pradesh", code: "MP", hasNIT: true },
  { name: "Maharashtra", code: "MH", hasNIT: true },
  { name: "Manipur", code: "MN", hasNIT: true },
  { name: "Meghalaya", code: "ML", hasNIT: true },
  { name: "Mizoram", code: "MZ", hasNIT: true },
  { name: "Nagaland", code: "NL", hasNIT: true },
  { name: "Odisha", code: "OD", hasNIT: true },
  { name: "Punjab", code: "PB", hasNIT: true },
  { name: "Rajasthan", code: "RJ", hasNIT: true },
  { name: "Sikkim", code: "SK", hasNIT: true },
  { name: "Tamil Nadu", code: "TN", hasNIT: true },
  { name: "Telangana", code: "TS", hasNIT: true },
  { name: "Tripura", code: "TR", hasNIT: true },
  { name: "Uttar Pradesh", code: "UP", hasNIT: true },
  { name: "Uttarakhand", code: "UK", hasNIT: true },
  { name: "West Bengal", code: "WB", hasNIT: true },
  { name: "Delhi", code: "DL", hasNIT: true },
  { name: "Puducherry", code: "PY", hasNIT: true },
  { name: "Chandigarh", code: "CH", hasNIT: false },
  { name: "Andaman and Nicobar Islands", code: "AN", hasNIT: false },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN", hasNIT: false },
  { name: "Lakshadweep", code: "LD", hasNIT: false },
];

export const CATEGORIES = [
  "ALL",
  "OPEN",
  "GEN-EWS",
  "OBC-NCL",
  "SC",
  "ST",
  "OPEN (PwD)",
  "GEN-EWS(PwD)",
  "OBC-NCL(PwD)",
  "SC (PwD)",
  "ST (PwD)"
];

export const SEAT_POOLS = [
  "ALL",
  "Gender-Neutral",
  "Female-only (including Supernumerary)"
];

export const QUOTAS = [
  "ALL",
  "HS",
  "OS",
  "AI",
  "GO",
  "JK",
  "LA"
];

export const MAJOR_BRANCHES = [
  "Computer Science",
  "Electronics and Communication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Bio Technology",
  "Information Technology",
  "Data Science",
  "Artificial Intelligence",
  "Aerospace",
  "Metallurgical",
  "Mathematics and Computing",
  "Production"
];
