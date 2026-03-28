import React, { useState } from 'react';
import ConnectionPage from './pages/ConnectionPage/ConnectionPage.jsx';
import CS2HUDPage from './pages/CS2HUDPage/CS2HUDPage.jsx';
import LoLHUDPage from './pages/LoLHUDPage/LoLHUDPage.jsx';
import ValorantHUDPage from './pages/ValorantHUDPage/ValorantHUDPage.jsx';
import TitleBar from './components/TitleBar.jsx';
import './PanelApp.css';

const IconConnection = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const IconCS2 = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
  </svg>
);

const IconLoL = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconValorant = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 21 2 21"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
  </svg>
);

const TABS = [
  { id: 'connection', label: 'Connection',   Icon: IconConnection, section: 'OVERVIEW' },
  { id: 'cs2',        label: 'CS2 HUD',      Icon: IconCS2,        section: 'HUD SETUP' },
  { id: 'lol',        label: 'LoL HUD',      Icon: IconLoL,        section: null },
  { id: 'valorant',   label: 'Valorant HUD', Icon: IconValorant,   section: null },
];

export default function PanelApp() {
  const [activeTab, setActiveTab] = useState('connection');

  return (
    <div className="panel-app">
      <TitleBar />
      <div className="panel-body">
      <aside className="panel-sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">N</div>
          <div className="logo-text">
            <span className="logo-nexus">NEXUS</span>
            <span className="logo-sub">GAME LENS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <React.Fragment key={tab.id}>
              {tab.section && (
                <div className="nav-section-label">{tab.section}</div>
              )}
              <button
                className={`nav-item${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon"><tab.Icon /></span>
                <span>{tab.label}</span>
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-dot" />
          <span className="version-text">NGL v1.0.0</span>
        </div>
      </aside>

      <main className="panel-content">
        {activeTab === 'connection' && <ConnectionPage />}
        {activeTab === 'cs2'        && <CS2HUDPage />}
        {activeTab === 'lol'        && <LoLHUDPage />}
        {activeTab === 'valorant'   && <ValorantHUDPage />}
      </main>
      </div>
    </div>
  );
}
