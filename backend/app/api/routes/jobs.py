"""Jobs routes.

    GET /jobs            filtered, paginated list
    GET /jobs/filters    distinct values for the frontend's dropdowns
    GET /jobs/{id}       one posting with description, skills and salary
"""
from __future__ import annotations

import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Query

from ...database.connection import get_db
from ...schemas.jobs import JobDetail, JobFilters, JobList
from ...services import jobs_service

router = APIRouter()


@router.get("", response_model=JobList)
def list_jobs(
    category: str | None = None,
    city: str | None = None,
    country: str | None = None,
    work_mode: str | None = None,
    experience: str | None = None,
    employment_type: str | None = None,
    skill: str | None = Query(None, description="Only postings that need this skill"),
    q: str | None = Query(None, description="Search in the job title"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    con: sqlite3.Connection = Depends(get_db),
):
    return jobs_service.list_jobs(
        con,
        category=category,
        city=city,
        country=country,
        work_mode=work_mode,
        experience=experience,
        employment_type=employment_type,
        skill=skill,
        q=q,
        limit=limit,
        offset=offset,
    )


# Must be declared before "/{posting_pk}", otherwise "filters" is read as an id.
@router.get("/filters", response_model=JobFilters)
def job_filters(con: sqlite3.Connection = Depends(get_db)):
    return jobs_service.get_filters(con)


@router.get("/{posting_pk}", response_model=JobDetail)
def get_job(posting_pk: str, con: sqlite3.Connection = Depends(get_db)):
    job = jobs_service.get_job(con, posting_pk)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {posting_pk} not found")
    return job
