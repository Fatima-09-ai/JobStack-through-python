import React from 'react';

export default function OrbitBackground({ isLanding = false }) {
  return (
    <div className={`orbit ${!isLanding ? 'in-dashboard' : ''}`} aria-hidden="true">
      <div className="arm a">
        <span className="dot"></span>
      </div>
      <div className="arm b">
        <span className="dot"></span>
      </div>
    </div>
  );
}
