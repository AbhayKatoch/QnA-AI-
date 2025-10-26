from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from datetime import datetime
from utils.utils import extract_text_from_file
from rag.processor import process_and_store
from utils.supabase_storage import upload_to_supabase
from rag.retriever import query_document
import os
import uuid
import tempfile
from db.database import sessionLocal
from db.models import Document, QAHistory




router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp.flush()
        os.fsync(tmp.fileno())
        tmp_path = tmp.name


    # Extract text first
    extracted_text = extract_text_from_file(tmp_path)
    doc_id = str(uuid.uuid4())
    chunk_count = process_and_store(doc_id, extracted_text)

    # Then upload to Supabase
    with open(tmp_path, "rb") as f:
        file_url = upload_to_supabase(f, file.filename)

    # Save metadata
    db = sessionLocal()
    new_doc = Document(
        document_id=doc_id,
        filename=file.filename,
        file_url= file_url,
        chunk_count=chunk_count,
        uploaded_at=datetime.now(),
    )
    db.add(new_doc)
    db.commit()
    doc_id = new_doc.document_id
    db.close()

    return {
        "document_id": doc_id,
        "filename": file.filename,
        "status": "processed",
        "chunks_created": chunk_count,
        "uploaded_at": new_doc.uploaded_at.isoformat(),
        "file_url": file_url,
    }


@router.post("/query")
async def query_uploaded_document(document_id : str = Query(...), question : str = Query(...)):
    try:
        result = query_document(document_id, question)
        db = sessionLocal()
        history = QAHistory(
            id = str(uuid.uuid4()),
            document_id = document_id,
            question = question,
            answer = result["answer"],
            processing_time = result["processing_time_seconds"]
        )
        db.add(history)
        db.commit()
        db.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@router.get("/")
async def list_documents():
    db = sessionLocal()
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()

    db.close()
    return {
        "documents":[
            {
                "document_id": d.document_id,
                "filename": d.filename,
                "uploaded_at": d.uploaded_at.isoformat(),
                "chunk_count": d.chunk_count,
                "file_url": d.file_url,
            }
            for d in docs
        ]
    }

@router.get("/cron")
async def cron_status():
    """Manual endpoint to confirm the cron router is active."""
    return {
        "status": "Document cron job is running successfully!",
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.delete("/{document_id}")
async def delete_document(document_id:str):
    db = sessionLocal()
    docs = db.query(Document).filter(Document.document_id==document_id).first()

    if not docs:
        db.close()
        raise HTTPException(status_code=404, detail="Document Not Found")
    
    faiss_path = f"vector_store/{document_id}.faiss"
    # if os.path.exists(faiss_path):
    #     os.remove(faiss_path)
    
    db.delete(docs)
    db.commit()
    db.close()
    return {"status":"deleted", "document_id": document_id}



@router.get("/{document_id}/history")
async def get_document_history(document_id: str):
    db = sessionLocal()
    history = db.query(QAHistory).filter(QAHistory.document_id == document_id).all()
    db.close()
    return [
        {"question": h.question, "answer": h.answer, "time": h.processing_time}
        for h in history
    ]


import requests
from io import BytesIO

@router.get("/{document_id}/text")
async def get_document_text(document_id: str):
    """Return first few thousand characters of document text (downloaded from Supabase)."""
    try:
        # Get document metadata (to access file_url)
        db = sessionLocal()
        doc = db.query(Document).filter(Document.document_id == document_id).first()
        db.close()

        if not doc or not doc.file_url:
            raise HTTPException(status_code=404, detail="Document not found or missing file URL")

        # Download file from Supabase
        response = requests.get(doc.file_url)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch file from Supabase")

        # Read file into memory
        temp_file = BytesIO(response.content)
        temp_filename = f"/tmp/{document_id}.pdf"
        with open(temp_filename, "wb") as f:
            f.write(temp_file.read())

        # Extract text
        text = extract_text_from_file(temp_filename)
        os.remove(temp_filename)

        preview = text[:5000] if text else "No readable text found."
        return {"document_id": document_id, "preview_text": preview}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
