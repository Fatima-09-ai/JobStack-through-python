"""Skill demand, co-occurrence and role-specific skills (lift).

All results describe association in advertised postings, not requirements or causes.
"""
from __future__ import annotations

from collections import Counter
from itertools import combinations

import pandas as pd

from .load_data import save_fig

# Soft skills that dominate pair tables; pass as `exclude` to see technical pairs.
SOFT_SKILLS = {"Communication", "Teamwork", "Problem Solving"}


def skill_demand(frame: pd.DataFrame, top: int = 15):
    """Percent of postings (in `frame`) mentioning each skill. Returns (pct Series, n postings)."""
    n = len(frame)
    counts = frame.explode("skills")["skills"].value_counts().head(top)
    return (counts / n * 100).round(1), n


def plot_skills(frame: pd.DataFrame, title: str, fname: str | None = None, top: int = 15, show: bool = True):
    import matplotlib.pyplot as plt
    import seaborn as sns

    pct, n = skill_demand(frame, top)
    fig, ax = plt.subplots(figsize=(7, 5))
    sns.barplot(x=pct.values, y=pct.index, color="#3b82f6", ax=ax)
    ax.set_xlabel("% of postings mentioning skill")
    ax.set_ylabel("")
    ax.set_title(f"{title} (n={n} postings)")
    for i, v in enumerate(pct.values):
        ax.text(v + 0.3, i, f"{v}%", va="center", fontsize=8)
    if fname:
        save_fig(fname)
    if show:
        plt.show()
    return fig


def pair_counts(frame: pd.DataFrame, min_skills: int = 2, exclude: set | None = None):
    """Count skill pairs per posting. Returns (Counter, number of postings in scope)."""
    exclude = exclude or set()
    counter: Counter = Counter()
    n_scope = 0
    for skills in frame["skills"]:
        s = sorted(set(skills) - exclude)
        if len(s) < min_skills:
            continue
        n_scope += 1
        for a, b in combinations(s, 2):
            counter[(a, b)] += 1
    return counter, n_scope


def pair_table(counter: Counter, n_scope: int, min_count: int = 5) -> pd.DataFrame:
    """Pairs seen in at least `min_count` postings, most common first."""
    t = pd.DataFrame([(a, b, c) for (a, b), c in counter.items()], columns=["skill_a", "skill_b", "postings"])
    t = t[t["postings"] >= min_count].sort_values("postings", ascending=False)
    t["pct_of_scope"] = (100 * t["postings"] / n_scope).round(1) if n_scope else 0.0
    return t.reset_index(drop=True)


def cooccurrence_matrix(counter: Counter, skills: list[str]) -> pd.DataFrame:
    mat = pd.DataFrame(0, index=skills, columns=skills)
    for (a, b), c in counter.items():
        if a in skills and b in skills:
            mat.loc[a, b] = c
            mat.loc[b, a] = c
    return mat


def plot_cooccurrence(frame: pd.DataFrame, counter: Counter, n_scope: int, top: int = 15,
                      fname: str | None = None, show: bool = True, exclude: set | None = None):
    import matplotlib.pyplot as plt
    import seaborn as sns

    exclude = exclude or set()
    sk = frame.explode("skills")["skills"].dropna()
    top_skills = sk[~sk.isin(exclude)].value_counts().head(top).index.tolist()
    mat = cooccurrence_matrix(counter, top_skills)
    fig, ax = plt.subplots(figsize=(8, 6.5))
    sns.heatmap(mat, annot=True, fmt="d", cmap="Blues", ax=ax, cbar_kws={"label": "postings"})
    ax.set_title(f"Skill co-occurrence, top {len(top_skills)} skills (n={n_scope} postings)")
    if fname:
        save_fig(fname)
    if show:
        plt.show()
    return fig


def skill_lift(frame: pd.DataFrame, group_col: str = "category",
               min_group: int = 8, min_skill_count: int = 3) -> pd.DataFrame:
    """Lift = P(skill | group) / P(skill overall). Small groups and rare skills are ignored."""
    overall = frame.explode("skills").dropna(subset=["skills"])["skills"].value_counts() / len(frame)
    rows = []
    for grp, g in frame.groupby(group_col):
        if len(g) < min_group:
            continue
        cnt = g.explode("skills").dropna(subset=["skills"])["skills"].value_counts()
        for skill, c in cnt.items():
            if c >= min_skill_count:
                rows.append((grp, skill, len(g), int(c), round(100 * c / len(g), 1),
                             round((c / len(g)) / overall[skill], 2)))
    return pd.DataFrame(rows, columns=[group_col, "skill", "group_n", "postings", "pct_in_group", "lift"])
