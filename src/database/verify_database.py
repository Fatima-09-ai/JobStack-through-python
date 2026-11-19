"""Verify the generated SQLite database and write a verification report.

JobStack - Person 3 (SQL Database Engineering).

Checks: tables/views exist, row counts, source-vs-database reconciliation, foreign keys,
SQLite integrity, orphans, duplicates, NULL/zero rules; then runs every query in sql/04_queries.sql
and writes everything to reports/database/database_verification_report.md.

Run from the repository root (after python -m src.database.load_database):
    python -m src.database.verify_database
Exit code is 0 when every check passes, 1 otherwise.
"""

import argparse
import datetime
import json
import pathlib
import sqlite3
import sys

import pandas as pd

from src.database.load_database import DEFAULT_DB, DEFAULT_SRC, prepare_dataframe, run_qa
from src.database.run_queries import QUERY_FILE, load_queries

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEFAULT_REPORT = ROOT / "reports" / "database" / "database_verification_report.md"
EXPECTED_TABLES = ["companies", "locations", "skills", "postings", "posting_skills", "salary_observations"]
EXPECTED_VIEWS = ["v_postings_flat", "v_posting_skills_flat", "v_skill_counts"]


def md_table(df):
    """DataFrame -> markdown table text (no extra library needed)."""
    if df.empty:
        return "_(no rows)_"
    head = "| " + " | ".join(str(c) for c in df.columns) + " |"
    sep = "|" + "|".join("---" for _ in df.columns) + "|"
    rows = ["| " + " | ".join(str(v) for v in row) + " |" for row in df.itertuples(index=False)]
    return "\n".join([head, sep, *rows])


def scalar(con, sql):
    return con.execute(sql).fetchone()[0]


def collect_checks(con, df):
    """Return [(section, check name, ok, detail)] for every verification check."""
    checks = []
    names = {r[0]: r[1] for r in con.execute("SELECT name, type FROM sqlite_master")}
    for t in EXPECTED_TABLES:
        checks.append(("Structure", f"table `{t}` exists", names.get(t) == "table", ""))
    for v in EXPECTED_VIEWS:
        checks.append(("Structure", f"view `{v}` exists", names.get(v) == "view", ""))

    for name, ok, detail in run_qa(con, df):
        checks.append(("Source vs database", name, ok, detail))

    integrity = scalar(con, "PRAGMA integrity_check")
    checks.append(("Integrity", "SQLite integrity_check = ok", integrity == "ok", integrity))
    fk = con.execute("PRAGMA foreign_key_check").fetchall()
    checks.append(("Integrity", "PRAGMA foreign_key_check returns nothing", not fk, f"{len(fk)} violations"))

    sql_checks = [
        ("posting_skills rows pointing to a missing posting",
         "SELECT COUNT(*) FROM posting_skills ps LEFT JOIN postings p ON p.posting_pk = ps.posting_pk WHERE p.posting_pk IS NULL"),
        ("posting_skills rows pointing to a missing skill",
         "SELECT COUNT(*) FROM posting_skills ps LEFT JOIN skills s ON s.skill_id = ps.skill_id WHERE s.skill_id IS NULL"),
        ("postings pointing to a missing company",
         "SELECT COUNT(*) FROM postings p LEFT JOIN companies c ON c.company_id = p.company_id WHERE p.company_id IS NOT NULL AND c.company_id IS NULL"),
        ("postings pointing to a missing location",
         "SELECT COUNT(*) FROM postings p LEFT JOIN locations l ON l.location_id = p.location_id WHERE p.location_id IS NOT NULL AND l.location_id IS NULL"),
        ("salary_observations pointing to a missing posting",
         "SELECT COUNT(*) FROM salary_observations s LEFT JOIN postings p ON p.posting_pk = s.posting_pk WHERE p.posting_pk IS NULL"),
        ("duplicate (source, source_posting_id) pairs",
         "SELECT COUNT(*) FROM (SELECT 1 FROM postings GROUP BY source, source_posting_id HAVING COUNT(*) > 1)"),
        ("duplicate (posting, skill) pairs",
         "SELECT COUNT(*) FROM (SELECT 1 FROM posting_skills GROUP BY posting_pk, skill_id HAVING COUNT(*) > 1)"),
        ("duplicate company names", "SELECT COUNT(*) - COUNT(DISTINCT company_name) FROM companies"),
        ("duplicate skill names", "SELECT COUNT(*) - COUNT(DISTINCT canonical_name) FROM skills"),
        ("locations duplicated (city, country, NULL-safe)",
         "SELECT COUNT(*) FROM (SELECT 1 FROM locations GROUP BY city, IFNULL(country, '<null>') HAVING COUNT(*) > 1)"),
        ("salary stored as 0", "SELECT COUNT(*) FROM salary_observations WHERE salary_min = 0 OR salary_max = 0"),
        ("invalid work_mode values",
         "SELECT COUNT(*) FROM postings WHERE work_mode NOT IN ('remote','onsite','hybrid','unknown')"),
    ]
    for label, sql in sql_checks:
        n = scalar(con, sql)
        checks.append(("Relationships and rules", f"0 {label}", n == 0, f"{n} found"))
    return checks


def build_report(db_path, src_path, report_path):
    """Run all checks and queries, write the markdown report, return True if everything passed."""
    db_path, src_path, report_path = map(pathlib.Path, (db_path, src_path, report_path))
    df = prepare_dataframe(json.loads(src_path.read_text(encoding="utf-8")))
    con = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)   # read-only: verification never edits data
    con.execute("PRAGMA foreign_keys = ON")
    try:
        checks = collect_checks(con, df)
        all_ok = all(ok for _, _, ok, _ in checks)
        counts = pd.DataFrame(
            [(t, scalar(con, f"SELECT COUNT(*) FROM {t}")) for t in EXPECTED_TABLES], columns=["table", "rows"]
        )
        info = {
            "no_skill": scalar(con, "SELECT COUNT(*) FROM postings p WHERE NOT EXISTS (SELECT 1 FROM posting_skills ps WHERE ps.posting_pk = p.posting_pk)"),
            "no_company": scalar(con, "SELECT COUNT(*) FROM postings WHERE company_id IS NULL"),
            "no_location": scalar(con, "SELECT COUNT(*) FROM postings WHERE location_id IS NULL"),
            "salary_info": scalar(con, "SELECT COUNT(DISTINCT posting_pk) FROM salary_observations"),
            "salary_num": scalar(con, "SELECT COUNT(*) FROM salary_observations WHERE salary_min IS NOT NULL OR salary_max IS NOT NULL"),
            "total": scalar(con, "SELECT COUNT(*) FROM postings"),
            "sources": con.execute("SELECT source, COUNT(*) FROM postings GROUP BY source ORDER BY 2 DESC").fetchall(),
        }
        query_blocks = [(n, pd.read_sql_query(sql, con)) for n, sql in load_queries(QUERY_FILE)]
        sqlite_version = sqlite3.sqlite_version
        db_size_kb = db_path.stat().st_size / 1024
    finally:
        con.close()

    lines = [
        "# JobStack database verification report", "",
        f"**Overall result: {'PASS - all checks passed' if all_ok else 'FAIL - see failed checks below'}**", "",
        "| Item | Value |", "|---|---|",
        f"| Generated at | {datetime.datetime.now().isoformat(timespec='seconds')} |",
        f"| Database file | `{db_path.name}` ({db_size_kb:.0f} KB, SQLite {sqlite_version}) |",
        f"| Source data | `{src_path.name}` ({len(df)} records) |",
        f"| Checks passed | {sum(ok for _, _, ok, _ in checks)} of {len(checks)} |", "",
        "## 1. Table inventory", "", md_table(counts), "",
        "## 2. Verification checks", "",
    ]
    section = None
    for sec, name, ok, detail in checks:
        if sec != section:
            lines += ["", f"### {sec}", "", "| Result | Check | Detail |", "|---|---|---|"]
            section = sec
        lines.append(f"| {'PASS' if ok else '**FAIL**'} | {name} | {detail} |")
    lines += ["", "## 3. Analytical query results", "",
              "Produced by running every query in `sql/04_queries.sql`.", ""]
    for name, qdf in query_blocks:
        lines += [f"### {name}", "", md_table(qdf), ""]
    t = info["total"]
    lines += [
        "## 4. Data observations (from this database)", "",
        f"- Postings by source: " + ", ".join(f"{s} = {n}" for s, n in info["sources"]) + ".",
        f"- Salary: {info['salary_num']} of {t} postings have a numeric salary; {info['salary_info']} have any salary information (including free text). Missing salary is stored as NULL, never 0.",
        f"- Skills: {info['no_skill']} of {t} postings have no extracted skill, so skill counts are lower bounds.",
        f"- Unknown company: {info['no_company']} postings (company_id is NULL). Unknown location: {info['no_location']} postings (location_id is NULL).",
        "- The data is a sample, not the whole job market; results describe this dataset only.", "",
        "## 5. How to generate and access the database", "",
        "From the repository root:", "",
        "```bash", "pip install -r requirements.txt",
        "python -m src.database.load_database      # builds data/jobstack_final.db and runs QA",
        "python -m src.database.run_queries        # prints all analytical queries",
        "python -m src.database.verify_database    # regenerates this report",
        "python -m pytest tests/test_database.py tests/test_verify_database.py", "```", "",
        "The database file is git-ignored; teammates create it by running the loader. To open it:", "",
        "```python", "import sqlite3, pandas as pd", 'con = sqlite3.connect("data/jobstack_final.db")',
        'pd.read_sql_query("SELECT * FROM v_postings_flat LIMIT 5", con)', "```", "",
        "Or use DB Browser for SQLite (File > Open Database) or `sqlite3 data/jobstack_final.db`. "
        "Views for analysis: `v_postings_flat`, `v_posting_skills_flat`, `v_skill_counts`.", "",
    ]
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(lines), encoding="utf-8")
    return all_ok, checks


def main(argv=None):
    parser = argparse.ArgumentParser(description="Verify the JobStack SQLite database and write a report.")
    parser.add_argument("--db", default=str(DEFAULT_DB))
    parser.add_argument("--src", default=str(DEFAULT_SRC))
    parser.add_argument("--report", default=str(DEFAULT_REPORT))
    args = parser.parse_args(argv)
    if not pathlib.Path(args.db).exists():
        print(f"Database not found: {args.db}\nRun first: python -m src.database.load_database")
        return 1
    all_ok, checks = build_report(args.db, args.src, args.report)
    for sec, name, ok, detail in checks:
        print(f"[{'PASS' if ok else 'FAIL'}] {sec}: {name} ({detail})")
    print(f"\nReport written to {args.report}")
    print("ALL CHECKS PASSED" if all_ok else "SOME CHECKS FAILED")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
