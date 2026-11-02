"""Tests for the EDA helpers (Person 4)."""
import pandas as pd

from src.eda.experience import exp_level
from src.eda.load_data import parse_list
from src.eda.salary import salary_coverage
from src.eda.skills import pair_counts, pair_table, skill_demand, skill_lift


def _df():
    return pd.DataFrame({
        "category": ["IT", "IT", "IT", "Sales"],
        "skills": [["Python", "SQL"], ["Python"], ["Python", "SQL", "AWS"], []],
        "salary_min": [None, None, 100.0, None],
        "salary_max": [None, None, 200.0, None],
        "salary_text": [None, "$5/hr", None, None],
    })


def test_parse_list():
    assert parse_list("['Python', 'SQL']") == ["Python", "SQL"]
    assert parse_list("[]") == []
    assert parse_list(None) == []
    assert parse_list("not a list") == []
    assert parse_list(["A"]) == ["A"]


def test_exp_level():
    assert exp_level("2 Years Job Exp.") == "1-3 yrs"
    assert exp_level("< 1 Year") == "0-1 yrs"
    assert exp_level("Job for Fresh Graduates") == "0-1 yrs"
    assert exp_level("8 Years") == "7+ yrs"
    assert exp_level(None) is None
    assert exp_level("unknown") is None


def test_salary_coverage_never_zero_filled():
    cov = salary_coverage(_df())
    assert cov["n"] == 4
    assert cov["numeric"] == 1
    assert cov["text_only"] == 1
    assert cov["none"] == 2


def test_skill_demand_is_percent_of_postings():
    pct, n = skill_demand(_df())
    assert n == 4
    assert pct["Python"] == 75.0


def test_pair_counts_and_table():
    counter, n_scope = pair_counts(_df())
    assert n_scope == 2
    assert counter[("Python", "SQL")] == 2
    t = pair_table(counter, n_scope, min_count=2)
    assert list(t["postings"]) == [2]


def test_skill_lift_ignores_small_groups():
    out = skill_lift(_df(), "category", min_group=3, min_skill_count=2)
    assert set(out["category"]) == {"IT"}
    assert (out["lift"] > 0).all()
