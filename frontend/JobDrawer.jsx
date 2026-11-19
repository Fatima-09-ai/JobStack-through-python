import React, { useEffect } from 'react';
import { ROLES } from './jobstackData.js';

export default function JobDrawer({ job, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (job) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  const rolesData = typeof window !== 'undefined' && window.JobStackData ? window.JobStackData.ROLES : ROLES;
  const role = rolesData[job.r] || {
    a: 'Work with the engineering team to build impactful software.',
    r: [
      'Build features and maintain code quality',
      'Collaborate with product and cross-functional teams',
    ],
  };

  const reqs = [
    job.level === 'Intern'
      ? 'Currently enrolled in, or recently completed, a relevant degree'
      : `Experience: ${job.exp}`,
    `Hands-on knowledge of ${job.skills.slice(0, 3).join(', ')}`,
    'Strong problem-solving and teamwork skills',
    'Good written and spoken English',
  ];

  const padId = (n) => ('000' + n).slice(-3);

  return (
    <>
      <div
        className="overlay open"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="drawer open"
        role="dialog"
        aria-modal="true"
        aria-label="Job details"
      >
        <button
          className="close"
          onClick={onClose}
          aria-label="Close job details"
        >
          <svg className="i" viewBox="0 0 24 24">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <p className="d-id">JOB #{padId(job.id)}</p>
        <h2 className="d-title">{job.title}</h2>
        <p className="d-co">
          {job.company} · {job.loc}
        </p>

        <div className="facts">
          <div className="fact">
            <span>Salary</span>
            <b>{job.salary}</b>
          </div>
          <div className="fact">
            <span>Employment type</span>
            <b>{job.type}</b>
          </div>
          <div className="fact">
            <span>Experience</span>
            <b>{job.exp}</b>
          </div>
          <div className="fact">
            <span>Posted</span>
            <b>{job.posted}</b>
          </div>
        </div>

        <h4>About the role</h4>
        <p className="d-p">
          {job.company} is hiring a {job.title}{' '}
          {job.loc === 'Remote'
            ? 'to work remotely with a distributed team. '
            : `for its ${job.loc} team. `}
          {role.a}
        </p>

        <h4>Responsibilities</h4>
        <ul>
          {role.r.map((resp, idx) => (
            <li key={idx}>{resp}</li>
          ))}
        </ul>

        <h4>Requirements</h4>
        <ul>
          {reqs.map((req, idx) => (
            <li key={idx}>{req}</li>
          ))}
        </ul>

        <h4>Skills</h4>
        <div style={{ marginTop: '8px' }}>
          {job.skills.map((skill, idx) => (
            <span key={idx} className="pill">
              {skill}
            </span>
          ))}
        </div>

        <h4>Benefits</h4>
        <ul>
          {job.benefits.map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}

if (typeof window !== 'undefined') {
  window.JobDrawer = JobDrawer;
}
