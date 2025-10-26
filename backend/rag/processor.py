import os
import pickle
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

VECTOR_DIR = "vector_store"

def process_and_store(doc_id :str, text:str):
    os.makedirs(VECTOR_DIR, exist_ok=True)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 800,
        chunk_overlap = 100
    )

    chunks = splitter.split_text(text)
    print(f"DEBUG: Extracted {len(chunks)} chunks")

    if not chunks:
        raise ValueError("No text extracted from the document. Try OCR extraction.")

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    vector_store = FAISS.from_texts(chunks, embedding=embeddings)

    file_path = os.path.join(VECTOR_DIR, f"{doc_id}.faiss")
    vector_store.save_local(file_path)

    return len(chunks)