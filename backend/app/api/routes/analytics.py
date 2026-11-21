"""Analytics routes (Ali's part).

Suggested endpoints (all computed from the views):
    GET /analytics/summary        -> total postings, companies, cities, skills
    GET /analytics/by-category    -> postings per category
    GET /analytics/by-work-mode   -> postings per work_mode
    GET /analytics/by-experience  -> postings per experience level
    GET /analytics/top-skills     -> top N skills (v_skill_counts)

Pattern to follow (see jobs.py): a thin route that calls a function in
app/services/, which runs SQL and returns plain dicts, with Pydantic models in
app/schemas/. main.py already includes this router.
"""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()
