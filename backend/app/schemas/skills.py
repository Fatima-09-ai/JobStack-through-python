"""Pydantic response models for the skills routes."""
from __future__ import annotations

from pydantic import BaseModel

from .jobs import JobSummary


class SkillOut(BaseModel):
    name: str
    n_postings: int
    pct_of_postings: float
    category: str  # derived label: Programming Language / Soft Skill / Framework or Tool


class SkillPair(BaseModel):
    skill_a: str
    skill_b: str
    count: int
    pct: float  # share of ALL postings
    pct_in_scope: float  # share of postings that have at least 2 (counted) skills


class SkillPairs(BaseModel):
    total_postings: int
    in_scope_postings: int
    pairs: list[SkillPair]


class Cooccurrence(BaseModel):
    skills: list[str]
    matrix: dict[str, dict[str, int]]  # matrix[a][b] = postings that need both a and b


class LabelCount(BaseModel):
    label: str
    count: int


class CoSkill(BaseModel):
    name: str
    count: int
    pct_of_jobs: float  # share of the postings that need the chosen skill
    category: str


class SkillDetail(BaseModel):
    name: str
    category: str
    n_postings: int
    pct_of_postings: float
    rank: int
    co_occurring: list[CoSkill]
    top_cities: list[LabelCount]
    top_roles: list[LabelCount]


class SkillJobs(BaseModel):
    skill: str
    total: int
    limit: int
    offset: int
    items: list[JobSummary]
