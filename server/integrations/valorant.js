/**
 * Valorant Integration
 * Polls localhost:2999 (Valorant Live Client Data) every 1000ms
 */

const http = require('http');
const { updateGameState, setDisconnected } = require('../state');

const POLL_INTERVAL = 1000;
const VAL_API_HOST = '127.0.0.1';
const VAL_API_PORT = 2999;

function fetchValorantData() {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {
        host: VAL_API_HOST,
        port: VAL_API_PORT,
        path: '/liveclientdata/allgamedata',
        timeout: 800,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON from Valorant API'));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Valorant API timeout'));
    });
  });
}

function normalizeValorantState(raw) {
  return {
    gameData: raw.gameData || {},
    activePlayer: raw.activePlayer || null,
    allPlayers: raw.allPlayers || [],
    events: raw.events || { Events: [] },
  };
}

function setup(io) {
  let interval = null;

  function startPolling() {
    if (interval) return;
    interval = setInterval(async () => {
      try {
        const raw = await fetchValorantData();
        const normalized = normalizeValorantState(raw);
        updateGameState('valorant', normalized);
        io.emit('valorant:gamestate', normalized);
      } catch {
        setDisconnected('valorant');
      }
    }, POLL_INTERVAL);
  }

  startPolling();
}

module.exports = { setup };
