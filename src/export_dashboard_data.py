"""Build frontend/real_data.js (real numbers for the dashboard) from the pipeline outputs.
Run from the project root:  python -m src.export_dashboard_data"""
import collections
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
T, V = ROOT / "data" / "transformed", ROOT / "data" / "validated"
REPORT = ROOT / "reports" / "data_quality" / "data_quality_report.md"
KNOWN = {"Full-time", "Part-time", "Contract", "Internship", "Temporary"}
MODES = {"remote": "Remote", "hybrid": "Hybrid", "onsite": "On-site"}
FIELDS = ["company_name", "city", "employment_type", "experience", "salary_min", "salary_max", "salary_text", "posted_at"]


def load(p):
    return json.loads(p.read_text(encoding="utf-8"))


def missing(v):
    return v is None or v == "" or v == [] or (isinstance(v, float) and math.isnan(v))


def etype(r):
    v = r.get("standardized_employment_type")
    return "Not specified" if missing(v) else (v if v in KNOWN else "Other")


def ranked(counter):
    return sorted(counter.items(), key=lambda kv: -kv[1])


def ingestion():
    text = REPORT.read_text(encoding="utf-8")
    rows = []
    for line in text.split("## 2.")[0].splitlines():
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(c) == 5 and c[2].isdigit():
            rows.append({"source": c[0], "raw": int(c[2]), "duplicates": int(c[3]), "unique": int(c[4])})
    m = re.search(r"Total validated postings: \*\*(\d+)\*\*", text)
    return rows, int(m.group(1)) if m else None


def main():
    final, cleaned, dedup = load(T / "jobs_final.json"), load(T / "jobs_cleaned.json"), load(T / "jobs_deduplicated.json")
    vf = V / "jobs_valid.json" if (V / "jobs_valid.json").exists() else V / "sample_300.json"
    valid, rejected = load(vf), load(V / "jobs_rejected.json")
    ing, validated_total = ingestion()
    n = len(final)
    with_skills = sum(1 for r in final if not missing(r.get("extracted_skills")))
    raw_total, ing_dupes = sum(r["raw"] for r in ing), sum(r["duplicates"] for r in ing)
    by_source = collections.defaultdict(collections.Counter)
    for r in final:
        by_source[r["source"]][etype(r)] += 1
    data = {
        "total": n,
        "companies": len({r["company_name"] for r in final if not missing(r.get("company_name"))}),
        "locations": len({r["standardized_city"] for r in final if not missing(r.get("standardized_city"))}),
        "skills": len({s for r in final for s in (r.get("extracted_skills") or [])}),
        "sources": ranked(collections.Counter(r["source"] for r in final)),
        "employment": {
            "types": ranked(collections.Counter(etype(r) for r in final)),
            "work_modes": ranked(collections.Counter(MODES.get(r.get("standardized_work_mode"), "Not specified") for r in final)),
            "by_source": {s: ranked(c) for s, c in by_source.items()},
        },
        "quality": {
            "ingestion": ing,
            "stages": [
                ["Raw rows fetched (3 sources)", raw_total, "Remotive API, Arbeitnow API, Kaggle Pakistan CSV"],
                ["Duplicates removed at ingestion", ing_dupes, "Same source id or content seen twice"],
                ["Validated records (full run)", validated_total, "Pydantic JobPosting schema"],
                ["Rejected by validation", len(rejected), "jobs_rejected.json"],
                ["Team sample used for analysis", len(valid), "jobs_valid.json = sample_300.json"],
                ["After cleaning", len(cleaned), "HTML removed, text standardized"],
                ["Duplicates removed in transform", len(cleaned) - len(dedup), "Same title + company + location"],
                ["Final records", n, "jobs_final.json"],
            ],
            "with_skills": with_skills,
            "without_skills": n - with_skills,
            "missing": [[f, round(100 * sum(1 for r in final if missing(r.get(f))) / n, 1)] for f in FIELDS],
        },
    }
    out = ROOT / "frontend" / "real_data.js"
    out.write_text("window.JOBSTACK_REAL = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"Wrote {out} ({n} records)")


if __name__ == "__main__":
    main()
