"""Business logic for locations: SQL against v_postings_flat, returns plain dicts."""
from __future__ import annotations

import sqlite3

from .jobs_service import list_jobs


def list_locations(con: sqlite3.Connection) -> list[dict]:
    """Every city with its number of postings, biggest first."""
    rows = con.execute(
        "SELECT city, country, COUNT(*) AS n_postings FROM v_postings_flat "
        "WHERE city IS NOT NULL AND city != '' "
        "GROUP BY city, country ORDER BY n_postings DESC, city"
    ).fetchall()
    return [dict(r) for r in rows]


def jobs_in_city(con: sqlite3.Connection, city: str, *, limit: int = 20, offset: int = 0) -> dict | None:
    """Paginated postings in one city. None if the city has no postings."""
    result = list_jobs(con, city=city, limit=limit, offset=offset)
    if result["total"] == 0:
        return None
    return {"city": city, **result}
