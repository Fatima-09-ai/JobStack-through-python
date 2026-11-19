import React, { useState, useMemo } from 'react';
import { JOBS, BASE_DATA } from '../data/jobstackData.js';

const PER_PAGE = 12;

export default function JobExplorer({ onSelectJob }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((j) => {
      const matchLoc = !location || j.loc === location;
      const matchType = !jobType || j.type === jobType;
      const matchText =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q));
      return matchLoc && matchType && matchText;
    });
  }, [query, location, jobType]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedJobs = useMemo(() => {
    const start = (activePage - 1) * PER_PAGE;
    return filteredJobs.slice(start, start + PER_PAGE);
  }, [filteredJobs, activePage]);

  const handleReset = () => {
    setQuery('');
    setLocation('');
    setJobType('');
    setCurrentPage(1);
  };

  // Smart page numbers array
  const pageNumbers = useMemo(() => {
    const set = new Set();
    [1, totalPages, activePage - 1, activePage, activePage + 1].forEach((p) => {
      if (p >= 1 && p <= totalPages) set.add(p);
    });
    const sorted = Array.from(set).sort((a, b) => a - b);
    const out = [];
    let prev = 0;
    sorted.forEach((p) => {
      if (p - prev > 1) out.push('…');
      out.push(p);
      prev = p;
    });
    return out;
  }, [activePage, totalPages]);

  return (
    <div className="explorer-view">
      <h2 className="page-title">Job Explorer</h2>

      <div className="card toolbar">
        <div className="field">
          <label htmlFor="q">Search title, company or skill</label>
          <input
            id="q"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="e.g. Data Analyst, Nexa Labs, Python"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label htmlFor="loc">Location</label>
          <select
            id="loc"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All locations</option>
            {BASE_DATA.locations.map(([city, count]) => (
              <option key={city} value={city}>
                {city} ({count})
              </option>
            ))}
          </select>
        </div>

        <div
          className="wide chips"
          id="chips"
          role="group"
          aria-label="Employment type"
        >
          <button
            className="chip"
            aria-pressed={jobType === ''}
            onClick={() => {
              setJobType('');
              setCurrentPage(1);
            }}
          >
            All<em>{BASE_DATA.jobs}</em>
          </button>
          {BASE_DATA.types.map(([t, count]) => (
            <button
              key={t}
              className="chip"
              aria-pressed={jobType === t}
              onClick={() => {
                setJobType(t);
                setCurrentPage(1);
              }}
            >
              {t}<em>{count}</em>
            </button>
          ))}
          <button className="chip reset" onClick={handleReset}>
            Reset filters
          </button>
        </div>
      </div>

      <p className="count" aria-live="polite">
        Showing{' '}
        {filteredJobs.length ? (activePage - 1) * PER_PAGE + 1 : 0}–
        {(activePage - 1) * PER_PAGE + paginatedJobs.length} of{' '}
        {filteredJobs.length} jobs
      </p>

      <div className="jobs">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map((j) => (
            <button
              key={j.id}
              className="card job"
              onClick={() => onSelectJob(j)}
            >
              <h3>{j.title}</h3>
              <p className="co">{j.company}</p>
              <div>
                <span className="pill">{j.loc}</span>
                <span className="pill hot">{j.type}</span>
              </div>
              <p className="skl">{j.skills.slice(0, 4).join(' · ')}</p>
              <div className="foot">
                <span>{j.salary}</span>
                <span>{j.posted}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="card empty">
            <h3>No jobs found</h3>
            <p className="sub">
              Try a different keyword, title, company or filter combination.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button
            disabled={activePage === 1}
            onClick={() => setCurrentPage(activePage - 1)}
            aria-label="Previous page"
          >
            ←
          </button>
          {pageNumbers.map((p, idx) =>
            p === '…' ? (
              <span key={idx} className="gap">
                …
              </span>
            ) : (
              <button
                key={idx}
                aria-current={p === activePage ? 'page' : undefined}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            disabled={activePage === totalPages}
            onClick={() => setCurrentPage(activePage + 1)}
            aria-label="Next page"
          >
            →
          </button>
        </nav>
      )}
    </div>
  );
}
