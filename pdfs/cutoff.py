import pdfplumber
import pandas as pd
from pathlib import Path
from tqdm import tqdm

PDF_FOLDER = Path(__file__).parent
pdf_files = sorted(PDF_FOLDER.glob("*.pdf"))

columns = [
    "Institute",
    "Academic Program Name",
    "Quota",
    "Seat Type",
    "Gender",
    "Opening Rank",
    "Closing Rank",
]

table_settings = {
    "vertical_strategy": "lines",
    "horizontal_strategy": "lines",
    "snap_tolerance": 5,
    "join_tolerance": 5,
    "intersection_tolerance": 5,
}


def clean(cell):
    if cell is None:
        return ""
    return " ".join(cell.replace("\n", " ").split())


for pdf_path in pdf_files:

    print(f"\nProcessing {pdf_path.name}")

    rows = []

    with pdfplumber.open(pdf_path) as pdf:

        # Skip cover page
        for page_no, page in enumerate(tqdm(pdf.pages[1:])):

            # Crop page 2 to remove Important Information
            if page_no == 0:
                w, h = page.width, page.height
                page = page.crop((0, h * 0.33, w, h))

            tables = page.extract_tables(table_settings)

            if not tables:
                continue

            for table in tables:

                for row in table:

                    if not row:
                        continue

                    row = [clean(x) for x in row]

                    # Skip blank rows
                    if all(x == "" for x in row):
                        continue

                    # Skip header
                    if row[0] == "Institute":
                        continue

                    # Skip malformed rows
                    if len(row) < 7:
                        continue

                    rows.append(row[:7])

    df = pd.DataFrame(rows, columns=columns)

    df = (
        df.drop_duplicates()
          .reset_index(drop=True)
    )

    out = pdf_path.with_suffix(".csv")
    df.to_csv(out, index=False)

    print(f"Saved {out.name}")
    print(f"Rows extracted: {len(df)}")