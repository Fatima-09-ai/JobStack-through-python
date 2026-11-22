"""Business logic for analytics: aggregate SQL against the views, returns plain dicts."""
from __future__ import annotations

import sqlite3

# Column names a caller may group by. Only these fixed strings are ever put into the SQL text.
GROUPABLE = ("category", "work_mode", "experience", "employment_type", "source")


def _pct(part: int, whole: int) -> float:
    return round(100.0 * part / whole, 1) if whole else 0.0


def _scalar(con: sqlite3.Connection, sql: str) -> int:
    return con.execute(sql).fetchone()[0]


def summary(con: sqlite3.Connection) -> dict:
    return {
        "total_postings": _scalar(con, "SELECT COUNT(*) FROM v_postings_flat"),
        "total_companies": _scalar(con, "SELECT COUNT(DISTINCT company_name) FROM v_postings_flat WHERE company_name IS NOT NULL"),
        "total_cities": _scalar(con, "SELECT COUNT(DISTINCT city) FROM v_postings_flat WHERE city IS NOT NULL"),
        "total_countries": _scalar(con, "SELECT COUNT(DISTINCT country) FROM v_postings_flat WHERE country IS NOT NULL"),
        "total_sources": _scalar(con, "SELECT COUNT(DISTINCT source) FROM v_postings_flat"),
        "total_skills": _scalar(con, "SELECT COUNT(*) FROM v_skill_counts"),
        "postings_with_skills": _scalar(con, "SELECT COUNT(DISTINCT posting_pk) FROM v_posting_skills_flat"),
    }


def counts_by(con: sqlite3.Connection, column: str) -> list[dict]:
    """Postings per value of one column. Missing values are shown as 'not stated'."""
    if column not in GROUPABLE:
        raise ValueError(f"cannot group by {column!r}")
    total = _scalar(con, "SELECT COUNT(*) FROM v_postings_flat")
    rows = con.execute(
        f"SELECT COALESCE(NULLIF(TRIM({column}), ''), 'not stated') AS label, COUNT(*) AS n_postings "
        "FROM v_postings_flat GROUP BY label ORDER BY n_postings DESC, label"
    ).fetchall()
    return [{"label": r["label"], "n_postings": r["n_postings"], "pct": _pct(r["n_postings"], total)} for r in rows]


def top_skills(con: sqlite3.Connection, limit: int = 10) -> list[dict]:
    total = _scalar(con, "SELECT COUNT(*) FROM v_postings_flat")
    rows = con.execute(
        "SELECT skill, n_postings FROM v_skill_counts ORDER BY n_postings DESC, skill LIMIT ?", [limit]
    ).fetchall()
    return [{"skill": r["skill"], "n_postings": r["n_postings"], "pct_of_postings": _pct(r["n_postings"], total)} for r in rows]


def top_companies(con: sqlite3.Connection, limit: int = 10) -> list[dict]:
    total = _scalar(con, "SELECT COUNT(*) FROM v_postings_flat")
    rows = con.execute(
        "SELECT company_name AS label, COUNT(*) AS n_postings FROM v_postings_flat "
        "WHERE company_name IS NOT NULL AND company_name != '' "
        "GROUP BY company_name ORDER BY n_postings DESC, label LIMIT ?",
        [limit],
    ).fetchall()
    return [{"label": r["label"], "n_postings": r["n_postings"], "pct": _pct(r["n_postings"], total)} for r in rows]


def salary_coverage(con: sqlite3.Connection) -> dict:
    return {
        "total_postings": _scalar(con, "SELECT COUNT(*) FROM v_postings_flat"),
        "with_any_salary_info": _scalar(con, "SELECT COUNT(DISTINCT posting_pk) FROM salary_observations"),
        "with_numeric_salary": _scalar(
            con,
            "SELECT COUNT(DISTINCT posting_pk) FROM salary_observations "
            "WHERE salary_min IS NOT NULL OR salary_max IS NOT NULL",
        ),
    }
