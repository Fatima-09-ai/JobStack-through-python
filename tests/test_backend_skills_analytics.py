"""Tests for the skills and analytics routes.

They reuse the small temporary SQLite database defined in test_backend_jobs_locations.py
(same tables and views as the real database), so they do not need the real database.
"""
import sqlite3
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(Path(__file__).parent))

from backend.app.main import app  # noqa: E402
from test_backend_jobs_locations import DATA, SCHEMA  # noqa: E402

# Test data recap: 5 postings; Python in postings 1,2; Excel in 1,3; Communication in none.
# Only posting 1 has two skills (Python + Excel).


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db = tmp_path / "test.db"
    con = sqlite3.connect(db)
    con.executescript(SCHEMA + DATA)
    con.commit()
    con.close()
    monkeypatch.setenv("JOBSTACK_DB", str(db))
    return TestClient(app)


# ----------------------------------------------------------------- skills
def test_skills_list_sorted_with_pct_and_category(client):
    items = client.get("/skills").json()
    assert [i["name"] for i in items] == ["Excel", "Python", "Communication"]  # count desc, then name
    python = next(i for i in items if i["name"] == "Python")
    assert python["n_postings"] == 2 and python["pct_of_postings"] == 40.0
    assert python["category"] == "Programming Language"
    assert items[-1]["n_postings"] == 0  # a skill with no postings is still listed


def test_skills_list_category_filter(client):
    assert [i["name"] for i in client.get("/skills", params={"category": "programming"}).json()] == ["Python"]
    assert [i["name"] for i in client.get("/skills", params={"category": "soft"}).json()] == ["Communication"]


def test_skill_pairs(client):
    data = client.get("/skills/pairs").json()
    assert data["total_postings"] == 5 and data["in_scope_postings"] == 1
    assert data["pairs"] == [
        {"skill_a": "Excel", "skill_b": "Python", "count": 1, "pct": 20.0, "pct_in_scope": 100.0}
    ]


def test_skill_pairs_min_count_and_bad_params(client):
    assert client.get("/skills/pairs", params={"min_count": 2}).json()["pairs"] == []
    assert client.get("/skills/pairs", params={"limit": 0}).status_code == 422
    assert client.get("/skills/pairs", params={"exclude_soft": "true"}).status_code == 200


def test_pairs_is_not_read_as_a_skill_name(client):
    assert "pairs" in client.get("/skills/pairs").json()
    assert client.get("/skills/cooccurrence").status_code == 200


def test_cooccurrence_matrix_is_case_insensitive_and_skips_unknown(client):
    data = client.get("/skills/cooccurrence", params=[("skills", "python"), ("skills", "EXCEL"), ("skills", "nope")]).json()
    assert data["skills"] == ["Python", "Excel"]
    assert data["matrix"] == {"Python": {"Python": 2, "Excel": 1}, "Excel": {"Python": 1, "Excel": 2}}


def test_cooccurrence_default_uses_top_skills(client):
    assert set(client.get("/skills/cooccurrence").json()["skills"]) == {"Python", "Excel", "Communication"}


def test_skill_detail(client):
    d = client.get("/skills/python").json()  # lower case still finds "Python"
    assert d["name"] == "Python" and d["rank"] == 2 and d["n_postings"] == 2
    assert d["co_occurring"] == [{"name": "Excel", "count": 1, "pct_of_jobs": 50.0, "category": "Framework / Tool"}]
    assert d["top_cities"] == [{"label": "Karachi", "count": 1}, {"label": "Lahore", "count": 1}]
    assert [r["label"] for r in d["top_roles"]] == ["Data Analyst", "Software Developer"]


def test_skill_without_postings_is_still_a_skill(client):
    d = client.get("/skills/Communication").json()
    assert d["n_postings"] == 0 and d["co_occurring"] == [] and d["top_cities"] == []


def test_unknown_skill_is_404(client):
    assert client.get("/skills/Fortran").status_code == 404
    assert client.get("/skills/Fortran/jobs").status_code == 404


def test_skill_jobs_paged(client):
    d = client.get("/skills/Python/jobs", params={"limit": 1}).json()
    assert d["skill"] == "Python" and d["total"] == 2 and len(d["items"]) == 1
    assert client.get("/skills/Python/jobs", params={"limit": 1, "offset": 1}).json()["items"][0]["title"] in (
        "Data Analyst",
        "Python Developer",
    )
    assert client.get("/skills/Communication/jobs").json()["items"] == []


def test_skill_name_is_not_sql_injectable(client):
    assert client.get("/skills/x'; DROP TABLE skills;--").status_code == 404
    assert len(client.get("/skills").json()) == 3  # table still there


# -------------------------------------------------------------- analytics
def test_summary(client):
    assert client.get("/analytics/summary").json() == {
        "total_postings": 5,
        "total_companies": 3,
        "total_cities": 3,
        "total_countries": 2,
        "total_sources": 2,
        "total_skills": 3,
        "postings_with_skills": 3,
    }


def test_by_work_mode_counts_and_missing_label(client):
    rows = client.get("/analytics/by-work-mode").json()
    assert {r["label"]: r["n_postings"] for r in rows} == {"Onsite": 2, "Remote": 1, "Hybrid": 1, "not stated": 1}
    assert rows[0] == {"label": "Onsite", "n_postings": 2, "pct": 40.0}
    assert sum(r["n_postings"] for r in rows) == 5  # every posting is counted exactly once


@pytest.mark.parametrize(
    "path", ["by-category", "by-experience", "by-employment-type", "by-source"]
)
def test_other_group_routes_cover_every_posting(client, path):
    rows = client.get(f"/analytics/{path}").json()
    assert sum(r["n_postings"] for r in rows) == 5


def test_by_experience_labels(client):
    labels = {r["label"] for r in client.get("/analytics/by-experience").json()}
    assert labels == {"Junior", "Mid", "Senior", "not stated"}


def test_top_skills_limit(client):
    rows = client.get("/analytics/top-skills", params={"limit": 2}).json()
    assert len(rows) == 2 and rows[0]["n_postings"] == 2
    assert client.get("/analytics/top-skills", params={"limit": 0}).status_code == 422
    assert client.get("/analytics/top-skills", params={"limit": 51}).status_code == 422


def test_top_companies_skips_missing(client):
    rows = client.get("/analytics/top-companies").json()
    assert rows[0] == {"label": "Acme", "n_postings": 2, "pct": 40.0}
    assert sum(r["n_postings"] for r in rows) == 4  # the orphan posting has no company


def test_salary_coverage_is_honest(client):
    assert client.get("/analytics/salary-coverage").json() == {
        "total_postings": 5,
        "with_any_salary_info": 1,
        "with_numeric_salary": 1,
    }


def test_missing_database_gives_503(tmp_path, monkeypatch):
    monkeypatch.setenv("JOBSTACK_DB", str(tmp_path / "nope.db"))
    assert TestClient(app).get("/analytics/summary").status_code == 503
    assert TestClient(app).get("/skills").status_code == 503
