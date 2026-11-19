# JobStack database verification report

**Overall result: PASS - all checks passed**

| Item | Value |
|---|---|
| Generated at | 2026-11-19T15:30:31 |
| Database file | `jobstack_final.db` (880 KB, SQLite 3.50.4) |
| Source data | `jobs_final.json` (300 records) |
| Checks passed | 30 of 30 |

## 1. Table inventory

| table | rows |
|---|---|
| companies | 259 |
| locations | 69 |
| skills | 20 |
| postings | 300 |
| posting_skills | 234 |
| salary_observations | 3 |

## 2. Verification checks


### Structure

| Result | Check | Detail |
|---|---|---|
| PASS | table `companies` exists |  |
| PASS | table `locations` exists |  |
| PASS | table `skills` exists |  |
| PASS | table `postings` exists |  |
| PASS | table `posting_skills` exists |  |
| PASS | table `salary_observations` exists |  |
| PASS | view `v_postings_flat` exists |  |
| PASS | view `v_posting_skills_flat` exists |  |
| PASS | view `v_skill_counts` exists |  |

### Source vs database

| Result | Check | Detail |
|---|---|---|
| PASS | postings row count = 300 | db has 300 |
| PASS | companies row count = 259 | db has 259 |
| PASS | locations row count = 69 | db has 69 |
| PASS | skills row count = 20 | db has 20 |
| PASS | posting_skills row count = 234 | db has 234 |
| PASS | no foreign key violations | 0 found |
| PASS | no salary stored as 0 | 0 found |

### Integrity

| Result | Check | Detail |
|---|---|---|
| PASS | SQLite integrity_check = ok | ok |
| PASS | PRAGMA foreign_key_check returns nothing | 0 violations |

### Relationships and rules

| Result | Check | Detail |
|---|---|---|
| PASS | 0 posting_skills rows pointing to a missing posting | 0 found |
| PASS | 0 posting_skills rows pointing to a missing skill | 0 found |
| PASS | 0 postings pointing to a missing company | 0 found |
| PASS | 0 postings pointing to a missing location | 0 found |
| PASS | 0 salary_observations pointing to a missing posting | 0 found |
| PASS | 0 duplicate (source, source_posting_id) pairs | 0 found |
| PASS | 0 duplicate (posting, skill) pairs | 0 found |
| PASS | 0 duplicate company names | 0 found |
| PASS | 0 duplicate skill names | 0 found |
| PASS | 0 locations duplicated (city, country, NULL-safe) | 0 found |
| PASS | 0 salary stored as 0 | 0 found |
| PASS | 0 invalid work_mode values | 0 found |

## 3. Analytical query results

Produced by running every query in `sql/04_queries.sql`.

### jobs_by_city (top 10)

| city | n_postings |
|---|---|
| Islamabad | 57 |
| Lahore | 57 |
| Karachi | 49 |
| London | 13 |
| Berlin | 9 |
| Amsterdam | 8 |
| Munich | 7 |
| Faisalabad | 5 |
| Germany | 4 |
| Paris | 4 |

### jobs_by_role (top 10 standardized titles)

| standardized_title | n_postings |
|---|---|
| Graphic Designer | 3 |
| Autocad Draftsman | 2 |
| CSR | 2 |
| Full Stack Developer | 2 |
| HR Executive | 2 |
| Marketing Expert | 2 |
| SEO Expert | 2 |
| Senior Product Designer | 2 |
| Solutions Consultant | 2 |
| 3D Character Animator | 1 |

### skill_frequency (top 15, with share of ALL postings)

| skill | n_postings | pct_of_postings |
|---|---|---|
| Communication | 45 | 15.0 |
| Teamwork | 35 | 11.7 |
| Python | 26 | 8.7 |
| Excel | 16 | 5.3 |
| PHP | 15 | 5.0 |
| AWS | 13 | 4.3 |
| SQL | 13 | 4.3 |
| JavaScript | 12 | 4.0 |
| Git | 10 | 3.3 |
| Java | 10 | 3.3 |
| React | 8 | 2.7 |
| C# | 6 | 2.0 |
| Node.js | 5 | 1.7 |
| TypeScript | 5 | 1.7 |
| C++ | 4 | 1.3 |

### skill_frequency_pakistan (postings located in Pakistan only)

| skill | n_postings |
|---|---|
| PHP | 13 |
| Communication | 6 |
| JavaScript | 6 |
| Excel | 5 |
| SQL | 3 |
| AWS | 2 |
| Java | 2 |
| Node.js | 2 |
| React | 2 |
| C# | 1 |

### salary_coverage (how much salary data do we really have?)

| total_postings | with_any_salary_info | with_numeric_salary |
|---|---|---|
| 300 | 3 | 0 |

### experience_breakdown (NULL means the source did not state it)

| experience | n_postings |
|---|---|
| not stated | 120 |
| < 1 Year | 47 |
| 1 Year Job Exp. | 37 |
| 2 Years Job Exp. | 32 |
| 3 Years Job Exp. | 22 |
| 5 Years Job Exp. | 13 |
| Job for Fresh Graduates | 12 |
| 4 Years Job Exp. | 7 |
| Job for Students | 5 |
| 15 Years Job Exp. | 2 |
| 8 Years Job Exp. | 1 |
| 6 Years Job Exp. | 1 |
| 10 Years Job Exp. | 1 |

### work_mode_breakdown

| work_mode | n_postings |
|---|---|
| unknown | 276 |
| remote | 24 |

### source_breakdown

| source | n_postings |
|---|---|
| kaggle_pk | 180 |
| arbeitnow | 115 |
| remotive | 5 |

### top_skill_pairs (skills that appear together in the same posting)

| skill_1 | skill_2 | together |
|---|---|---|
| Communication | Teamwork | 19 |
| Communication | Python | 9 |
| Python | AWS | 9 |
| Java | AWS | 6 |
| Python | Teamwork | 6 |
| Java | JavaScript | 5 |
| Java | Python | 5 |
| JavaScript | Node.js | 5 |
| JavaScript | PHP | 5 |
| JavaScript | Python | 5 |

## 4. Data observations (from this database)

- Postings by source: kaggle_pk = 180, arbeitnow = 115, remotive = 5.
- Salary: 0 of 300 postings have a numeric salary; 3 have any salary information (including free text). Missing salary is stored as NULL, never 0.
- Skills: 186 of 300 postings have no extracted skill, so skill counts are lower bounds.
- Unknown company: 9 postings (company_id is NULL). Unknown location: 20 postings (location_id is NULL).
- The data is a sample, not the whole job market; results describe this dataset only.

## 5. How to generate and access the database

From the repository root:

```bash
pip install -r requirements.txt
python -m src.database.load_database      # builds data/jobstack_final.db and runs QA
python -m src.database.run_queries        # prints all analytical queries
python -m src.database.verify_database    # regenerates this report
python -m pytest tests/test_database.py tests/test_verify_database.py
```

The database file is git-ignored; teammates create it by running the loader. To open it:

```python
import sqlite3, pandas as pd
con = sqlite3.connect("data/jobstack_final.db")
pd.read_sql_query("SELECT * FROM v_postings_flat LIMIT 5", con)
```

Or use DB Browser for SQLite (File > Open Database) or `sqlite3 data/jobstack_final.db`. Views for analysis: `v_postings_flat`, `v_posting_skills_flat`, `v_skill_counts`.
