"""Tests for the jobs and locations routes.

They run against a small temporary SQLite file that has the same tables and views
as the real database (see deploy/DATABASE.md), so they do not need the real database.
"""
import sqlite3
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.main import app  # noqa: E402

SCHEMA = """
CREATE TABLE companies(company_id INTEGER PRIMARY KEY, company_name TEXT);
CREATE TABLE locations(location_id INTEGER PRIMARY KEY, city TEXT, country TEXT);
CREATE TABLE skills(skill_id INTEGER PRIMARY KEY, canonical_name TEXT, category TEXT);
CREATE TABLE postings(
    posting_pk INTEGER PRIMARY KEY, source TEXT, source_posting_id TEXT, source_url TEXT,
    title TEXT, standardized_title TEXT, description TEXT, company_id INTEGER, location_id INTEGER,
    category TEXT, experience TEXT, employment_type TEXT, work_mode TEXT, posted_at TEXT, language TEXT);
CREATE TABLE posting_skills(posting_pk INTEGER, skill_id INTEGER, extraction_method TEXT, evidence TEXT);
CREATE TABLE salary_observations(
    salary_id INTEGER PRIMARY KEY, posting_pk INTEGER, salary_min REAL, salary_max REAL,
    currency TEXT, pay_period TEXT, salary_text TEXT);

CREATE VIEW v_postings_flat AS
SELECT p.posting_pk, p.source, p.source_posting_id, p.title, p.standardized_title,
       c.company_name, l.city, l.country, p.category, p.experience, p.employment_type,
       p.work_mode, p.posted_at, p.language
FROM postings p
LEFT JOIN companies c ON c.company_id = p.company_id
LEFT JOIN locations l ON l.location_id = p.location_id;

CREATE VIEW v_posting_skills_flat AS
SELECT ps.posting_pk, s.canonical_name AS skill, ps.extraction_method, ps.evidence
FROM posting_skills ps JOIN skills s ON s.skill_id = ps.skill_id;

CREATE VIEW v_skill_counts AS
SELECT s.canonical_name AS skill, COUNT(ps.posting_pk) AS n_postings
FROM skills s LEFT JOIN posting_skills ps ON ps.skill_id = s.skill_id
GROUP BY s.canonical_name;
"""

DATA = """
INSERT INTO companies VALUES (1,'Acme'),(2,'Beta Ltd'),(3,'Gamma');
INSERT INTO locations VALUES (1,'Karachi','Pakistan'),(2,'Lahore','Pakistan'),(3,'Dubai','UAE');
INSERT INTO skills VALUES (1,'Python','Programming'),(2,'Excel','Tools'),(3,'Communication','Soft');
INSERT INTO postings VALUES
 (1,'rozee','r1','http://x/1','Data Analyst','Data Analyst','Analyse data',1,1,'Data','Junior','Full-time','Onsite','2026-11-10','en'),
 (2,'rozee','r2','http://x/2','Python Developer','Software Developer','Build APIs',2,2,'Software','Mid','Full-time','Remote','2026-11-12','en'),
 (3,'indeed','i3','http://x/3','Accountant','Accountant','Keep books',1,1,'Finance','Senior','Part-time','Onsite','2026-11-05','en'),
 (4,'indeed','i4','http://x/4','Junior 100%_Dev','Software Developer','Code',3,3,'Software','Junior','Full-time','Hybrid','2026-11-15','en'),
 (5,'rozee','r5','http://x/5','Orphan Job','Other',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO posting_skills VALUES
 (1,1,'dictionary','python'),(1,2,'dictionary','excel'),(2,1,'dictionary','Python'),(3,2,'dictionary','Excel');
INSERT INTO salary_observations VALUES (1,2,100000,150000,'PKR','month','100k-150k');
"""


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db = tmp_path / "test.db"
    con = sqlite3.connect(db)
    con.executescript(SCHEMA + DATA)
    con.commit()
    con.close()
    monkeypatch.setenv("JOBSTACK_DB", str(db))
    return TestClient(app)


def titles(resp):
    return [j["title"] for j in resp.json()["items"]]


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_list_jobs_newest_first_with_total(client):
    body = client.get("/jobs").json()
    assert body["total"] == 5
    assert body["limit"] == 20 and body["offset"] == 0
    # newest posted_at first; the posting with no date comes last
    assert [j["posting_pk"] for j in body["items"]] == [4, 2, 1, 3, 5]


def test_list_jobs_paging(client):
    page = client.get("/jobs", params={"limit": 2, "offset": 2}).json()
    assert page["total"] == 5
    assert [j["posting_pk"] for j in page["items"]] == [1, 3]


@pytest.mark.parametrize("params", [{"limit": 0}, {"limit": 101}, {"offset": -1}])
def test_list_jobs_rejects_bad_paging(client, params):
    assert client.get("/jobs", params=params).status_code == 422


def test_filter_by_category_is_case_insensitive(client):
    assert titles(client.get("/jobs", params={"category": "software"})) == ["Junior 100%_Dev", "Python Developer"]


def test_filter_by_city_and_work_mode(client):
    assert titles(client.get("/jobs", params={"city": "KARACHI"})) == ["Data Analyst", "Accountant"]
    assert titles(client.get("/jobs", params={"work_mode": "remote"})) == ["Python Developer"]


def test_combined_filters(client):
    resp = client.get("/jobs", params={"category": "Software", "experience": "Junior"})
    assert titles(resp) == ["Junior 100%_Dev"]


def test_filter_by_skill(client):
    assert titles(client.get("/jobs", params={"skill": "python"})) == ["Python Developer", "Data Analyst"]
    assert client.get("/jobs", params={"skill": "Excel"}).json()["total"] == 2


def test_search_title_treats_percent_and_underscore_literally(client):
    assert titles(client.get("/jobs", params={"q": "100%_"})) == ["Junior 100%_Dev"]
    assert titles(client.get("/jobs", params={"q": "analyst"})) == ["Data Analyst"]


def test_no_match_returns_empty_page(client):
    body = client.get("/jobs", params={"city": "Atlantis"}).json()
    assert body["total"] == 0 and body["items"] == []


def test_filter_values_are_not_sql_injectable(client):
    body = client.get("/jobs", params={"category": "x' OR '1'='1"}).json()
    assert body["total"] == 0


def test_job_filters(client):
    body = client.get("/jobs/filters").json()
    assert body["categories"] == ["Data", "Finance", "Software"]
    assert body["cities"] == ["Dubai", "Karachi", "Lahore"]
    assert body["work_modes"] == ["Hybrid", "Onsite", "Remote"]
    assert body["skills"] == ["Communication", "Excel", "Python"]


def test_job_detail_has_skills_and_salary(client):
    job = client.get("/jobs/2").json()
    assert job["title"] == "Python Developer"
    assert job["description"] == "Build APIs"
    assert job["source_url"] == "http://x/2"
    assert [s["skill"] for s in job["skills"]] == ["Python"]
    assert job["salaries"][0]["salary_min"] == 100000
    assert job["salaries"][0]["currency"] == "PKR"


def test_job_detail_without_skills_or_salary(client):
    job = client.get("/jobs/5").json()
    assert job["skills"] == [] and job["salaries"] == []
    assert job["company_name"] is None


def test_job_detail_not_found(client):
    assert client.get("/jobs/999").status_code == 404
    assert client.get("/jobs/abc").status_code == 404


def test_locations_list_counts_and_skips_missing_city(client):
    body = client.get("/locations").json()
    assert body[0] == {"city": "Karachi", "country": "Pakistan", "n_postings": 2}
    assert {loc["city"] for loc in body} == {"Karachi", "Lahore", "Dubai"}


def test_jobs_in_city(client):
    body = client.get("/locations/karachi/jobs").json()
    assert body["city"] == "karachi"
    assert body["total"] == 2
    assert titles(client.get("/locations/Karachi/jobs", params={"limit": 1})) == ["Data Analyst"]


def test_jobs_in_unknown_city_is_404(client):
    assert client.get("/locations/Atlantis/jobs").status_code == 404


def test_missing_database_gives_503(tmp_path, monkeypatch):
    monkeypatch.setenv("JOBSTACK_DB", str(tmp_path / "nope.db"))
    resp = TestClient(app).get("/jobs")
    assert resp.status_code == 503
    assert "build_database.py" in resp.json()["detail"]


def test_cors_allows_vite_dev_server(client):
    resp = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert resp.headers["access-control-allow-origin"] == "http://localhost:5173"
