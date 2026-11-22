"""Business logic for jobs: SQL against the views, returns plain dicts."""
from __future__ import annotations

import sqlite3

# Columns of v_postings_flat (see deploy/DATABASE.md)
JOB_COLUMNS = (
    "posting_pk, source, source_posting_id, title, standardized_title, company_name, "
    "city, country, category, experience, employment_type, work_mode, posted_at, language"
)

# Text filters: parameter name -> column in v_postings_flat. Matching is case-insensitive.
EXACT_FILTERS = ("category", "city", "country", "work_mode", "experience", "employment_type")


def _like_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def list_jobs(
    con: sqlite3.Connection,
    *,
    category: str | None = None,
    city: str | None = None,
    country: str | None = None,
    work_mode: str | None = None,
    experience: str | None = None,
    employment_type: str | None = None,
    skill: str | None = None,
    q: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> dict:
    """Filtered, paginated list of postings. Newest first."""
    values = {
        "category": category,
        "city": city,
        "country": country,
        "work_mode": work_mode,
        "experience": experience,
        "employment_type": employment_type,
    }
    clauses: list[str] = []
    params: list = []

    for column in EXACT_FILTERS:  # column names come from this fixed tuple, never from the user
        if values[column]:
            clauses.append(f"{column} = ? COLLATE NOCASE")
            params.append(values[column])

    if skill:
        clauses.append(
            "posting_pk IN (SELECT posting_pk FROM v_posting_skills_flat WHERE skill = ? COLLATE NOCASE)"
        )
        params.append(skill)

    if q:
        pattern = f"%{_like_escape(q)}%"
        clauses.append("(title LIKE ? ESCAPE '\\' OR standardized_title LIKE ? ESCAPE '\\')")
        params.extend([pattern, pattern])

    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""

    total = con.execute(f"SELECT COUNT(*) FROM v_postings_flat{where}", params).fetchone()[0]
    rows = con.execute(
        f"SELECT {JOB_COLUMNS} FROM v_postings_flat{where} "
        "ORDER BY posted_at DESC, posting_pk LIMIT ? OFFSET ?",
        [*params, limit, offset],
    ).fetchall()

    return {"total": total, "limit": limit, "offset": offset, "items": [dict(r) for r in rows]}


def get_job(con: sqlite3.Connection, posting_pk: str) -> dict | None:
    """One posting with its description, skills and salary records. None if not found."""
    row = con.execute(
        f"SELECT {', '.join('f.' + c.strip() for c in JOB_COLUMNS.split(','))}, "
        "p.description, p.source_url "
        "FROM v_postings_flat f JOIN postings p ON p.posting_pk = f.posting_pk "
        "WHERE f.posting_pk = ?",
        [posting_pk],
    ).fetchone()
    if row is None:
        return None

    job = dict(row)
    job["skills"] = [
        dict(r)
        for r in con.execute(
            "SELECT skill, extraction_method, evidence FROM v_posting_skills_flat "
            "WHERE posting_pk = ? ORDER BY skill",
            [posting_pk],
        )
    ]
    job["salaries"] = [
        dict(r)
        for r in con.execute(
            "SELECT salary_min, salary_max, currency, pay_period, salary_text "
            "FROM salary_observations WHERE posting_pk = ?",
            [posting_pk],
        )
    ]
    return job


def _distinct(con: sqlite3.Connection, column: str) -> list[str]:
    rows = con.execute(
        f"SELECT DISTINCT {column} FROM v_postings_flat "
        f"WHERE {column} IS NOT NULL AND {column} != '' ORDER BY {column}"
    ).fetchall()
    return [r[0] for r in rows]


def get_filters(con: sqlite3.Connection) -> dict:
    """Distinct filter values, for the frontend's dropdowns."""
    return {
        "categories": _distinct(con, "category"),
        "experiences": _distinct(con, "experience"),
        "employment_types": _distinct(con, "employment_type"),
        "work_modes": _distinct(con, "work_mode"),
        "cities": _distinct(con, "city"),
        "countries": _distinct(con, "country"),
        "skills": [r[0] for r in con.execute("SELECT skill FROM v_skill_counts ORDER BY skill")],
    }
