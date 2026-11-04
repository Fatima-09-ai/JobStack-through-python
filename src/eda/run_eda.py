"""Rebuild the main EDA charts and print key numbers without opening the notebook.

Usage (from the repo root):
    python -m src.eda.run_eda
    python -m src.eda.run_eda --data data/transformed/jobs_final.csv --min-pair 30
"""
from __future__ import annotations

import argparse

import matplotlib

matplotlib.use("Agg")  # no window needed

import matplotlib.pyplot as plt  # noqa: E402
import seaborn as sns  # noqa: E402

from .load_data import DATA_PATH, load_jobs, save_fig, tech_pakistan  # noqa: E402
from .salary import salary_coverage  # noqa: E402
from .skills import SOFT_SKILLS, pair_counts, pair_table, plot_cooccurrence, plot_skills  # noqa: E402


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--data", default=str(DATA_PATH), help="path to jobs_final.csv")
    ap.add_argument("--min-pair", type=int, default=5, help="minimum postings for a skill pair (use ~30 on full data)")
    args = ap.parse_args(argv)

    sns.set_theme(style="whitegrid")
    df = load_jobs(args.data)
    print(f"Loaded {len(df):,} rows from {args.data}")
    print("\nRows per source:\n", df["source"].value_counts().to_string())
    print("\nSalary coverage:", salary_coverage(df))

    tech = tech_pakistan(df)
    print(f"\nPakistan tech postings: {len(tech)}; with >=1 skill: {(tech.n_skills > 0).mean() * 100:.1f}%")

    plot_skills(df, "Top skills, all sources", "top_skills_all", show=False)
    for src, g in df.groupby("source"):
        if len(g) >= 30:
            plot_skills(g, f"Top skills, {src}", f"top_skills_{src}", show=False)

    pk = df[df["source"] == "kaggle_pk"]
    counts = pk["standardized_city"].value_counts().head(10)
    fig, ax = plt.subplots(figsize=(7, 4))
    sns.barplot(x=counts.values, y=counts.index, color="#10b981", ax=ax)
    ax.set_title(f"Postings by city, Pakistan source (n={len(pk)})")
    ax.set_xlabel("postings")
    ax.set_ylabel("")
    save_fig("postings_by_city_pk")

    counter, n_scope = pair_counts(df)
    print(f"\nPostings with 2+ skills: {n_scope}")
    print(pair_table(counter, n_scope, args.min_pair).head(15).to_string(index=False))
    plot_cooccurrence(df, counter, n_scope, fname="skill_cooccurrence", show=False)

    counter_t, n_t = pair_counts(df, exclude=SOFT_SKILLS)
    plot_cooccurrence(df, counter_t, n_t, fname="skill_cooccurrence_technical", show=False, exclude=SOFT_SKILLS)
    print("\nCharts saved to reports/findings/figures/")


if __name__ == "__main__":
    main()
