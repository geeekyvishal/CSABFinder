import pandas as pd
import json
import re
import os

with open("src/data/vacancies.json", "r", encoding="utf-8") as f:
    vacancies = json.load(f)

# Use newer CSV data from src/data/newcsv folder
CSV_DIR = "src/data/newcsv"
if not os.path.exists(CSV_DIR):
    CSV_DIR = "src/data/csv"

print(f"Reading CSAB 2025 Cutoff data from {CSV_DIR}...")

df1 = pd.read_csv(os.path.join(CSV_DIR, "csab_2025_r1.csv"))
df2 = pd.read_csv(os.path.join(CSV_DIR, "csab_2025_r2.csv"))
df3 = pd.read_csv(os.path.join(CSV_DIR, "csab_2025_r3.csv"))

def clean(text):
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9]", "", text)
    return text

def norm_cat(c):
    c = str(c).strip().upper()
    if c == "EWS": return "GEN-EWS"
    if "OBC" in c and "PWD" not in c: return "OBC-NCL"
    if "OBC" in c and "PWD" in c: return "OBC-NCL(PwD)"
    if "EWS" in c and "PWD" in c: return "GEN-EWS(PwD)"
    if "OPEN" in c and "PWD" in c: return "OPEN (PwD)"
    if "SC" in c and "PWD" in c: return "SC (PwD)"
    if "ST" in c and "PWD" in c: return "ST (PwD)"
    return c

def build_round_map(df):
    r_map = {}
    for _, row in df.iterrows():
        inst = clean(row["Institute"])
        prog = clean(row["Academic Program Name"])
        quota = str(row["Quota"]).strip().upper()
        cat = norm_cat(row["Seat Type"])
        gender = clean(row["Gender"])

        key = (inst, prog, quota, cat, gender)

        try:
            or_val = int(row["Opening Rank"])
            cr_val = int(row["Closing Rank"])
        except Exception:
            continue

        if key not in r_map:
            r_map[key] = {"or": or_val, "cr": cr_val}
        else:
            r_map[key]["or"] = min(r_map[key]["or"], or_val)
            r_map[key]["cr"] = max(r_map[key]["cr"], cr_val)
    return r_map

map_r1 = build_round_map(df1)
map_r2 = build_round_map(df2)
map_r3 = build_round_map(df3)

matched_dict = {}
matches = 0

for v in vacancies:
    inst = clean(v["instituteName"])
    prog = clean(v["programName"])
    quota = str(v["quota"]).strip().upper()
    cat = norm_cat(v["category"])
    gender = clean(v["seatPool"])

    key = (inst, prog, quota, cat, gender)
    inst_code = v["instituteCode"]
    prog_code = v["programCode"]
    v_quota = v["quota"]
    v_cat = v["category"]
    v_pool = v["seatPool"]

    item_key = f"{inst_code}_{prog_code}_{v_quota}_{v_cat}_{v_pool}"

    d1 = map_r1.get(key)
    d2 = map_r2.get(key)
    d3 = map_r3.get(key)

    if d1 or d2 or d3:
        matches += 1
        all_ors = [d["or"] for d in [d1, d2, d3] if d]
        all_crs = [d["cr"] for d in [d1, d2, d3] if d]

        matched_dict[item_key] = {
            "r1": d1,
            "r2": d2,
            "r3": d3,
            "minOr": min(all_ors) if all_ors else None,
            "maxCr": max(all_crs) if all_crs else None
        }

print(f"Successfully processed newer 2025 CSAB R1, R2, R3 cutoff data!")
print(f"Matched {matches} out of {len(vacancies)} vacancy items ({round(matches/len(vacancies)*100, 1)}% match rate).")

with open("src/data/cutoffs.json", "w", encoding="utf-8") as f:
    json.dump(matched_dict, f, indent=2)

print("Saved updated src/data/cutoffs.json")
