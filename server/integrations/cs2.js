/**
 * CS2 Integration
 * Receives GSI POST payloads, normalizes them, updates state, emits socket events.
 */

const { parseCS2Payload } = require('../gsi/cs2Parser');
const { updateGameState, getState } = require('../state');

// Track previous player states to detect kills
const prevPlayerStates = new Map();

/**
 * Detect kill events by comparing round_kills delta between ticks
 */
function detectKills(prevPlayers, nextPlayers, round) {
  const kills = [];
  if (!prevPlayers || !nextPlayers) return kills;

  // If round changed, reset tracking
  const prevMap = new Map(prevPlayers.map((p) => [p.steamid, p]));

  for (const player of nextPlayers) {
    const prev = prevMap.get(player.steamid);
    if (!prev) continue;

    if (player.round_kills > prev.round_kills) {
      kills.push({
        attacker: player.name,
        attacker_steamid: player.steamid,
        attacker_team: player.team,
        timestamp: Date.now(),
      });
    }
  }

  return kills;
}

function setup(app, io) {
  app.post('/gsi/cs2', (req, res) => {
    // CS2 GSI sends application/json or text/plain with JSON body
    let raw = req.body;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }

    if (!raw || typeof raw !== 'object') {
      return res.status(400).json({ error: 'Empty payload' });
    }

    const cs2State = getState('cs2');
    const teamConfig = cs2State.teamConfig;

    // Parse payload
    const normalized = parseCS2Payload(raw, teamConfig);

    // Detect kills
    const prevGamestate = cs2State.gamestate;
    const prevPlayers = prevGamestate ? prevGamestate.players : null;

    const kills = detectKills(prevPlayers, normalized.players, normalized.round);
    for (const kill of kills) {
      io.emit('cs2:kill', kill);
      cs2State.matchStats.kills.push(kill);
    }

    // Detect round end -> emit postgame data
    if (
      normalized.round.phase === 'over' &&
      prevGamestate &&
      prevGamestate.round.phase !== 'over'
    ) {
      const roundSummary = {
        round: normalized.map.round,
        win_team: normalized.round.win_team,
        ct_score: normalized.map.ct.score,
        t_score: normalized.map.t.score,
        timestamp: Date.now(),
      };
      cs2State.matchStats.rounds.push(roundSummary);

      // If match over, emit postgame
      if (normalized.map.phase === 'gameover') {
        io.emit('match:postgame', {
          map: normalized.map.name,
          ct: normalized.map.ct,
          t: normalized.map.t,
          rounds: cs2State.matchStats.rounds,
          kills: cs2State.matchStats.kills,
        });
        // Reset accumulated stats
        cs2State.matchStats = { rounds: [], kills: [] };
      }
    }

    // Update state
    updateGameState('cs2', normalized);

    // Emit full gamestate
    io.emit('cs2:gamestate', normalized);

    res.sendStatus(200);
  });
}

module.exports = { setup };
