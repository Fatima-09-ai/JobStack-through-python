# EDA Talking Points for the Viva (Person 4)

## 30-second summary
"I analyzed the 300 cleaned job postings from three sources. The main results are: salary data is almost completely missing, Python is the leading technical skill, Python and AWS appear together most often, and Pakistan postings concentrate in Islamabad, Lahore and Karachi. I also found that our skill dictionary is small, which limits the skill results, and I documented this as a limitation."

## Charts to show (in this order)
1. `top_skills_all.png` - most requested skills
2. `top_skills_arbeitnow.png` vs `top_skills_kaggle_pk.png` - skill mix differs by source
3. `postings_by_city_pk.png` - Pakistan cities
4. `skill_cooccurrence_technical.png` - skills that appear together

## Likely questions and short answers
- **Why is salary not analyzed?** 0 of 300 postings have a numeric salary (99% have none). Missing salary is never treated as zero, so we report the coverage as a finding.
- **Why only 300 rows?** The team agreed to use the validated 300-row sample as the demo dataset. Results on small groups are examples, and this is stated in the limitations.
- **Why are the skill percentages low?** The skill dictionary has only 21 skills, and 62% of postings have no extracted skill. Kaggle is the most affected (17.2% have a skill).
- **Why not compare 2021 and 2026?** The sources cover different periods (Kaggle 2019-2021, others 2026), so any trend would be an artifact of the source.
- **What is lift?** How many times more common a skill is in a category than overall. Lift 2 means twice as common.
- **Does this show which skills raise salary?** No. Results show association in advertised postings only, and there is no salary data.
- **How can your work be reproduced?** `python -m src.eda.run_eda` rebuilds the charts, and `notebooks/project1_eda.ipynb` has the full analysis. Tests: `python -m pytest tests/test_eda.py`.
