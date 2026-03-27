const { autoUpdater } = require('electron-updater');
const { ipcMain } = require('electron');

let mainWindow = null;

function setupAutoUpdater(win) {
  mainWindow = win;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update:available', {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update:not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update:download-progress', {
      percent: Math.round(progress.percent),
    });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update:downloaded');
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update:error', err?.message || 'Erro desconhecido');
  });

  ipcMain.on('update:start-download', () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on('update:install-now', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 5000);
}

module.exports = { setupAutoUpdater };
