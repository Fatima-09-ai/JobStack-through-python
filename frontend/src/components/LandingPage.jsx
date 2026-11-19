import React, { useEffect, useState } from 'react';

export default function LandingPage({ onEnter }) {
  const [leaving, setLeaving] = useState(false);

  const letters = 'JOBSTACK'.split('');

  const triggerLeave = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      onEnter();
    }, 950);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerLeave();
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      id="landing"
      className={`view ${leaving ? 'leave' : ''}`}
      onClick={triggerLeave}
      role="banner"
      style={{ cursor: 'crosshair' }}
    >
      <h1 className="title" aria-label="JOBSTACK">
        {letters.map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ animationDelay: `${0.2 + i * 0.12}s` }}
          >
            {ch}
          </span>
        ))}
      </h1>

      <div className="tag">
        <b>Job market intelligence</b>
      </div>

      <div className="skip">Click anywhere to enter</div>
    </main>
  );
}
