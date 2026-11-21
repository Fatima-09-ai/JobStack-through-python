"""JobStack FastAPI backend.

Run from the repository root:

    uvicorn backend.app.main:app --reload

Interactive docs: http://127.0.0.1:8000/docs
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import analytics, jobs, locations, skills

app = FastAPI(title="JobStack API", version="0.1.0")

# Frontend origins allowed to call the API. On the host, set CORS_ORIGINS to the
# deployed frontend URL (comma separated), e.g. "https://jobstack.onrender.com".
_default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(locations.router, prefix="/locations", tags=["locations"])
app.include_router(skills.router, prefix="/skills", tags=["skills"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
