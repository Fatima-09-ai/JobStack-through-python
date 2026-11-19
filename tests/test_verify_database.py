"""Tests for the database verification report (Person 3)."""

import json
import sqlite3

from src.database.load_database import build_database
from src.database.verify_database import build_report

NAN = float("nan")


def record(posting_id, **kw):
    r = {
        "posting_id": posting_id, "source": "kaggle_pk", "source_url": None, "title": "Dev",
        "standardized_title": "Dev", "cleaned_description": "text", "company_name": "Acme",
        "category": "IT", "standardized_city": "Lahore", "country": "Pakistan", "experience": None,
        "standardized_employment_type": "Full-time", "standardized_work_mode": "unknown",
        "posted_at": None, "language": "en", "salary_min": NAN, "salary_max": NAN,
        "currency": NAN, "salary_text": NAN, "extracted_skills": ["Python"],
    }
    r.update(kw)
    return r


def test_report_passes_on_good_database(tmp_path):
    records = [record("1"), record("2", extracted_skills=[])]
    src = tmp_path / "jobs.json"
    src.write_text(json.dumps(records), encoding="utf-8")   # json writes NaN as NaN, like the real file
    db = tmp_path / "t.db"
    build_database(records, db)
    report = tmp_path / "report.md"
    ok, checks = build_report(db, src, report)
    assert ok
    text = report.read_text(encoding="utf-8")
    assert "Overall result: PASS" in text and "Analytical query results" in text


def test_report_fails_when_database_is_tampered(tmp_path):
    records = [record("1")]
    src = tmp_path / "jobs.json"
    src.write_text(json.dumps(records), encoding="utf-8")
    db = tmp_path / "t.db"
    build_database(records, db)
    con = sqlite3.connect(db)
    con.execute("DELETE FROM posting_skills")      # now links no longer match the source data
    con.commit()
    con.close()
    ok, _ = build_report(db, src, tmp_path / "report.md")
    assert not ok
