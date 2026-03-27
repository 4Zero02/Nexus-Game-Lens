const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalIP: () => ipcRenderer.invoke('get-local-ip'),

  onUpdateAvailable: (cb) => ipcRenderer.on('update:available', (_e, info) => cb(info)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update:not-available', () => cb()),
  onUpdateDownloadProgress: (cb) => ipcRenderer.on('update:download-progress', (_e, progress) => cb(progress)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update:downloaded', () => cb()),
  onUpdateError: (cb) => ipcRenderer.on('update:error', (_e, msg) => cb(msg)),
  startUpdateDownload: () => ipcRenderer.send('update:start-download'),
  installUpdateNow: () => ipcRenderer.send('update:install-now'),
});
