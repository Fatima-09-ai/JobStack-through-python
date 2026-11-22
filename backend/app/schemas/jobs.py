"""Pydantic response models for the jobs routes."""
from __future__ import annotations

from pydantic import BaseModel


class JobSummary(BaseModel):
    """One row of the v_postings_flat view."""

    posting_pk: int | str
    source: str | None = None
    source_posting_id: str | None = None
    title: str | None = None
    standardized_title: str | None = None
    company_name: str | None = None
    city: str | None = None
    country: str | None = None
    category: str | None = None
    experience: str | None = None
    employment_type: str | None = None
    work_mode: str | None = None
    posted_at: str | None = None
    language: str | None = None


class JobSkill(BaseModel):
    skill: str
    extraction_method: str | None = None
    evidence: str | None = None


class JobSalary(BaseModel):
    salary_min: float | None = None
    salary_max: float | None = None
    currency: str | None = None
    pay_period: str | None = None
    salary_text: str | None = None


class JobDetail(JobSummary):
    description: str | None = None
    source_url: str | None = None
    skills: list[JobSkill] = []
    salaries: list[JobSalary] = []


class JobList(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[JobSummary]


class JobFilters(BaseModel):
    """Distinct values the frontend can use for dropdowns."""

    categories: list[str]
    experiences: list[str]
    employment_types: list[str]
    work_modes: list[str]
    cities: list[str]
    countries: list[str]
    skills: list[str]
