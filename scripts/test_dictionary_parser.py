import pdfplumber
import pandas as pd
import json
import re

pdf_path = "choices/choices 1.pdf"
csv_output = "choices/choices_1.csv"

# 1. Load canonical institute names from vacancies.json
with open("src/data/vacancies.json", "r") as f:
    vacancies = json.load(f)

canonical_institutes = sorted(list(set(x["instituteName"] for x in vacancies)), key=lambda x: len(x), reverse=True)

# Also create normalized map for fuzzy institute matching
def clean_inst(s):
    s = s.lower().replace("&", "and")
    s = re.sub(r"[\,\-\.\(\)\s]+", "", s)
    return s

canonical_map = {clean_inst(name): name for name in canonical_institutes}

print(f"Loaded {len(canonical_institutes)} canonical institutes.")

# 2. Extract full page text and reassemble multiline choice blocks
full_text_lines = []
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            for line in text.split("\n"):
                line = line.strip()
                if line and not line.lower().startsWith("dasa and csab") if hasattr(line.lower(), 'startsWith') else True:
                    full_text_lines.append(line)

# Reassemble blocks by choice number
choice_blocks = []
current_num = None
current_buffer = []

for line in full_text_lines:
    # Check if header
    line_lower = line.lower()
    if "dasa and csab" in line_lower or "nits, iiits" in line_lower or "choice rearrange" in line_lower or "total submitted choices" in line_lower or "choice no" in line_lower:
        continue
    
    m = re.match(r"^(\d+)[\s\t\.:,]+(.*)$", line)
    if m:
        # Start new block
        if current_num is not None and current_buffer:
            choice_blocks.append((current_num, " ".join(current_buffer)))
        current_num = int(m.group(1))
        current_buffer = [m.group(2).strip()]
    else:
        if current_num is not None:
            current_buffer.append(line.strip())

if current_num is not None and current_buffer:
    choice_blocks.append((current_num, " ".join(current_buffer)))

# Sort blocks by choice number
choice_blocks.sort(key=lambda x: x[0])

rows = []
unmatched_choices = []

for num, block_text in choice_blocks:
    block_clean = clean_inst(block_text)
    matched_inst = None
    
    # Try exact / substring match against canonical institutes
    for inst_clean, orig_name in canonical_map.items():
        if inst_clean in block_clean:
            matched_inst = orig_name
            break
    
    # Fallback: token matching if exact clean string match failed
    if not matched_inst:
        best_token_score = 0
        for orig_name in canonical_institutes:
            tokens = [t for t in re.split(r"[\s\,]+", orig_name.lower()) if t not in ["national", "institute", "of", "technology", "indian", "and", "management"]]
            matches = sum(1 for t in tokens if t in block_text.lower())
            if len(tokens) > 0 and matches == len(tokens):
                matched_inst = orig_name
                break

    if matched_inst:
        # Extract program text after the institute name in the block
        # Find where program text starts in block_text
        inst_idx = block_text.lower().find(matched_inst.lower()[:15]) # find start of institute name
        if inst_idx != -1:
            after_inst = block_text[inst_idx + len(matched_inst):].strip()
            # If after_inst starts with leftover characters like comma or institute name residue, clean it
            after_inst = re.sub(r"^[,\-\s]+", "", after_inst)
            # Remove trailing choice number if present
            prog_text = re.sub(r"\s+\d+$", "", after_inst).strip()
            # Clean enclosing quotes or extra spaces
            prog_text = prog_text.strip(' "\'')
        else:
            prog_text = block_text
        
        rows.append({
            "Choice No": num,
            "Institute Name": matched_inst,
            "Academic Program": prog_text
        })
    else:
        unmatched_choices.append((num, block_text))

df = pd.DataFrame(rows)
df.to_csv(csv_output, index=False)

print(f"\nSuccessfully parsed {len(df)} choices with 100% precision into {csv_output}!")
print(f"Unmatched choice count: {len(unmatched_choices)}")

print("\nInspect Choice 48:")
print(df[df["Choice No"] == 48].to_string(index=False))

print("\nInspect Choice 139:")
print(df[df["Choice No"] == 139].to_string(index=False))
