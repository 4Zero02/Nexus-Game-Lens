import React from 'react';
import './TitleBar.css';

const IconMinus = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconSquare = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function TitleBar() {
  const minimize = () => window.electronAPI?.minimizeWindow();
  const maximize = () => window.electronAPI?.maximizeWindow();
  const close = () => window.electronAPI?.closeWindow();

  return (
    <div className="titlebar">
      <div className="titlebar-drag">
        <div className="titlebar-logo">N</div>
        <span className="titlebar-title">NGL — Nexus Game Lens</span>
      </div>
      <div className="titlebar-controls">
        <button className="wc-btn" onClick={minimize} title="Minimizar">
          <IconMinus />
        </button>
        <button className="wc-btn" onClick={maximize} title="Maximizar">
          <IconSquare />
        </button>
        <button className="wc-btn wc-close" onClick={close} title="Fechar">
          <IconX />
        </button>
      </div>
    </div>
  );
}
