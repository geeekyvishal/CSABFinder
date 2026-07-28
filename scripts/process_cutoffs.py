import pandas as pd
import json
import re

with open("src/data/vacancies.json", "r", encoding="utf-8") as f:
    vacancies = json.load(f)

df1 = pd.read_csv("src/data/csv/csab_2025_r1.csv")
df2 = pd.read_csv("src/data/csv/csab_2025_r2.csv")
df3 = pd.read_csv("src/data/csv/csab_2025_r3.csv")

df_all = pd.concat([df1, df2, df3], ignore_index=True)

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

cutoff_map = {}

for _, row in df_all.iterrows():
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

    if key not in cutoff_map:
        cutoff_map[key] = {"or": or_val, "cr": cr_val}
    else:
        cutoff_map[key]["or"] = min(cutoff_map[key]["or"], or_val)
        cutoff_map[key]["cr"] = max(cutoff_map[key]["cr"], cr_val)

matches = 0
matched_dict = {}

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

    if key in cutoff_map:
        matches += 1
        matched_dict[item_key] = {
            "or2025": cutoff_map[key]["or"],
            "cr2025": cutoff_map[key]["cr"]
        }

print(f"Successfully processed real 2025 CSAB cutoff data!")
print(f"Matched {matches} out of {len(vacancies)} vacancy items ({round(matches/len(vacancies)*100, 1)}% match rate).")

with open("src/data/cutoffs.json", "w", encoding="utf-8") as f:
    json.dump(matched_dict, f, indent=2)

print("Saved updated src/data/cutoffs.json")
