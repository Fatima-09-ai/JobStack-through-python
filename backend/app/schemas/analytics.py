"""Pydantic response models for the analytics routes."""
from __future__ import annotations

from pydantic import BaseModel


class Summary(BaseModel):
    total_postings: int
    total_companies: int
    total_cities: int
    total_countries: int
    total_sources: int
    total_skills: int
    postings_with_skills: int


class CountItem(BaseModel):
    label: str
    n_postings: int
    pct: float  # share of all postings, 1 decimal


class TopSkill(BaseModel):
    skill: str
    n_postings: int
    pct_of_postings: float


class SalaryCoverage(BaseModel):
    """Honest salary coverage: most postings have no salary information."""

    total_postings: int
    with_any_salary_info: int
    with_numeric_salary: int
