import React from 'react';

export default function Sidebar({ currentView, onViewChange }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'explorer',
      label: 'Job Explorer',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      id: 'skills',
      label: 'Skills Intelligence',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <path d="m16 18 6-6-6-6" />
          <path d="m8 6-6 6 6 6" />
        </svg>
      ),
    },
    {
      id: 'location',
      label: 'Location Analysis',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      id: 'employment',
      label: 'Employment Analysis',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
    {
      id: 'quality',
      label: 'Data Quality',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
          <path d="M3 12a9 3 0 0 0 18 0" />
        </svg>
      ),
    },
    {
      id: 'about',
      label: 'About Project',
      icon: (
        <svg className="i" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <svg className="i" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <path d="M2 13h20" />
        </svg>
        <span>JobStack</span>
      </div>

      <nav aria-label="Dashboard">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className="nav-item"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onViewChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
