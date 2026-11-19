/**
 * JobStack Dataset & Skills Intelligence Engine
 * 300 Seeded Jobs with Canonical Skill Taxonomy, Frequencies, Co-occurrences, and Salaries
 */

// Seeded PRNG for consistent, deterministic job generation
function createRng(seed = 2026) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = createRng(2026);

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function expand(list) {
  const out = [];
  list.forEach(([item, count]) => {
    for (let i = 0; i < count; i++) out.push(item);
  });
  return out;
}

function roundToFive(n) {
  return Math.round(n / 5) * 5;
}

// Canonical Skill Dictionary and Categories
export const SKILL_CATEGORIES = {
  PROGRAMMING_LANGUAGES: [
    'Python',
    'SQL',
    'JavaScript',
    'TypeScript',
    'Java',
    'C++',
    'C#',
    'PHP',
  ],
  FRAMEWORKS_AND_TOOLS: [
    'React',
    'Node.js',
    'Pandas',
    'FastAPI',
    'Django',
    'Flask',
    'Docker',
    'AWS',
    'Azure',
    'Kubernetes',
    'Linux',
    'Git',
    'PostgreSQL',
    'MongoDB',
    'Tableau',
    'Power BI',
    'PyTorch',
    'TensorFlow',
    'Spark',
    'Excel',
    'Selenium',
    'Figma',
    'REST APIs',
    'Networking',
    'SEO',
  ],
  SOFT_SKILLS: [
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Agile',
    'Jira',
    'Leadership',
  ],
};

export const SOFT_SKILLS_SET = new Set(SKILL_CATEGORIES.SOFT_SKILLS);
export const LANGUAGES_SET = new Set(SKILL_CATEGORIES.PROGRAMMING_LANGUAGES);

export function getSkillCategory(skillName) {
  if (LANGUAGES_SET.has(skillName)) return 'Programming Language';
  if (SOFT_SKILLS_SET.has(skillName)) return 'Soft Skill / Methodology';
  return 'Framework / Tool';
}

export const BASE_DATA = {
  jobs: 300,
  companies: 84,
  skills: 36,
  locations: [
    ['Lahore', 62],
    ['Karachi', 55],
    ['Islamabad', 48],
    ['Remote', 30],
    ['Rawalpindi', 24],
    ['Faisalabad', 20],
    ['Peshawar', 15],
    ['Multan', 14],
    ['Sialkot', 10],
    ['Hyderabad', 8],
    ['Gujranwala', 8],
    ['Quetta', 6],
  ],
  companyTop: [
    ['Nexa Labs', 21],
    ['Orbit Systems', 18],
    ['Brightwave', 16],
    ['Kinetic Works', 14],
    ['Lumen Data', 13],
    ['Harbor Tech', 11],
    ['Pixel Forge', 10],
    ['Northstar', 9],
  ],
  skillsTop: [
    ['Python', 142],
    ['SQL', 128],
    ['JavaScript', 119],
    ['React', 96],
    ['Excel', 88],
    ['AWS', 74],
    ['Node.js', 69],
    ['Docker', 58],
    ['Communication', 55],
    ['Git', 51],
  ],
  weekly: [18, 21, 19, 24, 22, 27, 26, 29, 28, 31, 27, 28],
  types: [
    ['Full-time', 198],
    ['Contract', 52],
    ['Internship', 30],
    ['Part-time', 20],
  ],
};

export const ROLES = [
  {
    n: 'Software Engineer',
    s: ['Python', 'Java', 'JavaScript', 'C++', 'Git', 'SQL', 'Docker', 'REST APIs', 'Agile'],
    a: 'You will design, build and maintain core product features used by thousands of customers.',
    r: [
      'Write clean, tested and maintainable code',
      'Review pull requests and improve code quality',
      'Work with product and design to ship features on schedule',
    ],
  },
  {
    n: 'Frontend Developer',
    s: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Git', 'Figma'],
    a: 'You will turn designs into fast, accessible and responsive web interfaces.',
    r: [
      'Build reusable UI components',
      'Optimize page speed and accessibility',
      'Integrate front-end screens with backend APIs',
    ],
  },
  {
    n: 'Backend Developer',
    s: ['Node.js', 'Python', 'Django', 'Flask', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'REST APIs', 'Git'],
    a: 'You will own the services and databases that power our platform.',
    r: [
      'Design and document REST APIs',
      'Model data and write efficient queries',
      'Monitor services and fix production issues',
    ],
  },
  {
    n: 'Full-Stack Developer',
    s: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Git', 'Docker'],
    a: 'You will work across the whole stack, from database to user interface.',
    r: [
      'Ship features end to end',
      'Build APIs and the screens that use them',
      'Deploy and maintain applications',
    ],
  },
  {
    n: 'Data Analyst',
    s: ['SQL', 'Excel', 'Python', 'Tableau', 'Power BI', 'Pandas', 'Communication'],
    a: 'You will turn raw business data into clear insights that guide decisions.',
    r: [
      'Build dashboards and weekly reports',
      'Clean and validate datasets',
      'Present findings to non-technical teams',
    ],
  },
  {
    n: 'Data Scientist',
    s: ['Python', 'Pandas', 'SQL', 'TensorFlow', 'PyTorch', 'Spark', 'Communication'],
    a: 'You will build models and experiments that solve real business problems.',
    r: [
      'Explore data and engineer features',
      'Train, evaluate and tune models',
      'Explain results to stakeholders',
    ],
  },
  {
    n: 'Machine Learning Engineer',
    s: ['Python', 'PyTorch', 'TensorFlow', 'Docker', 'AWS', 'Git', 'Pandas'],
    a: 'You will take machine learning models from notebooks into production.',
    r: [
      'Build training and inference pipelines',
      'Deploy and monitor models',
      'Improve model speed and accuracy',
    ],
  },
  {
    n: 'DevOps Engineer',
    s: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Git', 'Azure', 'Python'],
    a: 'You will keep our delivery pipeline and infrastructure fast and reliable.',
    r: [
      'Automate builds, tests and deployments',
      'Manage containers and cloud resources',
      'Set up monitoring and alerts',
    ],
  },
  {
    n: 'QA Engineer',
    s: ['Selenium', 'JavaScript', 'Jira', 'Agile', 'SQL', 'Communication'],
    a: 'You will make sure every release is stable before it reaches users.',
    r: [
      'Write and run manual and automated tests',
      'Report and track bugs',
      'Help define quality standards for the team',
    ],
  },
  {
    n: 'Product Manager',
    s: ['Agile', 'Jira', 'Communication', 'Leadership', 'Excel', 'SQL'],
    a: 'You will decide what we build next and guide it from idea to launch.',
    r: [
      'Gather user needs and define requirements',
      'Prioritize the product roadmap',
      'Coordinate design, engineering and marketing',
    ],
  },
  {
    n: 'UI/UX Designer',
    s: ['Figma', 'CSS', 'Communication', 'JavaScript'],
    a: 'You will shape how our products look, feel and work for users.',
    r: [
      'Create wireframes, prototypes and design systems',
      'Run user research and usability tests',
      'Hand off polished designs to developers',
    ],
  },
  {
    n: 'Business Analyst',
    s: ['Excel', 'SQL', 'Power BI', 'Communication', 'Jira', 'Agile'],
    a: 'You will connect business goals with data and technical teams.',
    r: [
      'Document requirements and processes',
      'Analyze performance metrics',
      'Recommend improvements to stakeholders',
    ],
  },
  {
    n: 'Database Administrator',
    s: ['SQL', 'PostgreSQL', 'MongoDB', 'Linux', 'AWS'],
    a: 'You will keep our databases fast, secure and always available.',
    r: [
      'Tune queries and indexes',
      'Manage backups and recovery',
      'Control access and monitor health',
    ],
  },
  {
    n: 'Cloud Engineer',
    s: ['AWS', 'Azure', 'Kubernetes', 'Linux', 'Docker', 'Networking'],
    a: 'You will design and run the cloud systems behind our products.',
    r: [
      'Provision and secure cloud infrastructure',
      'Control cost and capacity',
      'Support teams moving workloads to the cloud',
    ],
  },
  {
    n: 'Mobile App Developer',
    s: ['Flutter', 'JavaScript', 'React', 'Java', 'REST APIs', 'Git'],
    a: 'You will build mobile apps that people use every day.',
    r: [
      'Develop features for Android and iOS',
      'Connect apps to backend APIs',
      'Fix crashes and improve performance',
    ],
  },
  {
    n: 'Technical Support Engineer',
    s: ['Communication', 'Linux', 'Networking', 'SQL', 'Jira'],
    a: 'You will help customers solve technical problems quickly and clearly.',
    r: [
      'Troubleshoot customer issues',
      'Document fixes in the knowledge base',
      'Escalate bugs to engineering with clear detail',
    ],
  },
  {
    n: 'Project Manager',
    s: ['Agile', 'Jira', 'Leadership', 'Communication', 'Excel'],
    a: 'You will keep projects on time, on budget and moving in one direction.',
    r: [
      'Plan scope, schedules and budgets',
      'Run stand-ups and sprint reviews',
      'Report progress and risks to leadership',
    ],
  },
  {
    n: 'Digital Marketing Specialist',
    s: ['SEO', 'Excel', 'Communication', 'Tableau'],
    a: 'You will grow our audience and measure what works.',
    r: [
      'Plan and run online campaigns',
      'Improve search rankings',
      'Track results and report on ROI',
    ],
  },
  {
    n: 'Data Engineer',
    s: ['Python', 'SQL', 'Spark', 'AWS', 'Docker', 'PostgreSQL'],
    a: 'You will build the pipelines that deliver trusted data to every team.',
    r: [
      'Design and maintain ETL pipelines',
      'Keep data accurate and on time',
      'Optimize storage and processing cost',
    ],
  },
  {
    n: 'Cybersecurity Analyst',
    s: ['Networking', 'Linux', 'Python', 'Communication', 'AWS'],
    a: 'You will protect our systems and data from threats.',
    r: [
      'Monitor systems for suspicious activity',
      'Investigate and respond to incidents',
      'Run vulnerability scans and fix gaps',
    ],
  },
];

export const LEVELS = [
  { n: 'Intern', pre: '', exp: 'No experience required', lo: 25, hi: 45 },
  { n: 'Junior', pre: 'Junior ', exp: '0–2 years', lo: 80, hi: 130 },
  { n: 'Mid-level', pre: '', exp: '2–4 years', lo: 150, hi: 230 },
  { n: 'Senior', pre: 'Senior ', exp: '5+ years', lo: 260, hi: 400 },
  { n: 'Lead', pre: 'Lead ', exp: '7+ years', lo: 420, hi: 600 },
];

export const BENEFITS = [
  'Health insurance',
  'Flexible working hours',
  'Annual performance bonus',
  'Paid learning budget',
  'Provident fund',
  'Hybrid work option',
  'Free lunch',
  'Career growth plan',
  'Paid annual leave',
];

// Generate the 300 jobs dataset
export function generateJobs() {
  const localRand = createRng(2026);
  function localShuffle(a) {
    const copy = [...a];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(localRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function localPick(a) {
    return a[Math.floor(localRand() * a.length)];
  }

  const prefixes = [
    'Apex', 'Zenith', 'Cobalt', 'Vertex', 'Quantum', 'Solis', 'Ember', 'Atlas',
    'Nimbus', 'Helix', 'Cipher', 'Vector', 'Prism', 'Falcon', 'Granite', 'Aurora',
    'Pioneer', 'Summit', 'Echo', 'Indigo',
  ];
  const suffixes = [
    'Systems', 'Labs', 'Digital', 'Soft', 'Works', 'Analytics', 'Cloud', 'Technologies',
  ];

  const others = [];
  prefixes.forEach((p) => {
    suffixes.forEach((s) => {
      others.push(`${p} ${s}`);
    });
  });
  localShuffle(others);

  const compCounts = [...BASE_DATA.companyTop];
  others.slice(0, 76).forEach((n, i) => {
    compCounts.push([n, i < 36 ? 3 : 2]);
  });

  const locs = localShuffle(expand(BASE_DATA.locations));
  const types = localShuffle(expand(BASE_DATA.types));
  const comps = localShuffle(expand(compCounts));

  const jobs = [];
  for (let k = 0; k < BASE_DATA.jobs; k++) {
    const ri = Math.floor(localRand() * ROLES.length);
    const role = ROLES[ri];
    const type = types[k];
    const li = type === 'Internship' ? 0 : localPick([1, 1, 2, 2, 2, 3, 3, 4]);
    const lv = LEVELS[li];
    let lo = roundToFive(lv.lo + localRand() * (lv.hi - lv.lo));
    let hi = roundToFive(lo * (1.25 + localRand() * 0.2));
    if (type === 'Part-time') {
      lo = roundToFive(lo * 0.55);
      hi = roundToFive(hi * 0.55);
    }
    if (hi <= lo) hi = lo + 5;
    const days = Math.floor(localRand() * 84);

    const roleSkills = localShuffle(role.s);
    const pickedSkills = roleSkills.slice(0, Math.min(role.s.length, 3 + Math.floor(localRand() * 3)));

    jobs.push({
      r: ri,
      roleName: role.n,
      level: lv.n,
      exp: lv.exp,
      title: li === 0 ? `${role.n} Intern` : `${lv.pre}${role.n}`,
      company: comps[k],
      loc: locs[k],
      type,
      salaryMin: lo,
      salaryMax: hi,
      salaryAvg: Math.round((lo + hi) / 2),
      salary: `PKR ${lo}k – ${hi}k / month`,
      days,
      posted:
        days === 0
          ? 'Today'
          : days === 1
          ? '1 day ago'
          : days < 14
          ? `${days} days ago`
          : `${Math.floor(days / 7)} weeks ago`,
      skills: pickedSkills,
      benefits: localShuffle(BENEFITS).slice(0, 4),
    });
  }

  jobs.sort((a, b) => a.days - b.days);
  jobs.forEach((j, i) => {
    j.id = i + 1;
  });

  return jobs;
}

export const JOBS = generateJobs();

// ==============================================================================
// Skills Intelligence Aggregations & Analytical Helpers
// ==============================================================================

export function getSkillsSummary(jobs = JOBS) {
  const totalJobs = jobs.length;
  const countMap = new Map();
  const salaryMap = new Map();

  jobs.forEach((job) => {
    job.skills.forEach((skill) => {
      countMap.set(skill, (countMap.get(skill) || 0) + 1);
      if (!salaryMap.has(skill)) {
        salaryMap.set(skill, []);
      }
      salaryMap.get(skill).push(job.salaryAvg);
    });
  });

  const skillsList = Array.from(countMap.entries()).map(([name, count]) => {
    const salaries = salaryMap.get(name) || [];
    const avgSalary = salaries.length
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : 0;

    return {
      name,
      count,
      pct: parseFloat(((count / totalJobs) * 100).toFixed(1)),
      category: getSkillCategory(name),
      avgSalary,
    };
  });

  skillsList.sort((a, b) => b.count - a.count);
  return skillsList;
}

export function getLanguageMetrics(jobs = JOBS) {
  const summary = getSkillsSummary(jobs);
  const langList = summary.filter((s) => LANGUAGES_SET.has(s.name));

  const languageDetails = langList.map((lang) => {
    const matchingJobs = jobs.filter((j) => j.skills.includes(lang.name));
    const levels = { Intern: 0, Junior: 0, 'Mid-level': 0, Senior: 0, Lead: 0 };
    matchingJobs.forEach((j) => {
      levels[j.level] = (levels[j.level] || 0) + 1;
    });

    return {
      ...lang,
      totalPostings: matchingJobs.length,
      levels,
      topRole: getTopValue(matchingJobs.map((j) => j.roleName)),
    };
  });

  return languageDetails;
}

export function getFrameworkToolMetrics(jobs = JOBS) {
  const summary = getSkillsSummary(jobs);
  const toolList = summary.filter((s) => !LANGUAGES_SET.has(s.name) && !SOFT_SKILLS_SET.has(s.name));

  const subCategoryMap = {
    Frontend: ['React', 'CSS', 'Figma'],
    'Backend & APIs': ['Node.js', 'FastAPI', 'Django', 'Flask', 'REST APIs', 'PostgreSQL', 'MongoDB'],
    'Cloud & DevOps': ['Docker', 'AWS', 'Azure', 'Kubernetes', 'Linux'],
    'Data & AI': ['Pandas', 'PyTorch', 'TensorFlow', 'Spark', 'Excel', 'Tableau', 'Power BI'],
    'Dev Tools & Testing': ['Git', 'Selenium', 'Networking', 'SEO'],
  };

  const getSubCategory = (skill) => {
    for (const [sub, skills] of Object.entries(subCategoryMap)) {
      if (skills.includes(skill)) return sub;
    }
    return 'General Tool';
  };

  return toolList.map((item) => ({
    ...item,
    subCategory: getSubCategory(item.name),
  }));
}

export function getSkillPairs(jobs = JOBS, { excludeSoftSkills = false, minCount = 4 } = {}) {
  const pairCounts = new Map();
  const totalJobs = jobs.length;
  let inScopeJobs = 0;

  jobs.forEach((job) => {
    let skills = job.skills;
    if (excludeSoftSkills) {
      skills = skills.filter((s) => !SOFT_SKILLS_SET.has(s));
    }
    const uniqueSkills = Array.from(new Set(skills)).sort();
    if (uniqueSkills.length >= 2) {
      inScopeJobs++;
      for (let i = 0; i < uniqueSkills.length; i++) {
        for (let j = i + 1; j < uniqueSkills.length; j++) {
          const key = `${uniqueSkills[i]}__${uniqueSkills[j]}`;
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    }
  });

  const pairs = [];
  pairCounts.forEach((count, key) => {
    if (count >= minCount) {
      const [skillA, skillB] = key.split('__');
      pairs.push({
        skillA,
        skillB,
        count,
        pct: parseFloat(((count / totalJobs) * 100).toFixed(1)),
        pctInScope: inScopeJobs ? parseFloat(((count / inScopeJobs) * 100).toFixed(1)) : 0,
      });
    }
  });

  pairs.sort((a, b) => b.count - a.count);
  return { pairs, inScopeJobs, totalJobs };
}

export function getCooccurrenceMatrix(jobs = JOBS, targetSkills) {
  const matrix = {};
  targetSkills.forEach((s1) => {
    matrix[s1] = {};
    targetSkills.forEach((s2) => {
      matrix[s1][s2] = 0;
    });
  });

  jobs.forEach((job) => {
    const jobSkills = new Set(job.skills);
    targetSkills.forEach((s1) => {
      if (jobSkills.has(s1)) {
        targetSkills.forEach((s2) => {
          if (jobSkills.has(s2)) {
            matrix[s1][s2]++;
          }
        });
      }
    });
  });

  return matrix;
}

export function getSkillDeepDive(skillName, jobs = JOBS) {
  if (!skillName) return null;
  const nameLower = skillName.trim().toLowerCase();
  const summary = getSkillsSummary(jobs);
  const foundSkill = summary.find((s) => s.name.toLowerCase() === nameLower);

  const canonicalName = foundSkill ? foundSkill.name : skillName;
  const matchingJobs = jobs.filter((j) =>
    j.skills.some((s) => s.toLowerCase() === canonicalName.toLowerCase())
  );

  if (matchingJobs.length === 0) return null;

  const rank = summary.findIndex((s) => s.name === canonicalName) + 1;

  const coMap = new Map();
  matchingJobs.forEach((j) => {
    j.skills.forEach((s) => {
      if (s !== canonicalName) {
        coMap.set(s, (coMap.get(s) || 0) + 1);
      }
    });
  });

  const coOccurring = Array.from(coMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      pctOfJobs: parseFloat(((count / matchingJobs.length) * 100).toFixed(1)),
      category: getSkillCategory(name),
    }))
    .sort((a, b) => b.count - a.count);

  const roleMap = new Map();
  matchingJobs.forEach((j) => {
    roleMap.set(j.roleName, (roleMap.get(j.roleName) || 0) + 1);
  });
  const topRoles = Array.from(roleMap.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  const compMap = new Map();
  matchingJobs.forEach((j) => {
    compMap.set(j.company, (compMap.get(j.company) || 0) + 1);
  });
  const topCompanies = Array.from(compMap.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count);

  const locMap = new Map();
  matchingJobs.forEach((j) => {
    locMap.set(j.loc, (locMap.get(j.loc) || 0) + 1);
  });
  const topLocations = Array.from(locMap.entries())
    .map(([loc, count]) => ({ loc, count }))
    .sort((a, b) => b.count - a.count);

  const levelCounts = { Intern: 0, Junior: 0, 'Mid-level': 0, Senior: 0, Lead: 0 };
  matchingJobs.forEach((j) => {
    levelCounts[j.level] = (levelCounts[j.level] || 0) + 1;
  });

  const avgSalary = foundSkill ? foundSkill.avgSalary : 0;
  const salaries = matchingJobs.map((j) => j.salaryAvg);
  const minSalary = Math.min(...salaries);
  const maxSalary = Math.max(...salaries);

  return {
    name: canonicalName,
    category: getSkillCategory(canonicalName),
    rank: rank || 'N/A',
    postingsCount: matchingJobs.length,
    marketSharePct: parseFloat(((matchingJobs.length / jobs.length) * 100).toFixed(1)),
    avgSalary,
    salaryRange: `PKR ${minSalary}k – ${maxSalary}k / mo`,
    levelCounts,
    coOccurring,
    topRoles,
    topCompanies,
    topLocations,
    matchingJobs,
  };
}

function getTopValue(arr) {
  if (!arr.length) return '';
  const counts = {};
  let maxItem = arr[0];
  let maxCount = 0;
  arr.forEach((it) => {
    counts[it] = (counts[it] || 0) + 1;
    if (counts[it] > maxCount) {
      maxCount = counts[it];
      maxItem = it;
    }
  });
  return maxItem;
}

// Attach to window if in browser environment without module bundler
if (typeof window !== 'undefined') {
  window.JobStackData = {
    BASE_DATA,
    JOBS,
    ROLES,
    LEVELS,
    BENEFITS,
    SKILL_CATEGORIES,
    SOFT_SKILLS_SET,
    LANGUAGES_SET,
    getSkillCategory,
    getSkillsSummary,
    getLanguageMetrics,
    getFrameworkToolMetrics,
    getSkillPairs,
    getCooccurrenceMatrix,
    getSkillDeepDive,
  };
}
