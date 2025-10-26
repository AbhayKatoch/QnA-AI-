from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import documents
from db.database import Base, engine
from dotenv import load_dotenv
load_dotenv()

Base.metadata.create_all(bind=engine)


origins = [
    "http://localhost:3000",      # your Next.js dev server
    "http://127.0.0.1:3000",      # alternate localhost format
]

app = FastAPI(title="Smart Document Q&A Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins =origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(documents.router)

@app.get("/")
def root():
    return {"message": " Welcome to home page"}


