import React from 'react';
import { BASE_DATA } from '../data/jobstackData.js';

export function LocationAnalysis() {
  const locs = BASE_DATA.locations;
  const max = locs[0][1];

  return (
    <div className="location-view">
      <h2 className="page-title">Location Analysis</h2>
      <div className="card">
        <h3>Postings by Metropolitan Region</h3>
        <p className="sub">Geographical concentration across Pakistan tech hubs and remote jobs.</p>
        <div style={{ marginTop: '16px' }}>
          {locs.map(([city, count]) => (
            <div key={city} className="row">
              <span style={{ fontWeight: 'bold' }}>{city}</span>
              <div className="track">
                <div className="fill" style={{ width: `${(count / max) * 100}%` }}></div>
              </div>
              <i>{count}</i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmploymentAnalysis() {
  const types = BASE_DATA.types;

  return (
    <div className="employment-view">
      <h2 className="page-title">Employment Analysis</h2>
      <div className="card">
        <h3>Contract & Employment Modalities</h3>
        <p className="sub">Distribution of work arrangements across 300 job opportunities.</p>
        <div style={{ marginTop: '16px' }}>
          {types.map(([t, count]) => (
            <div key={t} className="row">
              <span style={{ fontWeight: 'bold' }}>{t}</span>
              <div className="track">
                <div className="fill" style={{ width: `${(count / 200) * 100}%` }}></div>
              </div>
              <i>{count}</i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DataQuality() {
  return (
    <div className="quality-view">
      <h2 className="page-title">Data Quality</h2>
      <div className="grid">
        <div className="card kpi">
          <b>100%</b>
          <span>Schema Validation Pass Rate</span>
        </div>
        <div className="card kpi">
          <b>0%</b>
          <span>Missing Title / Company Rate</span>
        </div>
        <div className="card kpi">
          <b>300</b>
          <span>Deduplicated Validated Records</span>
        </div>
        <div className="card kpi">
          <b>36</b>
          <span>Standardized Extracted Skills</span>
        </div>
      </div>
    </div>
  );
}

export function AboutProject() {
  return (
    <div className="about-view">
      <h2 className="page-title">About JobStack</h2>
      <div className="card">
        <h3>The JobStack Intelligence Platform</h3>
        <p className="sub" style={{ fontSize: '0.9rem', lineHeight: '1.6', marginTop: '12px' }}>
          JobStack is an end-to-end data engineering and market intelligence system designed to track,
          clean, validate, and analyze tech employment demand in Pakistan. Built with Python pipelines,
          canonical skill normalization, and a reactive brutalist analytics interface.
        </p>
      </div>
    </div>
  );
}
