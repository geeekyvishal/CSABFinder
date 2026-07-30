import pdfplumber
import pandas as pd
import re
import os

pdf_path = "choices/choices 1.pdf"
csv_output = "choices/choices_1.csv"

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} not found.")
    exit(1)

print(f"Extracting choices from {pdf_path}...")

rows = []

PROGRAM_KEYWORDS = [
    "computer science", "electronics and communication", "electronics & communication",
    "electrical engineering", "mechanical engineering", "civil engineering",
    "chemical engineering", "information technology", "data science",
    "artificial intelligence", "bio technology", "biotechnology", "biomedical",
    "aerospace", "metallurgical", "materials engineering", "production engineering",
    "industrial", "instrumentation", "mechatronics", "architecture", "planning",
    "mathematics and computing", "physics", "chemistry", "engineering physics"
]

def split_inst_and_prog(row_text):
    lower_text = row_text.lower()
    best_keyword_idx = -1
    for kw in PROGRAM_KEYWORDS:
        idx = lower_text.find(kw)
        if idx != -1:
            if best_keyword_idx == -1 or idx < best_keyword_idx:
                best_keyword_idx = idx
    
    if best_keyword_idx != -1:
        inst = row_text[:best_keyword_idx].strip()
        prog = row_text[best_keyword_idx:].strip()
        # Remove trailing choice number if present
        prog = re.sub(r"\s+\d+$", "", prog).strip()
        inst = re.sub(r",$", "", inst).strip()
        return inst, prog
    return None, None

with pdfplumber.open(pdf_path) as pdf:
    for page_no, page in enumerate(pdf.pages):
        # Try extract_tables first
        tables = page.extract_tables()
        if tables:
            for table in tables:
                for row in table:
                    if not row:
                        continue
                    clean_row = [" ".join(str(cell).split()) for cell in row if cell is not None]
                    if not clean_row:
                        continue
                    
                    # Check if header
                    header_check = " ".join(clean_row).lower()
                    if "choice no" in header_check or "institute name" in header_check or "dasa and csab" in header_check:
                        continue
                    
                    if len(clean_row) >= 3:
                        # [Choice No, Institute, Program, ...]
                        choice_no = clean_row[0]
                        if choice_no.isdigit():
                            rows.append({
                                "Choice No": int(choice_no),
                                "Institute Name": clean_row[1],
                                "Academic Program": clean_row[2]
                            })
                            continue
        
        # Fallback to text parsing
        text = page.extract_text()
        if text:
            for line in text.split("\n"):
                line = line.strip()
                if not line or "choice no" in line.lower() or "dasa and csab" in line.lower():
                    continue
                
                m = re.match(r"^(\d+)[\s\t]+(.*)$", line)
                if m:
                    choice_no = int(m.group(1))
                    rest = m.group(2).strip()
                    inst, prog = split_inst_and_prog(rest)
                    if inst and prog:
                        # Avoid duplicates from table extraction
                        if not any(r["Choice No"] == choice_no for r in rows):
                            rows.append({
                                "Choice No": choice_no,
                                "Institute Name": inst,
                                "Academic Program": prog
                            })

# Sort by Choice No
rows.sort(key=lambda x: x["Choice No"])

df = pd.DataFrame(rows)
df.to_csv(csv_output, index=False)

print(f"Successfully extracted {len(df)} choices to {csv_output}!")
print("\nFirst 10 choices extracted:")
print(df.head(10).to_string(index=False))
