"""Business logic for skills: SQL against the views, returns plain dicts."""
from __future__ import annotations

import sqlite3

from . import jobs_service

# The database stores no skill category, so the API derives one (same groups the frontend uses).
LANGUAGES = {"Python", "SQL", "Java", "JavaScript", "TypeScript", "C++", "C#", "PHP"}
SOFT_SKILLS = {"Communication", "Teamwork", "Problem Solving", "Agile", "Jira", "Leadership"}


def skill_category(name: str) -> str:
    if name in LANGUAGES:
        return "Programming Language"
    if name in SOFT_SKILLS:
        return "Soft Skill / Methodology"
    return "Framework / Tool"


def _pct(part: int, whole: int) -> float:
    return round(100.0 * part / whole, 1) if whole else 0.0


def _total_postings(con: sqlite3.Connection) -> int:
    return con.execute("SELECT COUNT(*) FROM v_postings_flat").fetchone()[0]


def _canonical(con: sqlite3.Connection, name: str) -> str | None:
    """Exact skill name as stored (match is case-insensitive), or None if unknown."""
    row = con.execute("SELECT skill FROM v_skill_counts WHERE skill = ? COLLATE NOCASE", [name]).fetchone()
    return row[0] if row else None


def list_skills(con: sqlite3.Connection, category: str | None = None) -> list[dict]:
    """All skills with counts, most requested first."""
    total = _total_postings(con)
    rows = con.execute("SELECT skill, n_postings FROM v_skill_counts ORDER BY n_postings DESC, skill").fetchall()
    items = [
        {
            "name": r["skill"],
            "n_postings": r["n_postings"],
            "pct_of_postings": _pct(r["n_postings"], total),
            "category": skill_category(r["skill"]),
        }
        for r in rows
    ]
    if category:
        items = [i for i in items if i["category"].lower().startswith(category.lower())]
    return items


def skill_pairs(con: sqlite3.Connection, *, min_count: int = 1, exclude_soft: bool = False, limit: int = 20) -> dict:
    """Skills that appear together in the same posting."""
    total = _total_postings(con)
    where, params = "", []
    if exclude_soft:
        where = f" WHERE skill NOT IN ({','.join('?' * len(SOFT_SKILLS))})"
        params = sorted(SOFT_SKILLS)
    cte = f"WITH s AS (SELECT DISTINCT posting_pk, skill FROM v_posting_skills_flat{where}) "

    in_scope = con.execute(
        cte + "SELECT COUNT(*) FROM (SELECT posting_pk FROM s GROUP BY posting_pk HAVING COUNT(*) >= 2)", params
    ).fetchone()[0]
    rows = con.execute(
        cte
        + "SELECT a.skill AS skill_a, b.skill AS skill_b, COUNT(*) AS count "
        "FROM s a JOIN s b ON a.posting_pk = b.posting_pk AND a.skill < b.skill "
        "GROUP BY a.skill, b.skill HAVING COUNT(*) >= ? "
        "ORDER BY count DESC, skill_a, skill_b LIMIT ?",
        [*params, min_count, limit],
    ).fetchall()
    pairs = [
        {**dict(r), "pct": _pct(r["count"], total), "pct_in_scope": _pct(r["count"], in_scope)} for r in rows
    ]
    return {"total_postings": total, "in_scope_postings": in_scope, "pairs": pairs}


def cooccurrence(con: sqlite3.Connection, skills: list[str] | None = None, default_top: int = 8) -> dict:
    """Matrix: how many postings need both skills. Defaults to the most requested skills."""
    if skills:
        names = [c for c in dict.fromkeys(_canonical(con, s) for s in skills) if c]
    else:
        names = [r[0] for r in con.execute("SELECT skill FROM v_skill_counts ORDER BY n_postings DESC, skill LIMIT ?", [default_top])]

    matrix = {a: {b: 0 for b in names} for a in names}
    if names:
        by_posting: dict[int, set[str]] = {}
        marks = ",".join("?" * len(names))
        for r in con.execute(f"SELECT posting_pk, skill FROM v_posting_skills_flat WHERE skill IN ({marks})", names):
            by_posting.setdefault(r["posting_pk"], set()).add(r["skill"])
        for have in by_posting.values():
            for a in have:
                for b in have:
                    matrix[a][b] += 1
    return {"skills": names, "matrix": matrix}


def skill_detail(con: sqlite3.Connection, name: str) -> dict | None:
    """Deep dive on one skill. None if the skill does not exist."""
    skill = _canonical(con, name)
    if skill is None:
        return None
    total = _total_postings(con)
    ranking = [r[0] for r in con.execute("SELECT skill FROM v_skill_counts ORDER BY n_postings DESC, skill")]
    n = con.execute("SELECT n_postings FROM v_skill_counts WHERE skill = ?", [skill]).fetchone()[0]

    co = con.execute(
        "SELECT b.skill AS name, COUNT(DISTINCT b.posting_pk) AS count "
        "FROM v_posting_skills_flat a JOIN v_posting_skills_flat b "
        "ON a.posting_pk = b.posting_pk AND b.skill != a.skill "
        "WHERE a.skill = ? GROUP BY b.skill ORDER BY count DESC, name",
        [skill],
    ).fetchall()

    def top(column: str) -> list[dict]:  # column comes from the two fixed calls below, never from the user
        rows = con.execute(
            f"SELECT f.{column} AS label, COUNT(DISTINCT f.posting_pk) AS count "
            "FROM v_postings_flat f JOIN v_posting_skills_flat a ON a.posting_pk = f.posting_pk "
            f"WHERE a.skill = ? AND f.{column} IS NOT NULL AND f.{column} != '' "
            f"GROUP BY f.{column} ORDER BY count DESC, label LIMIT 5",
            [skill],
        ).fetchall()
        return [dict(r) for r in rows]

    return {
        "name": skill,
        "category": skill_category(skill),
        "n_postings": n,
        "pct_of_postings": _pct(n, total),
        "rank": ranking.index(skill) + 1,
        "co_occurring": [
            {**dict(r), "pct_of_jobs": _pct(r["count"], n), "category": skill_category(r["name"])} for r in co
        ],
        "top_cities": top("city"),
        "top_roles": top("standardized_title"),
    }


def jobs_for_skill(con: sqlite3.Connection, name: str, *, limit: int = 20, offset: int = 0) -> dict | None:
    """Paginated postings that need a skill. None if the skill does not exist."""
    skill = _canonical(con, name)
    if skill is None:
        return None
    return {"skill": skill, **jobs_service.list_jobs(con, skill=skill, limit=limit, offset=offset)}
