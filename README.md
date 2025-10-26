# 🧠 Smart Document Q&A Assistant

An **AI-powered document understanding system** built with **FastAPI**, **Next.js (App Router)**, **LangChain**, **Groq (LLaMA 3)**, and **Supabase Storage**.

This application allows users to **upload PDFs or text files**, automatically process them into embeddings using **FAISS** and **Sentence Transformers**, and then **ask natural language questions** about their contents — all in real time.

---

## 🚀 Features

- 📄 Upload PDF/TXT files through a modern, responsive UI  
- 🤖 Ask natural language questions about uploaded documents  
- ⚡ Fast, low-latency answers via **Groq’s LLaMA 3** model  
- 🧩 Vector-based semantic search with **FAISS**  
- ☁️ Secure file storage on **Supabase**  
- 🧱 Backend built with **FastAPI (Python)**  
- 💅 Frontend built with **Next.js + Tailwind + shadcn/ui**  
- 🔐 CORS-enabled API communication (**Vercel ↔ Render**)  

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

### **1️⃣ Upload Document**
**Endpoint:** `POST /documents/upload`

#### 🧾 Description
Uploads a **PDF** or **TXT** file, extracts its text, chunks the content, and stores embeddings in FAISS for later retrieval.

#### 📤 Request
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


# 📄 List Documents

**Endpoint:** `GET /documents`

---

## 🧾 Description  
Fetches all uploaded and processed documents.

---

## 📤 Request  
No parameters required.

### Example Request:
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
