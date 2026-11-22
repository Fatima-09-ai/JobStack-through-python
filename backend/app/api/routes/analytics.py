"""Analytics routes (aggregates computed from the views).

    GET /analytics/summary            totals: postings, companies, cities, skills ...
    GET /analytics/by-category        postings per category
    GET /analytics/by-work-mode       postings per work_mode
    GET /analytics/by-experience      postings per experience level
    GET /analytics/by-employment-type postings per employment type
    GET /analytics/by-source          postings per data source
    GET /analytics/top-skills         top N skills (?limit=)
    GET /analytics/top-companies      top N companies (?limit=)
    GET /analytics/salary-coverage    how much salary data exists
"""
from __future__ import annotations

import sqlite3

from fastapi import APIRouter, Depends, Query

from ...database.connection import get_db
from ...schemas.analytics import CountItem, SalaryCoverage, Summary, TopSkill
from ...services import analytics_service as service

router = APIRouter()


@router.get("/summary", response_model=Summary)
def summary(con: sqlite3.Connection = Depends(get_db)):
    return service.summary(con)


@router.get("/by-category", response_model=list[CountItem])
def by_category(con: sqlite3.Connection = Depends(get_db)):
    return service.counts_by(con, "category")


@router.get("/by-work-mode", response_model=list[CountItem])
def by_work_mode(con: sqlite3.Connection = Depends(get_db)):
    return service.counts_by(con, "work_mode")


@router.get("/by-experience", response_model=list[CountItem])
def by_experience(con: sqlite3.Connection = Depends(get_db)):
    return service.counts_by(con, "experience")


@router.get("/by-employment-type", response_model=list[CountItem])
def by_employment_type(con: sqlite3.Connection = Depends(get_db)):
    return service.counts_by(con, "employment_type")


@router.get("/by-source", response_model=list[CountItem])
def by_source(con: sqlite3.Connection = Depends(get_db)):
    return service.counts_by(con, "source")


@router.get("/top-skills", response_model=list[TopSkill])
def top_skills(limit: int = Query(10, ge=1, le=50), con: sqlite3.Connection = Depends(get_db)):
    return service.top_skills(con, limit)


@router.get("/top-companies", response_model=list[CountItem])
def top_companies(limit: int = Query(10, ge=1, le=50), con: sqlite3.Connection = Depends(get_db)):
    return service.top_companies(con, limit)


@router.get("/salary-coverage", response_model=SalaryCoverage)
def salary_coverage(con: sqlite3.Connection = Depends(get_db)):
    return service.salary_coverage(con)
