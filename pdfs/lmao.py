import pdfplumber
import pandas as pd
from tqdm import tqdm

rows = []

expected_columns = [
    "Sr.No",
    "Institute Name",
    "Institute Code",
    "Program Name",
    "Program Code",
    "Quota",
    "Category",
    "Seat Pool",
    "Vacancy"
]

with pdfplumber.open("CSAB.pdf") as pdf:

    for page in tqdm(pdf.pages):

        tables = page.extract_tables()

        for table in tables:

            if not table:
                continue

            # Skip header
            data_rows = table[1:]

            for row in data_rows:

                if row is None:
                    continue

                # Remove blank rows
                if all(cell is None or str(cell).strip() == "" for cell in row):
                    continue

                # Skip repeated headers
                if row[0] == "Sr.No":
                    continue

                # Clean multiline text
                cleaned = [
                    cell.replace("\n", " ").strip() if cell else ""
                    for cell in row
                ]

                rows.append(cleaned)

df = pd.DataFrame(rows, columns=expected_columns)

# Remove duplicate rows if any
df = df.drop_duplicates()

df.to_csv("CSAB_Vacancies.csv", index=False)

print(df.head())
print(f"\nTotal rows extracted: {len(df)}")