# Project 1 Findings (Person 4: EDA & Insights)

**Status: PROVISIONAL.** All numbers below come from the 300-row development sample (`data/transformed/jobs_final.csv`). Re-run `notebooks/project1_eda.ipynb` on the full 8,011-row dataset and update every number before the final presentation.

Sample composition: kaggle_pk 180 (60.0%), arbeitnow 115 (38.3%), remotive 5 (1.7%).

---

## Finding 1: Salary data is almost entirely missing

- **Metric:** share of postings with usable salary information
- **Result:** 0 of 300 postings have a numeric salary. 3 (1.0%) have free-text salary only. 297 (99.0%) have no salary information.
- **Sample size:** n = 300 (all sources). The data contract reports 8 of 8,011 rows with any salary text on the full data.
- **Limitation:** salary analysis (by role, city, experience, skill count) cannot be done with the current sources. Missing salary is never treated as zero.
- **Implication:** the team must decide whether to find a source with salaries or change the main task of Project 2.

## Finding 2: Skill extraction coverage differs a lot by source

- **Metric:** mean number of extracted skills per posting
- **Result:** remotive 4.40, arbeitnow 1.46, kaggle_pk 0.24. Overall, 38.0% of postings have at least one extracted skill.
- **Sample size:** n = 300 (remotive n = 5 is too small to rely on).
- **Limitation:** Kaggle covers all industries, so some postings truly have no tech skills.
- **Follow-up:** within Kaggle tech categories (IT, Computer Software, Web & E-commerce, Engineering, Telecom), only 24.4% of postings (n = 82) have at least one extracted skill, and examples such as "Game Developer (Unity 3D)" have none. This suggests dictionary gaps, so Pakistan skill rankings are unreliable until the dictionary improves.

## Finding 3: Sources cover different time periods, so trends cannot be compared

- **Metric:** earliest and latest `posted_at` per source
- **Result:** kaggle_pk 2019-12 to 2021-03. arbeitnow 2026-10-07 to 2026-10-14. remotive 2026-09-16 to 2026-10-11.
- **Sample size:** n = 300.
- **Limitation:** each source covers a narrow window, so no skill or demand trend over time is reported.

## Finding 4: Pakistan postings are concentrated in three cities

- **Metric:** share of Kaggle (Pakistan) postings by city
- **Result:** Islamabad 57, Lahore 57, Karachi 49. Together 163 of 180 (90.6%). Faisalabad has 5.
- **Sample size:** n = 180 (kaggle_pk only).
- **Limitation:** Kaggle covers all industries (not only tech) and data from 2019-2021. Cities are too similar in size to rank on this sample.

## Finding 5: Most Pakistan postings ask for little experience

- **Metric:** share of postings by experience level (parsed from text such as "2 Years Job Exp.")
- **Result:** 0-1 years 59, 1-3 years 91, 4-6 years 21, 7+ years 4. 5 values could not be parsed.
- **Sample size:** n = 180 (kaggle_pk only), 175 parsed.
- **Limitation:** the experience field exists only for Kaggle. The 7+ years group is too small to analyze.

---

## Not yet reportable (waiting for the full data)

- Top skills, skill pairs and role-specific skills (lift): the 300-row sample gives groups of only 3 to 5 postings, so these are not stated as findings.
- Skill vs experience pattern: the sample shows more skills per posting at higher experience (0.10 to 1.00), but it is confounded by low extraction coverage and the 7+ group has n = 4.
- Salary by any grouping: not possible (see Finding 1).

## Wording rule

All skill results describe association in advertised postings. They do not show that a skill causes higher pay or that a skill is required for a role.
