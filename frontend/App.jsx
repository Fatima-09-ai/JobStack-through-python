import React, { useState } from 'react';
import OrbitBackground from './OrbitBackground.jsx';
import LandingPage from './LandingPage.jsx';
import Sidebar from './Sidebar.jsx';
import Dashboard from './Dashboard.jsx';
import JobExplorer from './JobExplorer.jsx';
import SkillsIntelligence from './SkillsIntelligence.jsx';
import JobDrawer from './JobDrawer.jsx';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [selectedJob, setSelectedJob] = useState(null);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const handleCloseDrawer = () => {
    setSelectedJob(null);
  };

  const OrbitComp = typeof window !== 'undefined' && window.OrbitBackground ? window.OrbitBackground : OrbitBackground;
  const LandingComp = typeof window !== 'undefined' && window.LandingPage ? window.LandingPage : LandingPage;
  const SidebarComp = typeof window !== 'undefined' && window.Sidebar ? window.Sidebar : Sidebar;
  const DashboardComp = typeof window !== 'undefined' && window.Dashboard ? window.Dashboard : Dashboard;
  const JobExplorerComp = typeof window !== 'undefined' && window.JobExplorer ? window.JobExplorer : JobExplorer;
  const SkillsComp = typeof window !== 'undefined' && window.SkillsIntelligence ? window.SkillsIntelligence : SkillsIntelligence;
  const JobDrawerComp = typeof window !== 'undefined' && window.JobDrawer ? window.JobDrawer : JobDrawer;

  return (
    <div className={`jobstack-app ${hasEntered ? 'in' : ''}`}>
      {/* Background Orbit Ring */}
      <OrbitComp isLanding={!hasEntered} />

      {/* Animated Landing Page */}
      {!hasEntered && (
        <LandingComp onEnter={() => setHasEntered(true)} />
      )}

      {/* Main Dashboard Application */}
      <div id="dashboard" className="view" style={{ opacity: hasEntered ? 1 : 0 }}>
        <SidebarComp
          currentView={currentView}
          onViewChange={(viewId) => {
            setCurrentView(viewId);
            setSelectedJob(null);
          }}
        />

        <section className="content" id="content" aria-label={currentView}>
          {currentView === 'overview' && <DashboardComp />}
          {currentView === 'explorer' && (
            <JobExplorerComp onSelectJob={handleSelectJob} />
          )}
          {currentView === 'skills' && (
            <SkillsComp onSelectJob={handleSelectJob} />
          )}
          {currentView === 'location' && (
            <div className="location-view">
              <h2 className="page-title">Location Analysis</h2>
              <div className="card">
                <h3>Postings by Metropolitan Region</h3>
                <p className="sub">
                  Geographical concentration across Pakistan tech hubs and remote jobs.
                </p>
                <div style={{ marginTop: '16px' }}>
                  {[
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
                  ].map(([city, count]) => (
                    <div key={city} className="row">
                      <span style={{ fontWeight: 'bold' }}>{city}</span>
                      <div className="track">
                        <div
                          className="fill"
                          style={{ width: `${(count / 62) * 100}%` }}
                        ></div>
                      </div>
                      <i>{count}</i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentView === 'employment' && (
            <div className="employment-view">
              <h2 className="page-title">Employment Analysis</h2>
              <div className="card">
                <h3>Contract & Employment Modalities</h3>
                <p className="sub">
                  Distribution of work arrangements across 300 job opportunities.
                </p>
                <div style={{ marginTop: '16px' }}>
                  {[
                    ['Full-time', 198],
                    ['Contract', 52],
                    ['Internship', 30],
                    ['Part-time', 20],
                  ].map(([t, count]) => (
                    <div key={t} className="row">
                      <span style={{ fontWeight: 'bold' }}>{t}</span>
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
          )}
          {currentView === 'quality' && (
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
          )}
          {currentView === 'about' && (
            <div className="about-view">
              <h2 className="page-title">About JobStack</h2>
              <div className="card">
                <h3>The JobStack Intelligence Platform</h3>
                <p
                  className="sub"
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    marginTop: '12px',
                  }}
                >
                  JobStack is an end-to-end data engineering and market intelligence system designed to track,
                  clean, validate, and analyze tech employment demand in Pakistan. Built with Python pipelines,
                  canonical skill normalization, and a reactive brutalist analytics interface.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Slide-out Job Details Modal Drawer */}
      <JobDrawerComp job={selectedJob} onClose={handleCloseDrawer} />
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.App = App;
}
