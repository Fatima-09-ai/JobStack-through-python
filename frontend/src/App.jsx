import React, { useState } from 'react';
import OrbitBackground from './components/OrbitBackground.jsx';
import LandingPage from './components/LandingPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import JobExplorer from './components/JobExplorer.jsx';
import SkillsIntelligence from './components/SkillsIntelligence.jsx';
import JobDrawer from './components/JobDrawer.jsx';
import {
  LocationAnalysis,
  EmploymentAnalysis,
  DataQuality,
  AboutProject,
} from './components/OtherViews.jsx';

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

  return (
    <div className={`jobstack-app ${hasEntered ? 'in' : ''}`}>
      {/* Background Orbit Ring */}
      <OrbitBackground isLanding={!hasEntered} />

      {/* Animated Landing Page */}
      {!hasEntered && (
        <LandingPage onEnter={() => setHasEntered(true)} />
      )}

      {/* Main Dashboard Application */}
      <div id="dashboard" className="view" style={{ opacity: hasEntered ? 1 : 0 }}>
        <Sidebar
          currentView={currentView}
          onViewChange={(viewId) => {
            setCurrentView(viewId);
            setSelectedJob(null);
          }}
        />

        <section className="content" id="content" aria-label={currentView}>
          {currentView === 'overview' && <Dashboard />}
          {currentView === 'explorer' && (
            <JobExplorer onSelectJob={handleSelectJob} />
          )}
          {currentView === 'skills' && (
            <SkillsIntelligence onSelectJob={handleSelectJob} />
          )}
          {currentView === 'location' && <LocationAnalysis />}
          {currentView === 'employment' && <EmploymentAnalysis />}
          {currentView === 'quality' && <DataQuality />}
          {currentView === 'about' && <AboutProject />}
        </section>
      </div>

      {/* Slide-out Job Details Modal Drawer */}
      <JobDrawer job={selectedJob} onClose={handleCloseDrawer} />
    </div>
  );
}
