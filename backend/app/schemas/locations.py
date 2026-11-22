"""Pydantic response models for the locations routes."""
from __future__ import annotations

from pydantic import BaseModel

from .jobs import JobSummary


class LocationOut(BaseModel):
    city: str
    country: str | None = None
    n_postings: int


class LocationJobs(BaseModel):
    city: str
    total: int
    limit: int
    offset: int
    items: list[JobSummary]
