"""Skills routes (Ali's part).

Suggested endpoints:
    GET /skills                 -> skill counts, from the v_skill_counts view
    GET /skills/{name}/jobs     -> postings that need a skill (v_posting_skills_flat)

Pattern to follow (see jobs.py): a thin route that calls a function in
app/services/, which runs SQL against the views and returns plain dicts, with
Pydantic models in app/schemas/. main.py already includes this router.
"""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()
