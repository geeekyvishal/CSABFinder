import pdfplumber

pdf_path = "choices/choices 1.pdf"

with pdfplumber.open(pdf_path) as pdf:
    for page_idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        print(f"--- Page {page_idx+1} found {len(tables)} tables ---")
        for table in tables:
            for row in table[:5]:
                clean_row = [str(c).replace('\n', ' ') if c else '' for c in row]
                print(clean_row)
