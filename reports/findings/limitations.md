# Project 1 Limitations (Person 4: EDA & Insights)

These limits apply to all EDA results. Numbers refer to the 300-row dataset used by the team for the demo (kaggle_pk 180, arbeitnow 115, remotive 5).

## 1. Dataset size and sampling bias

- Only 300 postings are analyzed. Groups such as one category, one city or one experience level contain only a few postings, so those results are examples, not firm conclusions.
- The data are online job postings from three sources. They show advertised demand, not the whole labor market. Many jobs are never advertised online.
- Only one source (Kaggle, `kaggle_pk`) is from Pakistan. Arbeitnow is mostly German and European, and Remotive has only 5 rows.
- The Kaggle source covers all industries, not only technology. Pakistan skill analysis uses a tech-category filter, which leaves 82 of 180 Kaggle postings.
- Islamabad, Lahore and Karachi make up about 91% of Kaggle postings, so smaller cities cannot be analyzed.

## 2. Salary missingness

- 0 of 300 postings have a numeric salary, and 99.0% have no salary information at all.
- Salary analysis (by role, city, experience or skill count) is not possible with these sources. Missing salary is never treated as zero.
- Any salary-based model in Project 2 would need a source with real salary values.

## 3. Skill extraction and ambiguity

- Skills come from a keyword dictionary with only 21 skills, so many real skills (HTML/CSS, Android, Unity, WordPress, machine learning, testing and others) are never counted.
- Coverage differs by source: mean skills per posting is 4.40 (remotive), 1.46 (arbeitnow) and 0.24 (kaggle_pk). In Kaggle tech categories only 24.4% of postings have at least one skill.
- Skill rankings and skill pairs therefore show what the dictionary can detect, and they understate demand for skills it does not contain, especially for Pakistan.
- Communication and Teamwork dominate skill counts and pairs, so a technical-only view is also reported.
- Keyword matching can produce false positives for words with more than one meaning.

## 4. Duplicates

- The pipeline removes duplicates by title, company and location, but reposted vacancies with different wording can remain. Counts are postings, not unique vacancies.

## 5. Temporal drift and source periods

- Kaggle postings are from 2019-12 to 2021-03. Arbeitnow and Remotive postings are from September to October 2026.
- Each source covers a different narrow window, so no time trends are reported. Skill demand may have changed between 2021 and 2026.

## 6. Field coverage

- Experience exists only for Kaggle and is free text, so it was converted into rough levels (0-1, 1-3, 4-6, 7+ years). The 7+ group is very small (n = 4).
- Work mode is `unknown` for 276 of 300 postings, so work-mode comparisons are not reliable.
- Province is not in the data.

## 7. Interpretation

- Co-occurrence and lift results describe association in postings. They do not show that a skill causes higher pay, or that a skill is required for a role.
