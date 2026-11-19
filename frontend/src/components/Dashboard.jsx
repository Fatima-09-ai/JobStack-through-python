import React, { useState } from 'react';
import { BASE_DATA } from '../data/jobstackData.js';

export default function Dashboard() {
  const [activeSlice, setActiveSlice] = useState(null);

  const D = BASE_DATA;

  // Pie chart calculation
  const totalLoc = D.locations.reduce((acc, r) => acc + r[1], 0);
  const c = 90;
  const r = 86;
  let angle = -Math.PI / 2;

  const slices = D.locations.map((it, i) => {
    const nextAngle = angle + (it[1] / totalLoc) * Math.PI * 2;
    const x1 = c + r * Math.cos(angle);
    const y1 = c + r * Math.sin(angle);
    const x2 = c + r * Math.cos(nextAngle);
    const y2 = c + r * Math.sin(nextAngle);
    const midAngle = (angle + nextAngle) / 2;
    const dx = (Math.cos(midAngle) * 9).toFixed(1);
    const dy = (Math.sin(midAngle) * 9).toFixed(1);
    const largeArcFlag = nextAngle - angle > Math.PI ? 1 : 0;
    const pathD = `M${c} ${c}L${x1} ${y1}A${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}Z`;

    const sliceColor =
      i === 0 ? '#ff2d2d' : `hsl(0,0%,${7 + (i - 1) * 6}%)`;

    angle = nextAngle;

    return {
      index: i,
      label: it[0],
      count: it[1],
      pct: Math.round((it[1] / D.jobs) * 100),
      color: sliceColor,
      d: pathD,
      dx,
      dy,
    };
  });

  // Weekly Line Chart points
  const linePoints = D.weekly.map((n, i) => [
    14 + i * (292 / (D.weekly.length - 1)),
    120 - (n / 35) * 100,
  ]);
  const polylineStr = linePoints
    .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(' ');

  return (
    <div className="dashboard-view">
      <h2 className="page-title">Overview</h2>

      <div className="kpis">
        <div className="card kpi">
          <b>{D.jobs}</b>
          <span>Total jobs in the dataset</span>
        </div>
        <div className="card kpi">
          <b>{D.companies}</b>
          <span>Companies</span>
        </div>
        <div className="card kpi">
          <b>{D.locations.length}</b>
          <span>Locations</span>
        </div>
        <div className="card kpi">
          <b>{D.skills}</b>
          <span>Extracted skills</span>
        </div>
      </div>

      <div className="grid">
        {/* Jobs by location */}
        <div className="card">
          <h3>Jobs by location</h3>
          <p className="sub">Bigger slices are where most companies are hiring.</p>
          <div className="pie">
            <div className="pw">
              <svg viewBox="0 0 180 180" role="img" aria-label="Jobs by location">
                {slices.map((sl) => {
                  const isHovered = activeSlice === sl.index;
                  return (
                    <path
                      key={sl.index}
                      className={`slice ${isHovered ? 'on' : ''}`}
                      d={sl.d}
                      fill={sl.color}
                      stroke="#efede6"
                      strokeWidth="1.5"
                      style={{
                        transform: isHovered
                          ? `translate(${sl.dx}px, ${sl.dy}px)`
                          : 'none',
                        opacity:
                          activeSlice !== null && activeSlice !== sl.index
                            ? 0.35
                            : 1,
                        transition: 'transform .2s ease, opacity .2s ease',
                        cursor: 'crosshair',
                      }}
                      onMouseEnter={() => setActiveSlice(sl.index)}
                      onMouseLeave={() => setActiveSlice(null)}
                    >
                      <title>{`${sl.label}: ${sl.count} jobs`}</title>
                    </path>
                  );
                })}
              </svg>
              <div
                className={`pie-tip ${activeSlice !== null ? 'show' : ''}`}
                aria-live="polite"
              >
                {activeSlice !== null && (
                  <span>
                    {slices[activeSlice].label}: {slices[activeSlice].count} jobs (
                    {slices[activeSlice].pct}%)
                  </span>
                )}
              </div>
            </div>

            <ul className="legend">
              {slices.map((sl) => (
                <li
                  key={sl.index}
                  onMouseEnter={() => setActiveSlice(sl.index)}
                  onMouseLeave={() => setActiveSlice(null)}
                  style={{
                    background: activeSlice === sl.index ? '#0b0b0c' : undefined,
                    color: activeSlice === sl.index ? '#efede6' : undefined,
                  }}
                >
                  <span className="sw" style={{ background: sl.color }}></span>
                  {sl.label}
                  <em>{sl.count}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top skills */}
        <div className="card">
          <h3>Top skills</h3>
          <p className="sub">
            Jobs mentioning each skill, out of {D.skills} extracted skills.
          </p>
          {D.skillsTop.map(([name, count]) => (
            <div key={name} className="row">
              <span>{name}</span>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${(count / 150) * 100}%` }}
                ></div>
              </div>
              <i>{count}</i>
            </div>
          ))}
        </div>

        {/* Top hiring companies */}
        <div className="card">
          <h3>Top hiring companies</h3>
          <p className="sub">
            Open jobs per company, from {D.companies} companies.
          </p>
          {D.companyTop.map(([comp, count]) => (
            <div key={comp} className="row">
              <span>{comp}</span>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${(count / 24) * 100}%` }}
                ></div>
              </div>
              <i>{count}</i>
            </div>
          ))}
        </div>

        {/* Jobs posted per week */}
        <div className="card line">
          <h3>Jobs posted per week</h3>
          <p className="sub">300 jobs over 12 weeks.</p>
          <svg viewBox="0 0 320 150" role="img" aria-label="Jobs posted per week">
            <line x1="14" y1="120" x2="306" y2="120" stroke="currentColor" opacity=".3" />
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#0b0b0c"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {linePoints.map(([x, y], idx) => (
              <g key={idx} className="pt">
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="10" fill="transparent" />
                <circle
                  className="dt"
                  cx={x.toFixed(1)}
                  cy={y.toFixed(1)}
                  r="3.5"
                  fill="#ff2d2d"
                />
                <text
                  className="tip"
                  x={x.toFixed(1)}
                  y={(y - 11).toFixed(1)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                  fill="currentColor"
                >
                  {D.weekly[idx]}
                </text>
              </g>
            ))}
            <text
              x="14"
              y="140"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fill="currentColor"
            >
              Week 1
            </text>
            <text
              x="306"
              y="140"
              fontSize="10"
              textAnchor="end"
              fontFamily="JetBrains Mono, monospace"
              fill="currentColor"
            >
              Week 12
            </text>
          </svg>
        </div>

        {/* Jobs by type */}
        <div className="card">
          <h3>Jobs by type</h3>
          <p className="sub">Share of the 300 jobs.</p>
          {D.types.map(([type, count]) => (
            <div key={type} className="row">
              <span>{type}</span>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${(count / 200) * 100}%` }}
                ></div>
              </div>
              <i>{count}</i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
