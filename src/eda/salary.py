"""Salary coverage. Missing salary is never treated as zero."""
import pandas as pd


def salary_coverage(df: pd.DataFrame) -> dict:
    """Count postings with numeric salary, free-text salary only, or no salary info."""
    numeric = df[["salary_min", "salary_max"]].notna().any(axis=1)
    text = df["salary_text"].notna()
    n = len(df)
    counts = {
        "numeric": int(numeric.sum()),
        "text_only": int((text & ~numeric).sum()),
        "none": int((~numeric & ~text).sum()),
    }
    out = {"n": n, **counts}
    out.update({f"{k}_pct": round(100 * v / n, 1) if n else 0.0 for k, v in counts.items()})
    return out
