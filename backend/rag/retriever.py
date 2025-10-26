import os
import time
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
VECTOR_DIR = "vector_store"

def query_document(doc_id : str, question : str):
    start_time = time.time()
    vector_path = os.path.join(VECTOR_DIR,f"{doc_id}.faiss")

    if not os.path.exists(vector_path):
        return {"error":"Document Not found"}
    
    embeddings = HuggingFaceEmbeddings(model_name = "sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.load_local(vector_path, embeddings, allow_dangerous_deserialization=True)

    results = db.similarity_search_with_score(question, k=3)

    context_texts = [doc.page_content for doc, _ in results]
    context = "\n\n".join(context_texts)

    model = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.3
    )

    template = """
        You are an intelligent assistant. Use the provided context to answer the question.
        If the answer is not found in the context, say "I'm not sure based on the document."

        Context:
        {context}

        Question:
        {question}

        Answer:
        """

    prompt = ChatPromptTemplate.from_template(template)
    formatted_prompt = prompt.format(context=context, question = question)

    response = model.invoke(formatted_prompt)
    answer = response.content

    processing_time = round(time.time()- start_time, 2)

    sources = [
        {"chunk_text": doc.page_content[:200], "relevance_score": float(score)}
        for doc, score in results
    ]

    return {
        "document_id" : doc_id,
        "question": question,
        "answer": answer,
        "sources": sources,
        "processing_time_seconds": processing_time
    }



    

