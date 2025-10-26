from sqlalchemy import Column, String, DateTime, Integer, Float, Text, ForeignKey
from datetime import datetime
from .database import Base
from sqlalchemy.orm import relationship

class Document(Base):
    __tablename__ = "documents"

    document_id = Column(String, primary_key = True, index= True)
    filename = Column(String, nullable = False)
    file_url = Column(String, nullable=True)
    chunk_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default = datetime.now())

class QAHistory(Base):
    __tablename__ = "qa_history"

    id = Column(String, primary_key = True)
    document_id = Column(String, ForeignKey("documents.document_id"))
    question = Column(Text)
    answer = Column(Text)
    processing_time = Column(Float)
    document = relationship("Document", backref= "history")



