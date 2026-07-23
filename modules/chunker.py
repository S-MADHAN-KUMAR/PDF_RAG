from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextChunker:

    def __init__(
        self,
        chunk_size=1000,
        chunk_overlap=200,
    ):

        self.splitter = RecursiveCharacterTextSplitter(

            chunk_size=chunk_size,

            chunk_overlap=chunk_overlap,

            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ],
        )

    def chunk_pages(self, cleaned_pages):

        chunks = []

        chunk_id = 1

        for page in cleaned_pages:

            texts = self.splitter.split_text(page["text"])

            search_start = 0
            for text in texts:
                start_index = page["text"].find(text, search_start)
                if start_index == -1:
                    start_index = 0 # fallback

                end_index = start_index + len(text)
                
                start_line = page["text"].count('\n', 0, start_index) + 1
                end_line = page["text"].count('\n', 0, end_index) + 1
                
                if start_line == end_line:
                    lines = f"{start_line}"
                else:
                    lines = f"{start_line}-{end_line}"

                chunks.append({
                    "chunk_id": chunk_id,
                    "page": page["page"],
                    "lines": lines,
                    "text": text
                })

                search_start = start_index + 1
                chunk_id += 1

        return chunks