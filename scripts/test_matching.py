import pandas as pd
import json
import re

choices_df = pd.read_csv("choices/choices_1.csv")
with open("src/data/vacancies.json", "r") as f:
    vacancies = json.load(f)

unique_vacancies = []
seen = set()
for v in vacancies:
    key = (v["instituteName"], v["programName"])
    if key not in seen:
        seen.add(key)
        unique_vacancies.append(v)

def normalize(s):
    s = str(s).lower()
    s = s.replace("&", "and")
    s = s.replace("b. tech.", "btech").replace("b.tech", "btech").replace("bachelor of technology", "btech")
    s = s.replace("m. tech.", "mtech").replace("m.tech", "mtech").replace("master of technology", "mtech")
    s = s.replace("master of business administration", "mba")
    s = re.sub(r"[\(\)\,\-\.\/]", " ", s)
    s = " ".join(s.split())
    return s

def get_keywords(inst_name):
    norm = normalize(inst_name)
    tokens = set(norm.split())
    generic = {"national", "institute", "of", "technology", "indian", "information", "and", "management", "science", "engineering"}
    distinct = tokens - generic
    return norm, distinct

indexed_vacancies = []
for v in unique_vacancies:
    inst_norm, inst_tokens = get_keywords(v["instituteName"])
    prog_norm, prog_tokens = get_keywords(v["programName"])
    indexed_vacancies.append({
        "item": v,
        "inst_norm": inst_norm,
        "inst_tokens": inst_tokens,
        "prog_norm": prog_norm,
        "prog_tokens": prog_tokens
    })

low_scores = []
for _, row in choices_df.iterrows():
    c_num = row["Choice No"]
    c_inst = row["Institute Name"]
    c_prog = row["Academic Program"]
    
    raw_inst_norm, raw_inst_tokens = get_keywords(c_inst)
    raw_prog_norm, raw_prog_tokens = get_keywords(c_prog)
    
    best_item = None
    best_score = -1.0
    
    for iv in indexed_vacancies:
        # Institute score
        if raw_inst_norm == iv["inst_norm"]:
            inst_score = 1.0
        else:
            if not raw_inst_tokens or not iv["inst_tokens"]:
                inst_score = 0.0
            else:
                overlap = raw_inst_tokens.intersection(iv["inst_tokens"])
                if len(overlap) == len(raw_inst_tokens) or len(overlap) == len(iv["inst_tokens"]):
                    inst_score = 0.9
                else:
                    inst_score = len(overlap) / max(len(raw_inst_tokens), len(iv["inst_tokens"]))
        
        if inst_score < 0.4:
            continue
        
        # Program score
        if raw_prog_norm == iv["prog_norm"]:
            prog_score = 1.0
        else:
            if not raw_prog_tokens or not iv["prog_tokens"]:
                prog_score = 0.0
            else:
                overlap = raw_prog_tokens.intersection(iv["prog_tokens"])
                prog_score = len(overlap) / max(len(raw_prog_tokens), len(iv["prog_tokens"]))
        
        total_score = (inst_score * 0.6) + (prog_score * 0.4)
        if total_score > best_score:
            best_score = total_score
            best_item = iv["item"]
            
    if best_score < 0.7:
        low_scores.append((c_num, c_inst, c_prog, best_item["instituteName"] if best_item else "NONE", best_score))

print(f"Total choices evaluated: {len(choices_df)}")
print(f"Low score count (<0.7): {len(low_scores)}")
for num, inst, prog, m_inst, score in low_scores:
    print(f"Choice {num} (score {round(score, 2)}): {inst} -> {m_inst}")
