# EDA & Insights (Person 4)

How to reproduce the Project 1 EDA from the repository root, with the virtual environment active.

## 1. Setup

```bash
pip install -r requirements.txt
```

## 2. Data

Default input: `data/transformed/jobs_final.csv` (Person 2's output). To use another file, change `DATA_PATH` in `src/eda/load_data.py`, or pass `--data <path>` below.

## 3. Rebuild the charts and key numbers (no notebook needed)

```bash
python -m src.eda.run_eda
python -m src.eda.run_eda --min-pair 30     # use ~30 on the full dataset
```

Charts are saved to `reports/findings/figures/`.

## 4. Open the full analysis

```bash
jupyter notebook notebooks/project1_eda.ipynb
```

Then choose Kernel -> Restart & Run All.

## 5. Tests

```bash
python -m pytest tests/test_eda.py
```

## Files

| Path | What it is |
|---|---|
| `notebooks/project1_eda.ipynb` | Full EDA with outputs |
| `src/eda/load_data.py` | Paths, loading, figure saving, tech-category filter |
| `src/eda/skills.py` | Skill demand, co-occurrence, role-specific skills (lift) |
| `src/eda/experience.py` | Experience text to rough levels |
| `src/eda/salary.py` | Salary coverage (missing is never treated as zero) |
| `src/eda/run_eda.py` | Command line entry point |
| `reports/findings/project1_findings.md` | Findings (provisional until the full data is used) |
| `reports/findings/limitations.md` | Limitations |
| `reports/findings/figures/` | Charts |

## Reading the results

Skill results describe association in advertised job postings. They do not show that a skill causes higher pay or that a skill is required for a role.
