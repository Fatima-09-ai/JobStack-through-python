"""Turn Kaggle free-text experience (e.g. '2 Years Job Exp.') into rough levels."""
import re

import pandas as pd

LEVEL_ORDER = ["0-1 yrs", "1-3 yrs", "4-6 yrs", "7+ yrs"]


def exp_level(s):
    """Return one of LEVEL_ORDER, or None if the text cannot be parsed."""
    if s is None or pd.isna(s):
        return None
    t = str(s).lower()
    if "fresh" in t or "< 1" in t or "less than" in t:
        return "0-1 yrs"
    m = re.search(r"(\d+)", t)
    if not m:
        return None
    y = int(m.group(1))
    if y < 1:
        return "0-1 yrs"
    if y <= 3:
        return "1-3 yrs"
    if y <= 6:
        return "4-6 yrs"
    return "7+ yrs"
