"""SQLite connection for the backend.

The database file is built by `python deploy/build_database.py` and lives at
data/jobstack_final.db in the repository root. Set the JOBSTACK_DB environment
variable to point somewhere else (useful on a host or in tests).

The backend only reads, so the file is opened read-only.
"""
from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path

from fastapi import HTTPException

# backend/app/database/connection.py -> parents[3] is the repository root
ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DB = ROOT / "data" / "jobstack_final.db"


def get_db_path() -> Path:
    """Read the env var at call time so tests and hosts can change it."""
    return Path(os.environ.get("JOBSTACK_DB", str(DEFAULT_DB))).resolve()


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency: one read-only connection per request."""
    path = get_db_path()
    if not path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Database not found at {path}. Run: python deploy/build_database.py",
        )
    con = sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True, check_same_thread=False)
    con.row_factory = sqlite3.Row
    try:
        yield con
    finally:
        con.close()
