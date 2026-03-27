/**
 * In-memory state for all HUD instances.
 * Holds current game state and operator-configured team data.
 */

const state = {
  cs2: {
    connected: false,
    lastUpdate: null,
    gamestate: null,
    teamConfig: {
      ct: { name: 'CT', logo: '', color: '#4fc3f7' },
      t: { name: 'T', logo: '', color: '#ffb74d' },
    },
    // Accumulated match stats for postgame
    matchStats: {
      rounds: [],
      kills: [],
    },
  },
  lol: {
    connected: false,
    lastUpdate: null,
    gamestate: null,
  },
  valorant: {
    connected: false,
    lastUpdate: null,
    gamestate: null,
  },
};

function getState(game) {
  return state[game];
}

function updateGameState(game, gamestate) {
  state[game].gamestate = gamestate;
  state[game].connected = true;
  state[game].lastUpdate = Date.now();
}

function setDisconnected(game) {
  state[game].connected = false;
}

function updateTeamConfig(game, teamConfig) {
  if (state[game] && state[game].teamConfig) {
    state[game].teamConfig = { ...state[game].teamConfig, ...teamConfig };
  }
}

function getHealthStatus() {
  const now = Date.now();
  const STALE_THRESHOLD = 10000; // 10 seconds

  return {
    cs2: {
      connected: state.cs2.connected,
      stale: state.cs2.lastUpdate ? now - state.cs2.lastUpdate > STALE_THRESHOLD : true,
      lastUpdate: state.cs2.lastUpdate,
    },
    lol: {
      connected: state.lol.connected,
      stale: state.lol.lastUpdate ? now - state.lol.lastUpdate > STALE_THRESHOLD : true,
      lastUpdate: state.lol.lastUpdate,
    },
    valorant: {
      connected: state.valorant.connected,
      stale: state.valorant.lastUpdate ? now - state.valorant.lastUpdate > STALE_THRESHOLD : true,
      lastUpdate: state.valorant.lastUpdate,
    },
  };
}

module.exports = {
  getState,
  updateGameState,
  setDisconnected,
  updateTeamConfig,
  getHealthStatus,
};
