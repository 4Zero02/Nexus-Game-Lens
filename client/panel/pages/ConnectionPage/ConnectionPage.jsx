import React, { useState, useEffect } from 'react';
import './ConnectionPage.css';

const API_BASE = 'http://localhost:8765';

const gsiConfig = `[GSI Configuration]
uri="http://localhost:8765/gsi/cs2"
timeout="5.0"
buffer="0.1"
throttle="0.1"
heartbeat="10.0"
output
{
 "provider"               "1"
 "map"                    "1"
 "round"                  "1"
 "player_id"              "1"
 "player_state"           "1"
 "player_weapons"         "1"
 "player_match_stats"     "1"
 "allplayers_id"          "1"
 "allplayers_state"       "1"
 "allplayers_weapons"     "1"
 "allplayers_match_stats" "1"
 "allplayers_position"    "1"
 "bomb"                   "1"
 "grenades"               "1"
 "phase_countdowns"       "1"
}`;

const GAME_LABELS = { cs2: 'CS2', lol: 'League of Legends', valorant: 'Valorant' };

export default function ConnectionPage() {
  const [health, setHealth]   = useState(null);
  const [localIP, setLocalIP] = useState('...');
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(null);

  useEffect(() => {
    if (window.electronAPI?.getLocalIP) {
      window.electronAPI.getLocalIP().then(setLocalIP);
    }
  }, []);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res  = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        setHealth(data);
        setError(null);
      } catch {
        setHealth(null);
        setError('Cannot reach server on port 8765');
      }
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 3000);
    return () => clearInterval(id);
  }, []);

  const urls = {
    cs2:      `http://${localIP}:8765/output/cs2-hud`,
    lol:      `http://${localIP}:8765/output/lol-hud`,
    valorant: `http://${localIP}:8765/output/valorant-hud`,
  };

  function copyURL(key, text) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyGSI() {
    navigator.clipboard.writeText(gsiConfig);
    setCopied('gsi');
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="connection-page">
      <div className="page-header">
        <h2 className="page-title">Connection</h2>
        <p className="page-subtitle">Monitor game integrations and configure OBS Browser Sources.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Server + IP row */}
      <div className="status-row-card">
        <div className="status-row-item">
          <span className="status-row-label">Server</span>
          <div className="status-inline">
            <span className={`status-dot ${health ? 'connected' : 'disconnected'}`} />
            <span className="status-value">
              {health ? 'Running · port 8765' : 'Not running'}
            </span>
          </div>
        </div>
        <div className="status-row-divider" />
        <div className="status-row-item">
          <span className="status-row-label">Local IP</span>
          <span className="status-value mono">{localIP}</span>
        </div>
      </div>

      {/* Game integrations */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Game Integrations</span>
        </div>
        {health ? (
          <div className="games-grid">
            {Object.entries(health.games || {}).map(([game, info]) => {
              const active = info.connected && !info.stale;
              const stale  = info.connected && info.stale;
              return (
                <div key={game} className={`game-card ${active ? 'game-card--active' : ''}`}>
                  <div className="game-card-header">
                    <span className="game-tag">{game.toUpperCase()}</span>
                    <span className={`status-dot ${active ? 'connected' : 'disconnected'}`} />
                  </div>
                  <div className="game-card-label">{GAME_LABELS[game] || game}</div>
                  <div className={`game-card-status ${active ? 'active' : stale ? 'stale' : ''}`}>
                    {active ? 'Receiving data' : stale ? 'Stale — no recent data' : 'Not connected'}
                  </div>
                  {info.lastUpdate && (
                    <div className="game-card-time">
                      {new Date(info.lastUpdate).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted-text">Waiting for server…</p>
        )}
      </div>

      {/* OBS URLs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">OBS Browser Source URLs</span>
        </div>
        <div className="url-list">
          {Object.entries(urls).map(([game, url]) => (
            <div key={game} className="url-entry">
              <span className="url-game-tag">{game.toUpperCase()}</span>
              <div className="url-value">{url}</div>
              <button
                className={`copy-btn ${copied === game ? 'copied' : ''}`}
                onClick={() => copyURL(game, url)}
              >
                {copied === game ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
                {copied === game ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CS2 GSI setup */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">CS2 GSI Setup</span>
          <button
            className={`copy-btn ${copied === 'gsi' ? 'copied' : ''}`}
            onClick={copyGSI}
          >
            {copied === 'gsi' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
            {copied === 'gsi' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="gsi-help">
          Save as <code>gamestate_integration_ngl.cfg</code> in:<br />
          <code>Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/</code>
        </p>
        <pre className="code-block">{gsiConfig}</pre>
      </div>
    </div>
  );
}
