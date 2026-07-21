from contextlib import asynccontextmanager

from fastapi import FastAPI
from app.api import resumes

from app.api import auth, users
from app.db.connection import (
    close_mongodb_connection,
    connect_to_mongodb,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()


app = FastAPI(
    title="ApplyPilot API",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resumes.router)


@app.get("/")
async def root():
    return {
        "message": "ApplyPilot API Running 🚀"
    }