import React from 'react';
import CS2HUD from './overlays/CS2HUD/CS2HUD.jsx';
import './OutputApp.css';

/**
 * OutputApp renders the correct overlay based on the URL path.
 * /output/cs2-hud    → CS2HUD
 * /output/lol-hud    → LoLHUD (placeholder)
 * /output/valorant-hud → ValorantHUD (placeholder)
 */
export default function OutputApp() {
  const path = window.location.pathname;

  if (path.includes('cs2')) {
    return <CS2HUD />;
  }

  if (path.includes('lol')) {
    return (
      <div className="overlay-placeholder">
        <span>LoL HUD — Coming Soon</span>
      </div>
    );
  }

  if (path.includes('valorant')) {
    return (
      <div className="overlay-placeholder">
        <span>Valorant HUD — Coming Soon</span>
      </div>
    );
  }

  return <CS2HUD />;
}
