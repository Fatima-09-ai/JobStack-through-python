# Project 1 Limitations (Person 4: EDA & Insights)

These limits apply to all EDA results. Numbers refer to the 300-row development sample unless stated otherwise. Update them after the full 8,011-row dataset is used.

## 1. Sampling bias

- The data are online job postings from three sources. They show advertised demand, not the whole labor market. Many jobs are never advertised online.
- Only one source (Kaggle, `kaggle_pk`) is from Pakistan. Arbeitnow is mostly German and European, and Remotive has very few rows (5 in the sample).
- The Kaggle source covers all industries, not only technology. Pakistan skill analysis must use a tech-category filter, which reduces the sample (82 of 180 Kaggle postings in the sample).
- Three cities (Islamabad, Lahore, Karachi) make up about 91% of Kaggle postings, so smaller cities cannot be analyzed.

## 2. Salary missingness

- 0 of 300 postings have a numeric salary, and 99.0% have no salary information. On the full data, only 8 of 8,011 rows have any salary text.
- Salary analysis (by role, city, experience or skill count) is not possible with the current sources. Missing salary is never treated as zero.
- Any salary-based model in Project 2 would need a source with real salary values.

## 3. Skill extraction and ambiguity

- Skills come from a keyword dictionary with only 21 skills, so many real skills are never counted. Coverage differs a lot by source: mean skills per posting is 4.40 (remotive), 1.46 (arbeitnow) and 0.24 (kaggle_pk).
- In Kaggle tech categories, only 24.4% of postings have at least one extracted skill. Skills missing from the dictionary are not counted, so skill rankings for Pakistan are likely too low and biased toward skills the dictionary knows.
- Common words used as skills (for example "Communication" and "Teamwork") dominate skill pairs and can hide technical patterns.
- Some terms have more than one meaning, so keyword matching can create false positives.

## 4. Duplicates

- The data contract flags postings with the same title, company, city and source but does not delete them. Counts may therefore include repeated postings of the same vacancy.
- Duplicate handling is documented by Persons 1 and 2. EDA counts are postings, not unique vacancies.

## 5. Temporal drift and source periods

- Kaggle postings are from 2019-12 to 2021-03. Arbeitnow and Remotive postings are from September to October 2026.
- Because each source covers a different narrow window, time trends are not reported. Skills demand may have changed between 2021 and 2026.

## 6. Field coverage

- Experience exists only for Kaggle and is free text, so it was converted into rough levels (0-1, 1-3, 4-6, 7+ years). Groups such as 7+ years are very small (n = 4 in the sample).
- Work mode is `unknown` for most postings (276 of 300), so work-mode comparisons are not reliable.
- Province is not in the data.

## 7. Small samples and interpretation

- Results from the 300-row sample are provisional. Groups of fewer than about 30 postings are not reported as findings.
- Co-occurrence and lift results describe association in postings. They do not show that a skill causes higher pay, or that a skill is required for a role.
