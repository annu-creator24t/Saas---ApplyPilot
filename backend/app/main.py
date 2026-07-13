from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from app.api.cover_letter import router as cover_letter_router
from app.api.interview import router as interview_router
from app.api.evaluate_answer import router as evaluate_router

app = FastAPI(
    title="ApplyPilot AI API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resume Analyzer
app.include_router(router)

# Cover Letter
app.include_router(cover_letter_router)

# Interview Generator
app.include_router(interview_router)

# Interview Evaluation
app.include_router(evaluate_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to ApplyPilot AI Backend 🚀"
    }