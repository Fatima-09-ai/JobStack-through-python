"""Locations routes.

    GET /locations                list of cities with their number of postings
    GET /locations/{city}/jobs    postings in one city (paginated)
"""
from __future__ import annotations

import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Query

from ...database.connection import get_db
from ...schemas.locations import LocationJobs, LocationOut
from ...services import locations_service

router = APIRouter()


@router.get("", response_model=list[LocationOut])
def list_locations(con: sqlite3.Connection = Depends(get_db)):
    return locations_service.list_locations(con)


@router.get("/{city}/jobs", response_model=LocationJobs)
def jobs_in_city(
    city: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    con: sqlite3.Connection = Depends(get_db),
):
    result = locations_service.jobs_in_city(con, city, limit=limit, offset=offset)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No jobs found in {city}")
    return result
