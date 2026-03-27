import React, { useState, useEffect } from 'react';
import './UpdateBanner.css';

export default function UpdateBanner() {
  const [state, setState] = useState('idle');
  const [info, setInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onUpdateAvailable) return;

    api.onUpdateAvailable((updateInfo) => {
      setInfo(updateInfo);
      setState('available');
      setDismissed(false);
    });

    api.onUpdateDownloadProgress(({ percent }) => {
      setState('downloading');
      setProgress(percent);
    });

    api.onUpdateDownloaded(() => {
      setState('ready');
    });

    api.onUpdateError(() => {
      setState('error');
    });
  }, []);

  if (dismissed || state === 'idle') return null;

  const handleDownload = () => {
    window.electronAPI.startUpdateDownload();
    setState('downloading');
    setProgress(0);
  };

  const handleInstall = () => {
    window.electronAPI.installUpdateNow();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className={`update-banner update-banner--${state}`}>
      {state === 'available' && (
        <>
          <span className="update-banner__text">
            NGL <strong>v{info?.version}</strong> disponível
          </span>
          <div className="update-banner__actions">
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              Atualizar
            </button>
            <button className="update-banner__dismiss" onClick={handleDismiss}>
              Ignorar
            </button>
          </div>
        </>
      )}
      {state === 'downloading' && (
        <>
          <span className="update-banner__text">Baixando atualização...</span>
          <div className="update-banner__progress-track">
            <div className="update-banner__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="update-banner__percent">{progress}%</span>
        </>
      )}
      {state === 'ready' && (
        <>
          <span className="update-banner__text">Atualização pronta. Reinicie para aplicar.</span>
          <div className="update-banner__actions">
            <button className="btn btn-primary btn-sm" onClick={handleInstall}>
              Reiniciar agora
            </button>
            <button className="update-banner__dismiss" onClick={handleDismiss}>
              Depois
            </button>
          </div>
        </>
      )}
      {state === 'error' && (
        <>
          <span className="update-banner__text">Falha ao verificar atualização</span>
          <button className="update-banner__dismiss" onClick={handleDismiss}>Fechar</button>
        </>
      )}
    </div>
  );
}
