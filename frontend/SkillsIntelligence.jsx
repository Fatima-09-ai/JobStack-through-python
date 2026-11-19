import React, { useState, useMemo } from 'react';
import {
  JOBS,
  BASE_DATA,
  getSkillsSummary,
  getLanguageMetrics,
  getFrameworkToolMetrics,
  getSkillPairs,
  getCooccurrenceMatrix,
  getSkillDeepDive,
  SOFT_SKILLS_SET,
  LANGUAGES_SET,
} from './jobstackData.js';

export default function SkillsIntelligence({ onSelectJob }) {
  // Navigation / Filter State
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'demanded', 'languages', 'tools', 'cooccurrence'
  const [searchQuery, setSearchQuery] = useState('Python');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [excludeSoftSkills, setExcludeSoftSkills] = useState(true);
  const [selectedPairFilter, setSelectedPairFilter] = useState(null); // [skillA, skillB] for matrix click
  const [matrixHoverCell, setMatrixHoverCell] = useState(null);

  const jData = typeof window !== 'undefined' && window.JobStackData ? window.JobStackData : {
    JOBS,
    BASE_DATA,
    getSkillsSummary,
    getLanguageMetrics,
    getFrameworkToolMetrics,
    getSkillPairs,
    getCooccurrenceMatrix,
    getSkillDeepDive,
    SOFT_SKILLS_SET,
    LANGUAGES_SET,
  };

  const jobsData = jData.JOBS;
  const baseData = jData.BASE_DATA;

  // Derived Analytics Data
  const allSkillsSummary = useMemo(() => jData.getSkillsSummary(jobsData), [jData, jobsData]);
  const languageMetrics = useMemo(() => jData.getLanguageMetrics(jobsData), [jData, jobsData]);
  const frameworkToolMetrics = useMemo(() => jData.getFrameworkToolMetrics(jobsData), [jData, jobsData]);
  const { pairs: skillPairs, inScopeJobs } = useMemo(
    () => jData.getSkillPairs(jobsData, { excludeSoftSkills, minCount: 4 }),
    [jData, jobsData, excludeSoftSkills]
  );

  // Matrix Top Skills
  const matrixSkills = useMemo(
    () => [
      'Python',
      'SQL',
      'JavaScript',
      'React',
      'Docker',
      'AWS',
      'Git',
      'Pandas',
      'Node.js',
      'Excel',
    ],
    []
  );

  const coocMatrix = useMemo(
    () => jData.getCooccurrenceMatrix(jobsData, matrixSkills),
    [jData, jobsData, matrixSkills]
  );

  // Selected Skill Deep Dive
  const deepDiveData = useMemo(
    () => jData.getSkillDeepDive(searchQuery, jobsData),
    [jData, searchQuery, jobsData]
  );

  // Filtered skills list for "Most Demanded"
  const filteredDemandedSkills = useMemo(() => {
    return allSkillsSummary.filter((s) => {
      if (categoryFilter === 'All') return true;
      if (categoryFilter === 'Languages') return jData.LANGUAGES_SET.has(s.name);
      if (categoryFilter === 'Frameworks & Tools')
        return !jData.LANGUAGES_SET.has(s.name) && !jData.SOFT_SKILLS_SET.has(s.name);
      if (categoryFilter === 'Soft Skills') return jData.SOFT_SKILLS_SET.has(s.name);
      return true;
    });
  }, [allSkillsSummary, categoryFilter, jData]);

  // Jobs matching selected matrix pair
  const pairMatchingJobs = useMemo(() => {
    if (!selectedPairFilter) return [];
    const [sA, sB] = selectedPairFilter;
    return jobsData.filter(
      (j) => j.skills.includes(sA) && j.skills.includes(sB)
    );
  }, [jobsData, selectedPairFilter]);

  const topLanguages = languageMetrics.slice(0, 8);
  const maxLangCount = Math.max(...topLanguages.map((l) => l.count), 1);
  const maxSkillCount = allSkillsSummary[0]?.count || 150;

  return (
    <div className="skills-intelligence-view">
      <div className="skills-header">
        <h2 className="page-title">Skills Intelligence</h2>
        <p className="skills-subtitle">
          Market demand, language benchmarks, framework prevalence & co-occurrence
          graphs across 300 verified postings.
        </p>
      </div>

      {/* Top Navigation Tabs */}
      <div className="skills-nav-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Overview & Deep Dive
        </button>
        <button
          className={`tab-btn ${activeTab === 'demanded' ? 'active' : ''}`}
          onClick={() => setActiveTab('demanded')}
        >
          Most Demanded Skills
        </button>
        <button
          className={`tab-btn ${activeTab === 'languages' ? 'active' : ''}`}
          onClick={() => setActiveTab('languages')}
        >
          Programming Languages
        </button>
        <button
          className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Frameworks & Tools
        </button>
        <button
          className={`tab-btn ${activeTab === 'cooccurrence' ? 'active' : ''}`}
          onClick={() => setActiveTab('cooccurrence')}
        >
          Skill Combinations & Co-occurrence
        </button>
      </div>

      {/* KPI Highlights Strip */}
      <div className="kpis skills-kpi-strip">
        <div className="card kpi">
          <b>{allSkillsSummary.length}</b>
          <span>Total Skills Extracted</span>
        </div>
        <div className="card kpi">
          <b>47.3%</b>
          <span>#1 Top Language (Python)</span>
        </div>
        <div className="card kpi">
          <b>32.0%</b>
          <span>#1 Top Framework (React)</span>
        </div>
        <div className="card kpi">
          <b>78</b>
          <span>Top Pair (Python + SQL)</span>
        </div>
        <div className="card kpi">
          <b>4.8</b>
          <span>Avg Skills per Job</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: SEARCH & DEEP DIVE                                               */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'search') && (
        <section className="card skills-section deep-dive-section">
          <div className="section-header">
            <h3>Search for a Particular Skill</h3>
            <span className="section-tag">Interactive Explorer</span>
          </div>
          <p className="sub">
            Search any skill to inspect market rank, salary ranges, co-occurring
            technologies, and matching job postings.
          </p>

          <div className="skill-search-bar">
            <div className="field" style={{ flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skill (e.g. Python, React, AWS, SQL, Docker, Pandas, Git)..."
                className="skill-search-input"
              />
            </div>
            {searchQuery && (
              <button
                className="chip reset"
                onClick={() => setSearchQuery('')}
                style={{ height: '42px', marginTop: 'auto' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick-Pick Pills */}
          <div className="quick-skill-pills">
            <span className="quick-label">Popular Skills:</span>
            {[
              'Python',
              'SQL',
              'JavaScript',
              'React',
              'AWS',
              'Docker',
              'Pandas',
              'Git',
              'Excel',
              'Node.js',
              'TypeScript',
            ].map((skl) => (
              <button
                key={skl}
                className={`pill-btn ${searchQuery.toLowerCase() === skl.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSearchQuery(skl)}
              >
                {skl}
              </button>
            ))}
          </div>

          {/* Deep Dive Spotlight Result */}
          {deepDiveData ? (
            <div className="deep-dive-card">
              <div className="spotlight-header">
                <div>
                  <span className="category-badge">{deepDiveData.category}</span>
                  <h4 className="spotlight-title">{deepDiveData.name}</h4>
                </div>
                <div className="spotlight-rank-box">
                  <span className="rank-num">#{deepDiveData.rank}</span>
                  <span className="rank-label">Rank in Demand</span>
                </div>
              </div>

              {/* Metric Facts Grid */}
              <div className="facts" style={{ margin: '14px 0' }}>
                <div className="fact">
                  <span>Job Postings</span>
                  <b>
                    {deepDiveData.postingsCount} / 300 ({deepDiveData.marketSharePct}%)
                  </b>
                </div>
                <div className="fact">
                  <span>Avg Monthly Salary</span>
                  <b>PKR {deepDiveData.avgSalary}k / mo</b>
                </div>
                <div className="fact">
                  <span>Salary Range</span>
                  <b>{deepDiveData.salaryRange}</b>
                </div>
                <div className="fact">
                  <span>Top Hiring City</span>
                  <b>
                    {deepDiveData.topLocations[0]?.loc || 'Lahore'} (
                    {deepDiveData.topLocations[0]?.count} jobs)
                  </b>
                </div>
              </div>

              {/* Experience Distribution Bar */}
              <div className="level-distribution-box">
                <span className="field-title">Experience Level Breakdown:</span>
                <div className="level-bar-container">
                  {Object.entries(deepDiveData.levelCounts).map(([lvl, count]) => {
                    if (count === 0) return null;
                    const pct = Math.round(
                      (count / deepDiveData.postingsCount) * 100
                    );
                    return (
                      <div
                        key={lvl}
                        className={`level-seg seg-${lvl.toLowerCase().replace(/[^a-z]/g, '')}`}
                        style={{ width: `${pct}%` }}
                        title={`${lvl}: ${count} jobs (${pct}%)`}
                      >
                        <span>
                          {lvl} {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="deep-dive-grid">
                {/* Co-occurring Skills */}
                <div className="deep-subcard">
                  <h5>Frequently Paired With {deepDiveData.name}</h5>
                  <p className="sub">
                    Click any paired skill to view its deep dive profile.
                  </p>
                  <div className="paired-skills-list">
                    {deepDiveData.coOccurring.slice(0, 8).map((co) => (
                      <div
                        key={co.name}
                        className="paired-row"
                        onClick={() => setSearchQuery(co.name)}
                        title={`Click to explore ${co.name}`}
                      >
                        <span className="paired-name">{co.name}</span>
                        <div className="track">
                          <div
                            className="fill"
                            style={{ width: `${co.pctOfJobs}%` }}
                          ></div>
                        </div>
                        <i className="paired-stat">
                          {co.count} ({co.pctOfJobs}%)
                        </i>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Roles & Companies */}
                <div className="deep-subcard">
                  <h5>Top Roles & Companies</h5>
                  <p className="sub">
                    Where {deepDiveData.name} is most frequently required.
                  </p>
                  <div className="mini-tables">
                    <div>
                      <span className="mini-heading">Top Job Titles:</span>
                      <ul className="mini-list">
                        {deepDiveData.topRoles.slice(0, 4).map((r) => (
                          <li key={r.role}>
                            <span>{r.role}</span>
                            <b>{r.count}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="mini-heading">Top Hiring Companies:</span>
                      <ul className="mini-list">
                        {deepDiveData.topCompanies.slice(0, 4).map((c) => (
                          <li key={c.company}>
                            <span>{c.company}</span>
                            <b>{c.count}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Matching Jobs List */}
              <div className="matching-jobs-container">
                <div className="section-header" style={{ marginTop: '20px' }}>
                  <h5>
                    Jobs Requiring {deepDiveData.name} ({deepDiveData.matchingJobs.length}{' '}
                    Found)
                  </h5>
                  <span className="sub">Click any card to open full job details</span>
                </div>

                <div className="jobs mini-jobs-grid">
                  {deepDiveData.matchingJobs.slice(0, 6).map((j) => (
                    <button
                      key={j.id}
                      className="card job"
                      onClick={() => onSelectJob(j)}
                    >
                      <h3>{j.title}</h3>
                      <p className="co">
                        {j.company} · {j.loc}
                      </p>
                      <div>
                        <span className="pill hot">{j.type}</span>
                        <span className="pill">{j.salary}</span>
                      </div>
                      <p className="skl">{j.skills.join(' · ')}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card empty" style={{ marginTop: '16px' }}>
              <h3>No skill found matching "{searchQuery}"</h3>
              <p className="sub">
                Try selecting a popular skill above or check for spelling.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION: MOST DEMANDED SKILLS                                             */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'demanded') && (
        <section className="card skills-section">
          <div className="section-header">
            <h3>Most Demanded Skills</h3>
            <span className="section-tag">{filteredDemandedSkills.length} Skills</span>
          </div>
          <p className="sub">
            Ranked frequency of extracted skills across 300 job postings with market
            share and salary correlation.
          </p>

          {/* Filter Chips */}
          <div className="chips" style={{ marginBottom: '16px' }}>
            {['All', 'Languages', 'Frameworks & Tools', 'Soft Skills'].map((cat) => (
              <button
                key={cat}
                className="chip"
                aria-pressed={categoryFilter === cat}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="skills-table">
            <div className="skills-table-head">
              <span style={{ width: '40px' }}>#</span>
              <span style={{ flex: 1.2 }}>Skill</span>
              <span style={{ width: '130px' }}>Category</span>
              <span style={{ flex: 2 }}>Postings & Market Penetration</span>
              <span style={{ width: '90px', textAlign: 'right' }}>Avg Salary</span>
            </div>

            <div className="skills-table-body">
              {filteredDemandedSkills.map((item, idx) => (
                <div
                  key={item.name}
                  className="skills-table-row"
                  onClick={() => {
                    setSearchQuery(item.name);
                    setActiveTab('all');
                  }}
                  title={`Click to view deep dive for ${item.name}`}
                >
                  <span className="rank-col">#{idx + 1}</span>
                  <span className="name-col">
                    <b>{item.name}</b>
                  </span>
                  <span className="cat-col">
                    <span className="badge-micro">{item.category}</span>
                  </span>
                  <div className="bar-col">
                    <div className="track">
                      <div
                        className="fill"
                        style={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                      ></div>
                    </div>
                    <span className="count-col">
                      {item.count} jobs ({item.pct}%)
                    </span>
                  </div>
                  <span className="sal-col">PKR {item.avgSalary}k</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION: PROGRAMMING LANGUAGE FREQUENCY                                   */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'languages') && (
        <section className="card skills-section">
          <div className="section-header">
            <h3>Programming Language Frequency</h3>
            <span className="section-tag">Core Languages</span>
          </div>
          <p className="sub">
            Relative frequency, market penetration and seniority distribution
            among core programming languages.
          </p>

          <div className="grid" style={{ marginBottom: '18px' }}>
            {/* Language Frequency Bars */}
            <div className="card subcard">
              <h4>Language Market Share</h4>
              <p className="sub">Percentage of total postings mentioning each language.</p>
              {topLanguages.map((lang) => (
                <div key={lang.name} className="row" style={{ margin: '6px -6px' }}>
                  <span style={{ fontWeight: 'bold' }}>{lang.name}</span>
                  <div className="track">
                    <div
                      className="fill"
                      style={{
                        width: `${(lang.count / maxLangCount) * 100}%`,
                        backgroundColor: '#ff2d2d',
                      }}
                    ></div>
                  </div>
                  <i>{lang.count}</i>
                </div>
              ))}
            </div>

            {/* Language Comparative Grid */}
            <div className="card subcard">
              <h4>Seniority & Compensation Benchmarks</h4>
              <p className="sub">
                Experience profile and average salary per language.
              </p>
              <div className="lang-benchmarks-list">
                {topLanguages.map((lang) => (
                  <div key={lang.name} className="lang-benchmark-item">
                    <div className="lang-item-top">
                      <b>{lang.name}</b>
                      <span>Avg PKR {lang.avgSalary}k / mo</span>
                    </div>
                    <div className="lang-mini-levels">
                      {Object.entries(lang.levels).map(([lvl, cnt]) => (
                        <span key={lvl} className="level-pill-micro">
                          {lvl.slice(0, 3)}: {cnt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION: FRAMEWORK AND TOOL FREQUENCY                                     */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'tools') && (
        <section className="card skills-section">
          <div className="section-header">
            <h3>Framework and Tool Frequency</h3>
            <span className="section-tag">Libraries, Cloud & Tools</span>
          </div>
          <p className="sub">
            Demand breakdown across Web, Cloud, Data & DevOps tooling environments.
          </p>

          <div className="tools-domain-grid">
            {['Frontend', 'Backend & APIs', 'Cloud & DevOps', 'Data & AI', 'Dev Tools & Testing'].map(
              (domain) => {
                const toolsInDomain = frameworkToolMetrics.filter(
                  (t) => t.subCategory === domain
                );
                return (
                  <div key={domain} className="card domain-card">
                    <h4>{domain}</h4>
                    <span className="sub">{toolsInDomain.length} tools tracked</span>
                    <div className="domain-tools-list">
                      {toolsInDomain.map((tool) => (
                        <div
                          key={tool.name}
                          className="domain-row"
                          onClick={() => {
                            setSearchQuery(tool.name);
                            setActiveTab('all');
                          }}
                        >
                          <span className="tool-name">{tool.name}</span>
                          <div className="track">
                            <div
                              className="fill"
                              style={{ width: `${(tool.count / 100) * 100}%` }}
                            ></div>
                          </div>
                          <span className="tool-count">{tool.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION: SKILL COMBINATIONS & CO-OCCURRENCE                               */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'cooccurrence') && (
        <section className="card skills-section">
          <div className="section-header">
            <h3>Skill Combinations and Co-occurrence</h3>
            <span className="section-tag">Synergy & Clustering</span>
          </div>
          <p className="sub">
            Pairs and tech stacks that frequently appear together in the same job
            posting.
          </p>

          {/* Toggle for soft skills */}
          <div className="cooc-controls-bar">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={excludeSoftSkills}
                onChange={(e) => setExcludeSoftSkills(e.target.checked)}
                className="brutalist-checkbox"
              />
              <span>
                Exclude Soft Skills (Communication, Teamwork, Problem Solving) for
                pure technical synergy
              </span>
            </label>
            <span className="scope-tag">
              Scope: {inScopeJobs} postings with 2+ skills
            </span>
          </div>

          <div className="grid">
            {/* Top Skill Combinations Table */}
            <div className="card subcard">
              <h4>Top Co-occurring Pairs</h4>
              <p className="sub">Most frequent skill pairs in job postings.</p>

              <div className="pairs-table">
                {skillPairs.slice(0, 10).map((pair, idx) => (
                  <div
                    key={`${pair.skillA}-${pair.skillB}`}
                    className="pair-row"
                    onClick={() => {
                      setSelectedPairFilter([pair.skillA, pair.skillB]);
                    }}
                    title={`Click to view jobs requiring ${pair.skillA} + ${pair.skillB}`}
                  >
                    <span className="pair-rank">#{idx + 1}</span>
                    <span className="pair-names">
                      <b>{pair.skillA}</b> + <b>{pair.skillB}</b>
                    </span>
                    <div className="track" style={{ flex: 1, margin: '0 10px' }}>
                      <div
                        className="fill"
                        style={{ width: `${(pair.count / 80) * 100}%` }}
                      ></div>
                    </div>
                    <span className="pair-count">
                      {pair.count} jobs ({pair.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curated Stack Synergy */}
            <div className="card subcard">
              <h4>High-Synergy Tech Stacks</h4>
              <p className="sub">Standard multi-skill combinations in the market.</p>

              <div className="tech-stack-cards">
                <div className="stack-card">
                  <b>Python Data Stack</b>
                  <p className="sub">Data Engineering & Analytics</p>
                  <div className="stack-pills">
                    <span className="pill">Python</span>
                    <span className="pill">SQL</span>
                    <span className="pill">Pandas</span>
                    <span className="pill">Docker</span>
                  </div>
                </div>

                <div className="stack-card">
                  <b>Modern Full-Stack Web</b>
                  <p className="sub">Product Engineering</p>
                  <div className="stack-pills">
                    <span className="pill">React</span>
                    <span className="pill">JavaScript</span>
                    <span className="pill">Node.js</span>
                    <span className="pill">Git</span>
                  </div>
                </div>

                <div className="stack-card">
                  <b>Cloud & DevOps Stack</b>
                  <p className="sub">Infrastructure & Deployment</p>
                  <div className="stack-pills">
                    <span className="pill">Docker</span>
                    <span className="pill">AWS</span>
                    <span className="pill">Kubernetes</span>
                    <span className="pill">Linux</span>
                  </div>
                </div>

                <div className="stack-card">
                  <b>Machine Learning Systems</b>
                  <p className="sub">Model Training & Inference</p>
                  <div className="stack-pills">
                    <span className="pill">Python</span>
                    <span className="pill">PyTorch</span>
                    <span className="pill">TensorFlow</span>
                    <span className="pill">AWS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Co-occurrence Matrix / Heatmap */}
          <div className="card matrix-container" style={{ marginTop: '18px' }}>
            <div className="section-header">
              <h4>Skill Co-occurrence Matrix (Heatmap)</h4>
              <span className="sub">
                Hover over any cell to inspect mutual postings count
              </span>
            </div>

            <div className="matrix-table-wrapper">
              <table className="cooc-matrix-table">
                <thead>
                  <tr>
                    <th></th>
                    {matrixSkills.map((s) => (
                      <th
                        key={s}
                        className={
                          matrixHoverCell &&
                          (matrixHoverCell.s1 === s || matrixHoverCell.s2 === s)
                            ? 'highlight-header'
                            : ''
                        }
                      >
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixSkills.map((s1) => (
                    <tr key={s1}>
                      <th
                        className={
                          matrixHoverCell &&
                          (matrixHoverCell.s1 === s1 || matrixHoverCell.s2 === s1)
                            ? 'highlight-header'
                            : ''
                        }
                      >
                        {s1}
                      </th>
                      {matrixSkills.map((s2) => {
                        const count = coocMatrix[s1]?.[s2] || 0;
                        const isSelf = s1 === s2;
                        const intensity = isSelf ? 0 : Math.min(1, count / 75);
                        const isHovered =
                          matrixHoverCell &&
                          ((matrixHoverCell.s1 === s1 && matrixHoverCell.s2 === s2) ||
                            (matrixHoverCell.s1 === s2 && matrixHoverCell.s2 === s1));

                        const cellBg = isSelf
                          ? 'rgba(11,11,12,.08)'
                          : intensity > 0.6
                          ? '#ff2d2d'
                          : intensity > 0.3
                          ? 'rgba(255, 45, 45, 0.55)'
                          : intensity > 0.1
                          ? 'rgba(255, 45, 45, 0.25)'
                          : intensity > 0
                          ? 'rgba(255, 45, 45, 0.1)'
                          : 'transparent';

                        const cellColor =
                          intensity > 0.6 && !isSelf ? '#efede6' : '#0b0b0c';

                        return (
                          <td
                            key={s2}
                            style={{
                              backgroundColor: cellBg,
                              color: cellColor,
                              outline: isHovered ? '2px solid #0b0b0c' : undefined,
                              cursor: isSelf ? 'default' : 'crosshair',
                            }}
                            onMouseEnter={() =>
                              !isSelf && setMatrixHoverCell({ s1, s2, count })
                            }
                            onMouseLeave={() => setMatrixHoverCell(null)}
                            onClick={() => {
                              if (!isSelf && count > 0) {
                                setSelectedPairFilter([s1, s2]);
                              }
                            }}
                          >
                            {isSelf ? '—' : count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {matrixHoverCell && (
              <div className="matrix-tooltip-display">
                <b>
                  {matrixHoverCell.s1} + {matrixHoverCell.s2}:
                </b>{' '}
                {matrixHoverCell.count} job postings (
                {((matrixHoverCell.count / baseData.jobs) * 100).toFixed(1)}% of all jobs).
                Click to inspect matching jobs.
              </div>
            )}

            {/* Display pair matching jobs when a pair is clicked */}
            {selectedPairFilter && (
              <div className="pair-filtered-jobs" style={{ marginTop: '20px' }}>
                <div className="section-header">
                  <h5>
                    Jobs Requiring BOTH {selectedPairFilter[0]} AND{' '}
                    {selectedPairFilter[1]} ({pairMatchingJobs.length} postings)
                  </h5>
                  <button
                    className="chip reset"
                    onClick={() => setSelectedPairFilter(null)}
                  >
                    Close Pair View
                  </button>
                </div>
                <div className="jobs mini-jobs-grid">
                  {pairMatchingJobs.map((j) => (
                    <button
                      key={j.id}
                      className="card job"
                      onClick={() => onSelectJob(j)}
                    >
                      <h3>{j.title}</h3>
                      <p className="co">
                        {j.company} · {j.loc}
                      </p>
                      <div>
                        <span className="pill hot">{j.type}</span>
                        <span className="pill">{j.salary}</span>
                      </div>
                      <p className="skl">{j.skills.join(' · ')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.SkillsIntelligence = SkillsIntelligence;
}
