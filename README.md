# Smart Document Q&A Assistant

An **AI-powered document understanding system** built with **FastAPI**, **Next.js (App Router)**, **LangChain**, **Groq (LLaMA 3)**, Postgres and **Supabase Storage**.

This application allows users to **upload PDFs or text files**, automatically process them into embeddings using **FAISS** and **Sentence Transformers**, and then **ask natural language questions** about their contents — all in real time.

---

## Deployed Links
- Frontend (Vercel) - https://smart-qna-teal.vercel.app
- Backend (Render) - https://qna-ai.onrender.com

## 🚀 Features

- Upload PDF/TXT files through a modern, responsive UI  
- Ask natural language questions about uploaded documents  
- Fast, low-latency answers via **Groq’s LLaMA 3** model  
- Vector-based semantic search with **FAISS**  
- Secure file storage on **Supabase**  
- Backend built with **FastAPI (Python)**  
- Frontend built with **Next.js + Tailwind + shadcn/ui**  
- CORS-enabled API communication (**Vercel ↔ Render**)  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI, LangChain, Groq API |
| **Vector DB** | FAISS (local index) |
| **Storage** | Supabase Storage |
| **Embeddings** | Sentence Transformers (`all-MiniLM-L6-v2`) |
| **Model** | LLaMA 3 (via Groq API) |
| **Deployment** | Backend: Render • Frontend: Vercel |

---

## ⚙️ Setup Instructions

Follow these steps to run the project locally 👇

### 1️. Clone the Repository
```bash
git clone https://github.com/AbhayKatoch/QnA-AI-.git
cd QnA-AI-
```
### 2. Setup Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
```
### 3. Setup Frontend (NextJs)
```bash
cd frontend
npm install
```

## 📡 API Documentation

### 🔗 Base URL - https://qna-ai.onrender.com/api


---

### ** 1. Upload Document**
**Endpoint:** `POST /documents/upload`

####  Description
Uploads a **PDF** or **TXT** file, extracts its text, chunks the content, and stores embeddings in FAISS for later retrieval.

####  Request
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|--------|------|-----------|--------------|
| `file` | File (PDF/TXT) | ✅ | The document file to upload |

**Example Request (cURL):**
```bash
curl -X POST https://your-backend.onrender.com/api/documents/upload \
  -F "file=@contract.pdf"
```

#### Response
{
  "document_id": "1234-5678-9012",
  "filename": "contract.pdf",
  "status": "processed",
  "chunks_created": 12,
  "uploaded_at": "2025-10-24T12:45:32.123Z"
}


### 2. List Documents

**Endpoint:** `GET /documents`

---

#### Description  
Fetches all uploaded and processed documents.

---

####  Request  
No parameters required.

**Example Request:**
```bash
curl -X GET https://your-backend.onrender.com/api/documents
```

#### Response
{
  "documents": [
    {
      "document_id": "1234-5678",
      "filename": "contract.pdf",
      "uploaded_at": "2025-10-24T12:45:32Z"
    },
    {
      "document_id": "9876-5432",
      "filename": "invoice.txt",
      "uploaded_at": "2025-10-25T10:12:11Z"
    }
  ]
}


### 3. Query a Document

**Endpoint:** `GET /documents/query`

---

#### Description  
Ask a natural language question about an uploaded document.
The system retrieves relevant text chunks using FAISS and generates an intelligent answer using the Groq LLaMA 3 model.

---

####  Request  
| Parameter     | Type     | Required | Description                            |
| ------------- | -------- | -------- | -------------------------------------- |
| `document_id` | `string` | ✅        | The unique ID of the uploaded document |
| `question`    | `string` | ✅        | The user’s natural language query      |

**Example Request:**
```bash
curl -X GET "https://your-backend.onrender.com/api/documents/query?document_id=1234-5678&question=Summarize%20the%20agreement"

```

#### Response
{
  "document_id": "1234-5678",
  "question": "What is this document about?",
  "answer": "This document summarizes an employee contract agreement between the company and the employee.",
  "sources": [
    {
      "chunk_text": "The contract between the company and the employee outlines...",
      "relevance_score": 0.87
    },
    {
      "chunk_text": "The agreement ensures fair compensation and terms of employment...",
      "relevance_score": 0.83
    }
  ],
  "processing_time_seconds": 2.3
}



### 4. Delete a Document

**Endpoint:** `DELETE /documents/{document_id}`

---

#### Description  
Deletes a specific document and its corresponding embeddings from both Supabase and FAISS index.

---

####  Request  
| Parameter     | Type     | Required | Description                             |
| ------------- | -------- | -------- | --------------------------------------- |
| `document_id` | `string` | ✅        | The unique ID of the document to delete |


**Example Request:**
```bash
curl -X DELETE https://your-backend.onrender.com/api/documents/1234-5678


```

#### Response
{
  "message": "Document deleted successfully."
}


## 🧠 Design Decisions (under 500 words)

The **Smart Document Q&A Assistant** was designed to combine the efficiency of **retrieval-based semantic search** with the intelligence of **LLMs (Large Language Models)**.

---

### 🧩 Backend Design  
The **FastAPI** backend handles file uploads, preprocessing, and text chunking.  
Each document is split into manageable text segments, vectorized using the **Sentence Transformer `all-MiniLM-L6-v2`**, and stored in **FAISS** for high-speed similarity retrieval.  

When a user asks a question, the system retrieves the most relevant chunks and sends them as context to the **Groq LLaMA 3 model** via **LangChain**, ensuring that responses are **context-aware and grounded** in the original document.

---

### 💻 Frontend Design  
The frontend is built using **Next.js (App Router)**, **Tailwind CSS**, and **shadcn/ui**, providing a clean and responsive user interface.  
Users can:
- Upload files and monitor upload progress  
- Manage uploaded documents  
- Ask interactive questions about their files  

The frontend communicates with the backend through **REST APIs** and uses **real-time toasts and loading indicators** to improve user experience and feedback.

---

### ☁️ Storage & Deployment  
- Files are securely stored in **Supabase Storage**.  
- **FAISS indices** are managed locally for optimized performance.  
- The **backend** is deployed on **Render** for scalability and reliability.  
- The **frontend** is deployed on **Vercel** for high performance and seamless **CI/CD** integration.

---

### ⚙️ Summary  
This architecture ensures a **fast**, **scalable**, and **privacy-safe** document understanding system — ideal for **enterprise document analytics** and **personal knowledge assistants** alike.
