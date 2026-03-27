import React from 'react';
import './ValorantHUDPage.css';

export default function ValorantHUDPage() {
  return (
    <div className="valorant-page">
      <div className="page-header">
        <h2 className="page-title">Valorant HUD</h2>
        <p className="page-subtitle">Real-time overlay powered by the Live Client Data API.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Integration</span>
          <span className="badge badge-neutral">Auto-detect</span>
        </div>
        <p className="integration-text">
          NGL polls the Live Client Data API at{' '}
          <code className="inline-code">localhost:2999</code> every second while
          Valorant is running. No manual setup required.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">OBS Browser Source</span>
          <span className="badge badge-neutral">1920 × 1080</span>
        </div>
        <div className="url-box">http://localhost:8765/output/valorant-hud</div>
        <p className="obs-hint">Enable "Shutdown source when not visible" for better performance.</p>
      </div>

      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <div className="coming-soon-title">Team configuration coming soon</div>
          <div className="coming-soon-sub">Custom team names, logos, and colors will be available in a future update.</div>
        </div>
      </div>
    </div>
  );
}
