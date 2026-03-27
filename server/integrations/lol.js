/**
 * League of Legends Integration
 * Polls localhost:2999 (Live Client Data API) every 1000ms
 */

const http = require('http');
const { updateGameState, setDisconnected } = require('../state');

const POLL_INTERVAL = 1000;
const LOL_API_HOST = '127.0.0.1';
const LOL_API_PORT = 2999;

function fetchLolData() {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {
        host: LOL_API_HOST,
        port: LOL_API_PORT,
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
            reject(new Error('Invalid JSON from LoL API'));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LoL API timeout'));
    });
  });
}

function normalizeLoLState(raw) {
  return {
    gameData: raw.gameData || {},
    activePlayer: raw.activePlayer || null,
    allPlayers: raw.allPlayers || [],
    events: raw.events || { Events: [] },
    scores: raw.gameData ? raw.gameData.gameMode : null,
  };
}

function setup(io) {
  let interval = null;

  function startPolling() {
    if (interval) return;
    interval = setInterval(async () => {
      try {
        const raw = await fetchLolData();
        const normalized = normalizeLoLState(raw);
        updateGameState('lol', normalized);
        io.emit('lol:gamestate', normalized);
      } catch {
        setDisconnected('lol');
      }
    }, POLL_INTERVAL);
  }

  startPolling();
}

module.exports = { setup };
