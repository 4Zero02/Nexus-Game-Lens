const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;

function setupTray(app, mainWindow) {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('NGL — Nexus Game Lens');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open NGL',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'CS2 HUD URL',
      enabled: false,
    },
    {
      label: 'http://localhost:8765/output/cs2-hud',
      click: () => {
        const { shell } = require('electron');
        shell.openExternal('http://localhost:8765/output/cs2-hud');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit NGL',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

module.exports = { setupTray };
