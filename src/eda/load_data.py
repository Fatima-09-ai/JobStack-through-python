"""Paths, loading and figure saving for the EDA."""
from __future__ import annotations

import ast
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "transformed" / "jobs_final.csv"   # change here for the full data
FIG_DIR = ROOT / "reports" / "findings" / "figures"

# Kaggle covers all industries, so Pakistan skill analysis should use tech categories only.
TECH_CATEGORIES = ["IT", "Computer Software", "Web & E-commerce", "Engineering", "Telecom"]


def parse_list(x) -> list:
    """extracted_skills is stored as text like "['Python', 'SQL']" in the CSV."""
    if isinstance(x, list):
        return x
    if x is None or (isinstance(x, float) and pd.isna(x)) or x == "":
        return []
    try:
        value = ast.literal_eval(x)
    except (ValueError, SyntaxError):
        return []
    return value if isinstance(value, list) else []


def load_jobs(path: Path | str | None = None) -> pd.DataFrame:
    """Load the transformed jobs file and add parsed helper columns.

    Adds: skills (list), n_skills (int). posted_at is parsed to UTC datetimes
    (mixed formats across sources are handled).
    """
    path = Path(path) if path else DATA_PATH
    df = pd.read_csv(path)
    df["skills"] = df["extracted_skills"].apply(parse_list)
    df["n_skills"] = df["skills"].str.len()
    df["posted_at"] = pd.to_datetime(df["posted_at"], errors="coerce", utc=True, format="mixed")
    return df


def tech_pakistan(df: pd.DataFrame) -> pd.DataFrame:
    """Kaggle (Pakistan) postings in tech categories."""
    return df[(df["source"] == "kaggle_pk") & (df["category"].isin(TECH_CATEGORIES))]


def save_fig(name: str, fig_dir: Path | None = None) -> Path:
    import matplotlib.pyplot as plt

    out_dir = Path(fig_dir) if fig_dir else FIG_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    out = out_dir / f"{name}.png"
    plt.savefig(out, bbox_inches="tight")
    return out
