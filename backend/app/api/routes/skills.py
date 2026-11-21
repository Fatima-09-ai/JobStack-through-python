"""Skills routes.

    GET /skills                    all skills with counts (optional ?category=)
    GET /skills/pairs              skills that appear together (?min_count, ?exclude_soft, ?limit)
    GET /skills/cooccurrence       co-occurrence matrix (?skills=Python&skills=SQL, default: top 8)
    GET /skills/{name}             deep dive on one skill
    GET /skills/{name}/jobs        postings that need a skill (paginated)
"""
from __future__ import annotations

import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Query

from ...database.connection import get_db
from ...schemas.skills import Cooccurrence, SkillDetail, SkillJobs, SkillOut, SkillPairs
from ...services import skills_service

router = APIRouter()


@router.get("", response_model=list[SkillOut])
def list_skills(
    category: str | None = Query(None, description="Programming, Soft or Framework"),
    con: sqlite3.Connection = Depends(get_db),
):
    return skills_service.list_skills(con, category=category)


# Fixed paths must be declared before "/{name}", otherwise "pairs" is read as a skill name.
@router.get("/pairs", response_model=SkillPairs)
def skill_pairs(
    min_count: int = Query(1, ge=1),
    exclude_soft: bool = False,
    limit: int = Query(20, ge=1, le=200),
    con: sqlite3.Connection = Depends(get_db),
):
    return skills_service.skill_pairs(con, min_count=min_count, exclude_soft=exclude_soft, limit=limit)


@router.get("/cooccurrence", response_model=Cooccurrence)
def cooccurrence(
    skills: list[str] | None = Query(None, description="Repeat the parameter for each skill"),
    con: sqlite3.Connection = Depends(get_db),
):
    return skills_service.cooccurrence(con, skills)


@router.get("/{name}", response_model=SkillDetail)
def skill_detail(name: str, con: sqlite3.Connection = Depends(get_db)):
    result = skills_service.skill_detail(con, name)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Skill {name} not found")
    return result


@router.get("/{name}/jobs", response_model=SkillJobs)
def jobs_for_skill(
    name: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    con: sqlite3.Connection = Depends(get_db),
):
    result = skills_service.jobs_for_skill(con, name, limit=limit, offset=offset)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Skill {name} not found")
    return result
