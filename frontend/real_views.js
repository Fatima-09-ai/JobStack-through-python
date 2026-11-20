/* Employment Analysis, Data Quality & Pipeline, About Project. Reads window.JOBSTACK_REAL (real_data.js). */
(function () {
  var h = React.createElement, D = window.JOBSTACK_REAL;
  var P = function (a, b) { return b ? Math.round((a / b) * 100) : 0; };
  var N = function (x) { return Number(x).toLocaleString('en-US'); };
  function bars(items, total, suffix) {
    var max = Math.max.apply(null, items.map(function (x) { return x[1]; }).concat([1]));
    return items.map(function (x) {
      return h('div', { key: x[0], className: 'row' },
        h('span', { style: { fontWeight: 'bold' } }, x[0]),
        h('div', { className: 'track' }, h('div', { className: 'fill', style: { width: (x[1] / max) * 100 + '%' } })),
        h('i', null, suffix ? x[1] + suffix : N(x[1]) + (total ? ' (' + P(x[1], total) + '%)' : '')));
    });
  }
  function kpi(v, l) { return h('div', { className: 'card kpi', key: l }, h('b', null, v), h('span', null, l)); }
  function card(t, s, kids) {
    return h('div', { className: 'card', key: t }, h('h3', null, t), s ? h('p', { className: 'sub' }, s) : null,
      h('div', { style: { marginTop: 16 } }, kids));
  }
  function note(t) { return h('p', { className: 'sub', style: { marginTop: 12 } }, t); }
  function table(head, rows) {
    var c = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid rgba(11,11,12,.16)' };
    return h('div', { style: { overflowX: 'auto' } }, h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' } },
      h('thead', null, h('tr', null, head.map(function (x) { return h('th', { key: x, style: c }, x); }))),
      h('tbody', null, rows.map(function (r, i) {
        return h('tr', { key: i }, r.map(function (x, j) { return h('td', { key: j, style: c }, x); }));
      }))));
  }
  function list(items) {
    return h('ul', { style: { margin: 0, paddingLeft: 18, lineHeight: 1.7 } }, items.map(function (t, i) { return h('li', { key: i }, t); }));
  }

  window.EmploymentView = function () {
    var E = D.employment, n = D.total;
    var ft = (E.types.filter(function (x) { return x[0] === 'Full-time'; })[0] || [0, 0])[1];
    var rem = (E.work_modes.filter(function (x) { return x[0] === 'Remote'; })[0] || [0, 0])[1];
    return h('div', { className: 'employment-view' },
      h('h2', { className: 'page-title' }, 'Employment Analysis'),
      h('div', { className: 'kpis' }, kpi(N(n), 'Jobs analysed'), kpi(P(ft, n) + '%', 'Full-time'), kpi(N(rem), 'Remote jobs'), kpi(E.types.length, 'Employment categories')),
      h('div', { className: 'grid' },
        card('Employment-type distribution', 'Full-time, part-time, contract and internship across all ' + n + ' jobs.', bars(E.types, n)),
        card('Remote vs on-site vs hybrid', 'Work arrangement as recorded by the sources.', [bars(E.work_modes, n),
          note('Only remote postings are labelled by the sources. On-site and hybrid are not recorded, so they appear as Not specified rather than being guessed.')]),
        card('Employment type by source', 'Kaggle Pakistan (2019-2021) and the Arbeitnow and Remotive APIs (2026) differ in coverage.',
          Object.keys(E.by_source).map(function (s) {
            return h('div', { key: s, style: { marginBottom: 14 } }, h('b', null, s), bars(E.by_source[s]));
          }))));
  };

  window.QualityView = function () {
    var Q = D.quality, n = D.total, raw = Q.stages[0][1];
    return h('div', { className: 'quality-view' },
      h('h2', { className: 'page-title' }, 'Data Quality & Pipeline'),
      h('div', { className: 'kpis' }, kpi(N(raw), 'Original records'), kpi(N(Q.stages[2][1]), 'Validated records'), kpi(N(Q.stages[3][1]), 'Rejected records'), kpi(N(n), 'Final records')),
      h('div', { className: 'grid' },
        card('ETL pipeline stages', 'Real record counts at each stage.', [bars(Q.stages.map(function (s) { return [s[0], s[1]]; })),
          note('Stages: Extract (3 sources), Validate (Pydantic), Clean, Deduplicate, Extract skills, Load and analyse.')]),
        card('Duplicate detection', 'Duplicates dropped at ingestion, per source.', table(['Source', 'Raw rows', 'Duplicates', 'Unique'],
          Q.ingestion.map(function (r) { return [r.source, N(r.raw), N(r.duplicates), N(r.unique)]; }))),
        card('Missing values (% of final records)', 'Missing values stay empty, never filled with 0 or Unknown.', bars(Q.missing, 0, '%')),
        card('Missing-value handling', null, list(['Salary stays null and is never replaced by averages or invented values.',
          'Missing company or city is not filled, so unrelated postings do not collide as duplicates.',
          'Records fail validation only for rule breaks such as a blank title or an inverted salary range.'])),
        card('Cleaning and skill extraction', 'Dictionary-based skill matching on cleaned descriptions.', [bars([
          ['With recognised skills', Q.with_skills], ['No recognised skills', Q.without_skills]], n),
          note(D.skills + ' distinct skills were found across ' + n + ' postings.')])));
  };

  window.AboutView = function () {
    return h('div', { className: 'about-view' },
      h('h2', { className: 'page-title' }, 'About Project'),
      h('div', { className: 'card' }, h('h3', null, 'JobStack: ETL and EDA on job postings'),
        h('p', { className: 'sub', style: { fontSize: '.9rem', lineHeight: 1.6, marginTop: 12 } },
          'JobStack extracts job postings from two APIs and a Pakistan dataset, validates them with Pydantic, cleans and deduplicates them with pandas, extracts skills, loads the result into a SQL database and analyses it. This dashboard shows ' + D.total + ' validated postings.')),
      h('div', { className: 'grid' },
        card('Data sources', null, list(['Kaggle Pakistan jobs CSV: Dec 2019 to Mar 2021', 'Arbeitnow API: Oct 2026, Europe-wide, some postings in German', 'Remotive API: Sept to Oct 2026, remote jobs only'])),
        card('Known limitations', null, list(['Sources cover different periods, so compare them separately', 'Salary is almost entirely missing', 'On-site and hybrid are not recorded', 'About 60 of the 300 jobs are in European cities'])),
        card('Tech stack', null, list(['Python, pandas, Pydantic, pytest', 'SQLite and SQL views', 'React dashboard'])),
        card('Team', null, list(['Muniba', 'Imama', 'Wajiha Saleem', 'Ali Anns']))));
  };
})();
