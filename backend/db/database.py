from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DB_URL = os.getenv("DATABASE_URL","sqlite:///./documents.db")

engine = create_engine(DB_URL, connect_args = {"check_same_thread":False})
sessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

