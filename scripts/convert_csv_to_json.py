import pandas as pd
import json
import os

df = pd.read_csv("CSAB_Vacancies.csv")

# State mapping for NITs and key institutes
NIT_STATE_MAP = {
    "Dr. B R Ambedkar National Institute of Technology, Jalandhar": "Punjab",
    "Malaviya National Institute of Technology Jaipur": "Rajasthan",
    "Maulana Azad National Institute of Technology Bhopal": "Madhya Pradesh",
    "Motilal Nehru National Institute of Technology Allahabad": "Uttar Pradesh",
    "National Institute of Technology Agartala": "Tripura",
    "National Institute of Technology Arunachal Pradesh": "Arunachal Pradesh",
    "National Institute of Technology Calicut": "Kerala",
    "National Institute of Technology Delhi": "Delhi",
    "National Institute of Technology Durgapur": "West Bengal",
    "National Institute of Technology Goa": "Goa",
    "National Institute of Technology Hamirpur": "Himachal Pradesh",
    "National Institute of Technology Karnataka, Surathkal": "Karnataka",
    "National Institute of Technology Meghalaya": "Meghalaya",
    "National Institute of Technology Nagaland": "Nagaland",
    "National Institute of Technology Patna": "Bihar",
    "National Institute of Technology Puducherry": "Puducherry",
    "National Institute of Technology Raipur": "Chhattisgarh",
    "National Institute of Technology Sikkim": "Sikkim",
    "National Institute of Technology, Andhra Pradesh": "Andhra Pradesh",
    "National Institute of Technology, Jamshedpur": "Jharkhand",
    "National Institute of Technology, Kurukshetra": "Haryana",
    "National Institute of Technology, Manipur": "Manipur",
    "National Institute of Technology, Mizoram": "Mizoram",
    "National Institute of Technology, Rourkela": "Odisha",
    "National Institute of Technology, Silchar": "Assam",
    "National Institute of Technology, Srinagar": "Jammu and Kashmir",
    "National Institute of Technology, Tiruchirappalli": "Tamil Nadu",
    "National Institute of Technology, Uttarakhand": "Uttarakhand",
    "National Institute of Technology, Warangal": "Telangana",
    "Visvesvaraya National Institute of Technology, Nagpur": "Maharashtra",
    "Sardar Vallabhbhai National Institute of Technology, Surat": "Gujarat",
    "Indian Institute of Engineering Science and Technology, Shibpur": "West Bengal"
}

def get_institute_type(name):
    n = name.lower()
    if ("national institute of technology" in n or "malaviya national" in n or 
        "maulana azad" in n or "motilal nehru" in n or "visvesvaraya national" in n or 
        "sardar vallabhbhai" in n or "shibpur" in n):
        return "NIT"
    if "information technology" in n or "iiit" in n:
        return "IIIT"
    return "GFTI"

def get_institute_state(name):
    if name in NIT_STATE_MAP:
        return NIT_STATE_MAP[name]
    n = name
    for state in [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Kashmir",
        "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
        "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Delhi", "Puducherry", "Chandigarh", "Diu"
    ]:
        if state.lower() in n.lower():
            return state
    return "All India"

records = []
institutes_summary = {}

for idx, row in df.iterrows():
    inst_name = str(row["Institute Name"]).strip()
    inst_code = int(row["Institute Code"]) if pd.notnull(row["Institute Code"]) else 0
    prog_name = str(row["Program Name"]).strip()
    prog_code = str(row["Program Code"]).strip()
    quota = str(row["Quota"]).strip()
    category = str(row["Category"]).strip()
    seat_pool = str(row["Seat Pool"]).strip()
    vacancy = int(row["Vacancy"]) if pd.notnull(row["Vacancy"]) else 0

    inst_type = get_institute_type(inst_name)
    inst_state = get_institute_state(inst_name)

    rec = {
        "id": int(row["Sr.No"]),
        "instituteName": inst_name,
        "instituteCode": inst_code,
        "programName": prog_name,
        "programCode": prog_code,
        "quota": quota,
        "category": category,
        "seatPool": seat_pool,
        "vacancy": vacancy,
        "instituteType": inst_type,
        "instituteState": inst_state
    }
    records.append(rec)

    if inst_name not in institutes_summary:
        institutes_summary[inst_name] = {
            "code": inst_code,
            "name": inst_name,
            "type": inst_type,
            "state": inst_state,
            "totalVacancies": 0,
            "programCount": set()
        }
    institutes_summary[inst_name]["totalVacancies"] += vacancy
    institutes_summary[inst_name]["programCount"].add(prog_name)

inst_list = []
for k, v in sorted(institutes_summary.items(), key=lambda x: x[0]):
    inst_list.append({
        "code": v["code"],
        "name": v["name"],
        "type": v["type"],
        "state": v["state"],
        "totalVacancies": v["totalVacancies"],
        "programCount": len(v["programCount"])
    })

os.makedirs("src/data", exist_ok=True)

with open("src/data/vacancies.json", "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=None)

with open("src/data/institutes.json", "w", encoding="utf-8") as f:
    json.dump(inst_list, f, ensure_ascii=False, indent=2)

print(f"Successfully processed {len(records)} vacancy records across {len(inst_list)} institutes.")
