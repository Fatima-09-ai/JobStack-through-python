# Project 1 Findings (Person 4: EDA & Insights)

**Dataset:** the 300-row validated sample (`data/transformed/jobs_final.csv`), agreed by the team as the working dataset for the demo.
Sources: kaggle_pk 180 (60.0%), arbeitnow 115 (38.3%), remotive 5 (1.7%).

All results describe **association in advertised job postings**. They do not show that a skill causes higher pay or that a skill is required for a role. Charts are in `reports/findings/figures/`. Every number can be reproduced with `python -m src.eda.run_eda` or `notebooks/project1_eda.ipynb`.

## Summary

1. Salary data is almost absent (0 numeric salaries), so salary analysis is not possible.
2. Python is the most common technical skill overall. Communication and Teamwork are the most common skills of all.
3. Skill coverage depends heavily on the source: 69.6% of Arbeitnow postings have an extracted skill, but only 17.2% of Kaggle (Pakistan) postings.
4. Most Pakistan postings are in Islamabad, Lahore and Karachi, and most ask for up to three years of experience.
5. Python + AWS is the most common technical skill pair.

---

## Finding 1: Salary data is almost entirely missing

- **Metric:** share of postings with usable salary information
- **Result:** 0 of 300 postings have a numeric salary. 3 (1.0%) have free-text salary only. 297 (99.0%) have none.
- **Sample size:** n = 300 (all sources).
- **Limitation:** salary by role, city, experience or skill count cannot be analyzed. Missing salary is never treated as zero. Project 2 would need a source with real salary values.

## Finding 2: Python leads the technical skills, soft skills lead overall

- **Metric:** percent of postings mentioning each skill
- **Result (all sources, n = 300):** Communication 15.0%, Teamwork 11.7%, Python 8.7%, Excel 5.3%, PHP 5.0%, SQL 4.3%, AWS 4.3%, JavaScript 4.0%.
- **Chart:** `top_skills_all.png`
- **Limitation:** percentages are low because 62% of postings have no extracted skill (see Finding 3). The skill dictionary has only 21 skills.

## Finding 3: Skill coverage and skill mix differ a lot by source

- **Metric:** share of postings with at least one extracted skill, and top skills per source
- **Result:** Arbeitnow (n = 115): 69.6%, led by Communication 31.3%, Teamwork 30.4%, Python 20.0%. Kaggle Pakistan (n = 180): 17.2%, led by PHP 7.2%, JavaScript 3.3%, Communication 3.3%. Remotive (n = 5) is too small to interpret.
- **Charts:** `top_skills_arbeitnow.png`, `top_skills_kaggle_pk.png`
- **Cause and limitation:** the dictionary in `src/transformation/extract_skills.py` has only 21 skills (for example no HTML/CSS, Android, Unity, WordPress, machine learning or software testing). Within Kaggle tech categories (n = 82), only 24.4% of postings have a skill, so Pakistan skill rankings understate real demand. Kaggle also covers all industries, so some postings have no tech skills.

## Finding 4: Pakistan postings concentrate in three cities

- **Metric:** Kaggle postings by city
- **Result:** Islamabad 57, Lahore 57, Karachi 49, together 163 of 180 (90.6%). Faisalabad 5. The largest categories are IT 35, Computer Software 20, Customer Service 20, Web & E-commerce 13.
- **Sample size:** n = 180 (kaggle_pk only).
- **Chart:** `postings_by_city_pk.png`
- **Limitation:** Kaggle data are from 2019-2021 and cover all industries. The three cities are too close in size to rank.

## Finding 5: Most Pakistan postings ask for little experience

- **Metric:** share of postings by experience level (parsed from text such as "2 Years Job Exp.")
- **Result:** 0-1 years 59, 1-3 years 91, 4-6 years 21, 7+ years 4. 5 values could not be parsed. About half (91 of 175) ask for 1-3 years.
- **Sample size:** n = 180 (kaggle_pk only), 175 parsed.
- **Limitation:** experience exists only for Kaggle. The 7+ group (n = 4) is too small to analyze.

## Finding 6: Python and AWS appear together most often among technical skills

- **Metric:** number of postings in which two skills appear together (technical skills only, soft skills removed)
- **Result:** Python + AWS 9 postings (24.3% of the 37 postings with 2+ technical skills), AWS + Java 6, and 5 each for Java + JavaScript, JavaScript + PHP, JavaScript + Node.js, Java + Python, JavaScript + Python, JavaScript + React. Including soft skills, Communication + Teamwork is the top pair (19 postings).
- **Sample size:** n = 37 postings with 2+ technical skills (62 with soft skills included).
- **Charts:** `skill_cooccurrence.png`, `skill_cooccurrence_technical.png`
- **Limitation:** small numbers; the pairs show which skills are listed together, not that they are used together on the job.

## Finding 7: Some skills are over-represented in certain job categories

- **Metric:** lift = how many times more common a skill is in a category than in all postings
- **Result:** PHP in Web & E-commerce (5 of 13 postings, lift 7.7), Excel in Admin (3 of 9, lift 6.3), JavaScript in Computer Software (3 of 21, lift 3.6), Python in Engineering (4 of 15, lift 3.1).
- **Sample size:** categories with at least 8 postings and skills with at least 3 postings.
- **Limitation:** each cell rests on 3-5 postings. Treat these as examples of the method, not firm conclusions.

## Finding 8: The sources cover different time periods

- **Metric:** earliest and latest `posted_at` per source
- **Result:** kaggle_pk 2019-12 to 2021-03. arbeitnow 2026-10-07 to 2026-10-14. remotive 2026-09-16 to 2026-10-11.
- **Limitation:** each source covers a narrow window, so no demand trend over time is reported.

## Finding 9: Work mode is mostly unknown

- **Metric:** share of postings by work mode
- **Result:** 276 of 300 (92%) are `unknown`, 24 are `remote` (19 Arbeitnow, 5 Remotive). No Kaggle posting states a work mode.
- **Limitation:** remote vs on-site comparisons are not reliable.

---

## Not reported

- Salary by any grouping (see Finding 1).
- Skill demand trends over time (see Finding 8).
- Any claim that a skill causes higher pay or is required for a role.
