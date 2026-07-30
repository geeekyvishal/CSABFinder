import pdfplumber
import pandas as pd
import re
import os

pdf_path = "choices/choices 1.pdf"
csv_output = "choices/choices_1.csv"

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} not found.")
    exit(1)

print(f"Extracting choices matrix from {pdf_path} using cell-table extraction...")

rows = []

def clean_text(val):
    if not val:
        return ""
    # Replace linebreaks inside cell with space
    val = str(val).replace("\n", " ").replace("\r", " ")
    # Collapse multiple spaces into single space
    val = re.sub(r"\s+", " ", val)
    # Strip leading/trailing quotes and spaces
    val = val.strip(' "\'\t\r\n')
    return val

with pdfplumber.open(pdf_path) as pdf:
    for page_no, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables:
            continue
        
        for table in tables:
            for row in table:
                if not row or len(row) < 3:
                    continue
                
                c0 = clean_text(row[0])
                c1 = clean_text(row[1])
                c2 = clean_text(row[2])
                
                # Check if row 0 is choice number digit
                if c0.isdigit():
                    choice_no = int(c0)
                    inst_name = c1
                    prog_name = c2
                    
                    # Remove trailing choice number if it leaked into program cell
                    prog_name = re.sub(r"\s+\d+$", "", prog_name).strip()
                    
                    rows.append({
                        "Choice No": choice_no,
                        "Institute Name": inst_name,
                        "Academic Program": prog_name
                    })

# Deduplicate and sort by Choice No
seen_nums = set()
unique_rows = []
for r in sorted(rows, key=lambda x: x["Choice No"]):
    if r["Choice No"] not in seen_nums:
        seen_nums.add(r["Choice No"])
        unique_rows.append(r)

df = pd.DataFrame(unique_rows)
df.to_csv(csv_output, index=False)

print(f"\nSuccessfully extracted all {len(df)} choices to {csv_output}!")

print("\nInspect Choice 48:")
print(df[df["Choice No"] == 48].to_string(index=False))

print("\nInspect Choice 139:")
print(df[df["Choice No"] == 139].to_string(index=False))
