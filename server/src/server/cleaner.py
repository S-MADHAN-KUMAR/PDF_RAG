import re
import unicodedata
from collections import Counter


class TextCleaner:

    def normalize_unicode(self, text):
        return unicodedata.normalize("NFKC", text)

    def remove_page_numbers(self, text):

        patterns = [
            r"^\s*\d+\s*$",
            r"^\s*Page\s+\d+\s*$",
            r"^\s*\d+\s*/\s*\d+\s*$",
            r"^\s*-\s*\d+\s*-\s*$",
        ]

        lines = []

        for line in text.splitlines():

            keep = True

            for pattern in patterns:
                if re.match(pattern, line, re.IGNORECASE):
                    keep = False
                    break

            if keep:
                lines.append(line)

        return "\n".join(lines)

    def remove_duplicate_spaces(self, text):

        text = re.sub(r"[ \t]+", " ", text)

        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    def fix_broken_lines(self, text):

        paragraphs = []

        current = []

        for line in text.splitlines():

            line = line.strip()

            if line == "":

                if current:
                    paragraphs.append(" ".join(current))
                    current = []

                paragraphs.append("")
                continue

            current.append(line)

        if current:
            paragraphs.append(" ".join(current))

        return "\n".join(paragraphs)

    def detect_headers_footers(self, pages):

        first = []
        last = []

        for page in pages:

            lines = [
                x.strip()
                for x in page["text"].splitlines()
                if x.strip()
            ]

            if not lines:
                continue

            first.append(lines[0])
            last.append(lines[-1])

        headers = {
            x for x, c in Counter(first).items()
            if c > 1
        }

        footers = {
            x for x, c in Counter(last).items()
            if c > 1
        }

        return headers, footers

    def remove_headers_footers(
        self,
        text,
        headers,
        footers,
    ):

        cleaned = []

        for line in text.splitlines():

            if line.strip() in headers:
                continue

            if line.strip() in footers:
                continue

            cleaned.append(line)

        return "\n".join(cleaned)

    def clean_pages(self, pages):

        headers, footers = self.detect_headers_footers(pages)

        cleaned = []

        for page in pages:

            text = page["text"]

            text = self.normalize_unicode(text)

            text = self.remove_headers_footers(
                text,
                headers,
                footers,
            )

            text = self.remove_page_numbers(text)

            text = self.fix_broken_lines(text)

            text = self.remove_duplicate_spaces(text)

            cleaned.append({
                "page": page["page"],
                "text": text
            })

        return cleaned