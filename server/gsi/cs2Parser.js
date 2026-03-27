/**
 * CS2 GSI Payload Parser
 * Normalizes the raw CS2 Game State Integration JSON into a clean state object.
 */

/**
 * Normalize a single player object from allplayers or player
 */
function normalizePlayer(steamid, raw) {
  const weapons = raw.weapons ? normalizeWeapons(raw.weapons) : [];
  const state = raw.state || {};
  const matchStats = raw.match_stats || {};

  return {
    steamid,
    name: raw.name || '',
    observer_slot: raw.observer_slot !== undefined ? raw.observer_slot : null,
    team: raw.team || null,
    activity: raw.activity || null,
    hp: state.health !== undefined ? state.health : 100,
    armor: state.armor !== undefined ? state.armor : 0,
    helmet: state.helmet || false,
    flashed: state.flashed || 0,
    smoked: state.smoked || 0,
    burning: state.burning || 0,
    money: state.money !== undefined ? state.money : 0,
    round_kills: state.round_kills || 0,
    round_killhs: state.round_killhs || 0,
    equip_value: state.equip_value !== undefined ? state.equip_value : 0,
    defusekit: state.defusekit || false,
    match_stats: {
      kills: matchStats.kills || 0,
      assists: matchStats.assists || 0,
      deaths: matchStats.deaths || 0,
      mvps: matchStats.mvps || 0,
      score: matchStats.score || 0,
    },
    weapons,
    position: raw.position ? parsePosition(raw.position) : null,
    forward: raw.forward ? parsePosition(raw.forward) : null,
  };
}

/**
 * Parse "x, y, z" string into { x, y, z }
 */
function parsePosition(posStr) {
  if (!posStr) return null;
  const parts = posStr.split(',').map((v) => parseFloat(v.trim()));
  if (parts.length < 2) return null;
  return { x: parts[0], y: parts[1], z: parts[2] || 0 };
}

/**
 * Normalize weapons object into array, picking the active weapon
 */
function normalizeWeapons(weaponsObj) {
  if (!weaponsObj) return [];
  return Object.values(weaponsObj).map((w) => ({
    name: w.name || '',
    paintkit: w.paintkit || 'default',
    type: w.type || '',
    ammo_clip: w.ammo_clip !== undefined ? w.ammo_clip : null,
    ammo_clip_max: w.ammo_clip_max !== undefined ? w.ammo_clip_max : null,
    ammo_reserve: w.ammo_reserve !== undefined ? w.ammo_reserve : null,
    state: w.state || 'holstered', // 'active', 'holstered', 'reloading'
  }));
}

/**
 * Main parser: takes raw GSI payload, returns normalized state
 * Also merges team config (names, logos, colors) from operator settings
 */
function parseCS2Payload(raw, teamConfig = {}) {
  const map = raw.map || {};
  const round = raw.round || {};
  const bomb = raw.bomb || null;
  const allplayers = raw.allplayers || {};
  const player = raw.player || {};
  const phaseCountdowns = raw.phase_countdowns || {};

  // Normalize all players
  const players = Object.entries(allplayers).map(([steamid, p]) =>
    normalizePlayer(steamid, p)
  );

  // Sort by observer_slot if available
  players.sort((a, b) => {
    if (a.observer_slot !== null && b.observer_slot !== null) {
      return a.observer_slot - b.observer_slot;
    }
    return 0;
  });

  // Currently spectated player
  const spectating = player.steamid
    ? normalizePlayer(player.steamid, player)
    : players.find((p) => p.activity === 'playing') || null;

  // Team data from map payload
  const teamCT = map.team_ct || {};
  const teamT = map.team_t || {};

  const ctConfig = (teamConfig && teamConfig.ct) || {};
  const tConfig = (teamConfig && teamConfig.t) || {};

  return {
    map: {
      name: map.name || '',
      phase: map.phase || '',
      round: map.round !== undefined ? map.round : 0,
      mode: map.mode || '',
      ct: {
        score: teamCT.score || 0,
        timeouts_remaining: teamCT.timeouts_remaining,
        consecutive_round_losses: teamCT.consecutive_round_losses,
        name: ctConfig.name || teamCT.name || 'CT',
        logo: ctConfig.logo || '',
        color: ctConfig.color || '#4fc3f7',
      },
      t: {
        score: teamT.score || 0,
        timeouts_remaining: teamT.timeouts_remaining,
        consecutive_round_losses: teamT.consecutive_round_losses,
        name: tConfig.name || teamT.name || 'T',
        logo: tConfig.logo || '',
        color: tConfig.color || '#ffb74d',
      },
    },
    round: {
      phase: round.phase || '',
      win_team: round.win_team || null,
      bomb: round.bomb || null,
    },
    phase_countdowns: {
      phase: phaseCountdowns.phase || '',
      phase_ends_in: phaseCountdowns.phase_ends_in
        ? parseFloat(phaseCountdowns.phase_ends_in)
        : null,
    },
    bomb: bomb
      ? {
          state: bomb.state || '',
          position: bomb.position ? parsePosition(bomb.position) : null,
          player: bomb.player || null,
          countdown: bomb.countdown ? parseFloat(bomb.countdown) : null,
        }
      : null,
    players,
    spectating,
    provider: raw.provider || null,
  };
}

module.exports = { parseCS2Payload, normalizePlayer, normalizeWeapons };
