import React, { useState, useEffect } from 'react';
import './CS2HUDPage.css';

const API_BASE = 'http://localhost:8765';

const DEFAULT_CONFIG = {
  ct: { name: 'CT',  logo: '', color: '#38bdf8' },
  t:  { name: 'T',   logo: '', color: '#fb923c' },
};

function TeamCard({ side, data, onChange }) {
  const label = side === 'ct' ? 'CT Side' : 'T Side';

  return (
    <div className={`team-card team-card--${side}`} style={{ '--team-color': data.color }}>
      <div className="team-card-header">
        <span className="team-card-label">{label}</span>
        <span className="team-color-chip" style={{ background: data.color }} />
      </div>

      <div className="team-preview">
        {data.logo ? (
          <img
            src={data.logo}
            alt={`${data.name} logo`}
            className="team-logo-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="team-logo-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <div className="team-preview-info">
          <span className="team-preview-name" style={{ color: data.color }}>
            {data.name || (side === 'ct' ? 'CT' : 'T')}
          </span>
          <span className="team-preview-side">{label}</span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Team Name</label>
        <input
          className="form-input"
          type="text"
          value={data.name}
          onChange={(e) => onChange(side, 'name', e.target.value)}
          placeholder={side === 'ct' ? 'e.g. NAVI' : 'e.g. FaZe'}
          maxLength={32}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Logo URL</label>
        <input
          className="form-input"
          type="text"
          value={data.logo}
          onChange={(e) => onChange(side, 'logo', e.target.value)}
          placeholder="https://cdn.example.com/logo.png"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Team Color</label>
        <div className="color-row">
          <input
            className="form-input color-swatch-input"
            type="color"
            value={data.color}
            onChange={(e) => onChange(side, 'color', e.target.value)}
          />
          <input
            className="form-input color-hex-input"
            type="text"
            value={data.color}
            onChange={(e) => onChange(side, 'color', e.target.value)}
            placeholder="#38bdf8"
          />
        </div>
      </div>
    </div>
  );
}

export default function CS2HUDPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/config/cs2/teams`)
      .then((r) => r.json())
      .then((data) => { if (data?.ct && data?.t) setConfig(data); })
      .catch(() => {});
  }, []);

  function handleChange(side, field, value) {
    setConfig((prev) => ({ ...prev, [side]: { ...prev[side], [field]: value } }));
    setSaved(false);
  }

  async function handleApply() {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/config/cs2/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Server error');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError('Failed to apply: ' + e.message);
    }
  }

  return (
    <div className="cs2hud-page">
      <div className="page-header">
        <h2 className="page-title">CS2 HUD</h2>
        <p className="page-subtitle">Configure team names, logos, and colors for the live overlay.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {saved && <div className="alert alert-success">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Configuration applied to live overlay
      </div>}

      <div className="teams-grid">
        <TeamCard side="ct" data={config.ct} onChange={handleChange} />
        <TeamCard side="t"  data={config.t}  onChange={handleChange} />
      </div>

      <div className="apply-bar">
        <button className="btn btn-primary btn-apply" onClick={handleApply}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Apply to HUD
        </button>
        <span className="apply-hint">Changes reflect instantly on the live overlay</span>
      </div>

      <div className="card obs-card">
        <div className="card-header">
          <span className="card-title">OBS Browser Source</span>
          <span className="badge badge-neutral">1920 × 1080</span>
        </div>
        <div className="url-box">http://localhost:8765/output/cs2-hud</div>
        <p className="obs-hint">Enable "Shutdown source when not visible" for better performance.</p>
      </div>
    </div>
  );
}
