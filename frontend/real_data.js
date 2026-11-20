window.JOBSTACK_REAL = {
 "total": 300,
 "companies": 259,
 "locations": 69,
 "skills": 20,
 "sources": [
  [
   "kaggle_pk",
   180
  ],
  [
   "arbeitnow",
   115
  ],
  [
   "remotive",
   5
  ]
 ],
 "employment": {
  "types": [
   [
    "Full-time",
    260
   ],
   [
    "Not specified",
    22
   ],
   [
    "Part-time",
    6
   ],
   [
    "Contract",
    5
   ],
   [
    "Other",
    3
   ],
   [
    "Internship",
    3
   ],
   [
    "Temporary",
    1
   ]
  ],
  "work_modes": [
   [
    "Not specified",
    276
   ],
   [
    "Remote",
    24
   ]
  ],
  "by_source": {
   "remotive": [
    [
     "Full-time",
     4
    ],
    [
     "Contract",
     1
    ]
   ],
   "arbeitnow": [
    [
     "Full-time",
     76
    ],
    [
     "Not specified",
     22
    ],
    [
     "Part-time",
     6
    ],
    [
     "Contract",
     4
    ],
    [
     "Other",
     3
    ],
    [
     "Internship",
     3
    ],
    [
     "Temporary",
     1
    ]
   ],
   "kaggle_pk": [
    [
     "Full-time",
     180
    ]
   ]
  }
 },
 "quality": {
  "ingestion": [
   {
    "source": "remotive",
    "raw": 15,
    "duplicates": 0,
    "unique": 15
   },
   {
    "source": "arbeitnow",
    "raw": 2665,
    "duplicates": 67,
    "unique": 2598
   },
   {
    "source": "kaggle_pk",
    "raw": 6680,
    "duplicates": 1282,
    "unique": 5398
   }
  ],
  "stages": [
   [
    "Raw rows fetched (3 sources)",
    9360,
    "Remotive API, Arbeitnow API, Kaggle Pakistan CSV"
   ],
   [
    "Duplicates removed at ingestion",
    1349,
    "Same source id or content seen twice"
   ],
   [
    "Validated records (full run)",
    8011,
    "Pydantic JobPosting schema"
   ],
   [
    "Rejected by validation",
    0,
    "jobs_rejected.json"
   ],
   [
    "Team sample used for analysis",
    300,
    "jobs_valid.json = sample_300.json"
   ],
   [
    "After cleaning",
    300,
    "HTML removed, text standardized"
   ],
   [
    "Duplicates removed in transform",
    0,
    "Same title + company + location"
   ],
   [
    "Final records",
    300,
    "jobs_final.json"
   ]
  ],
  "with_skills": 114,
  "without_skills": 186,
  "missing": [
   [
    "company_name",
    3.0
   ],
   [
    "city",
    6.7
   ],
   [
    "employment_type",
    7.3
   ],
   [
    "experience",
    40.0
   ],
   [
    "salary_min",
    100.0
   ],
   [
    "salary_max",
    100.0
   ],
   [
    "salary_text",
    99.0
   ],
   [
    "posted_at",
    0.0
   ]
  ]
 }
};
