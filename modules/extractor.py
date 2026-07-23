from pathlib import Path
from pypdf import PdfReader


class PDFExtractor:

    def extract(self, pdf_path: str):

        reader = PdfReader(pdf_path)

        pages = []

        for page_number, page in enumerate(reader.pages, start=1):

            text = page.extract_text() or ""

            pages.append({
                "page": page_number,
                "text": text
            })

        return pages