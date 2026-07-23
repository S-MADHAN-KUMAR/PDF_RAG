import io
from pathlib import Path
from pypdf import PdfReader


class PDFExtractor:

    def extract(self, pdf_source):
        """
        Extract text per page from a PDF.

        `pdf_source` can be:
          - raw bytes / bytearray (e.g. read straight from an upload, no disk write)
          - a file-like object (BytesIO, SpooledTemporaryFile, etc.)
          - a path (str or Path) to a PDF already on disk
        """

        if isinstance(pdf_source, (bytes, bytearray)):
            pdf_source = io.BytesIO(pdf_source)

        reader = PdfReader(pdf_source)

        pages = []

        for page_number, page in enumerate(reader.pages, start=1):

            text = page.extract_text() or ""

            pages.append({
                "page": page_number,
                "text": text
            })

        return pages