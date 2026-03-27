import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './CS2HUD.css';

// ─── Socket connection ───────────────────────────────────────────────────────
const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:8765`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function HPBar({ hp, maxHp = 100, color }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const barColor =
    hp > 60 ? '#4caf82' : hp > 30 ? '#f0a030' : '#f05050';
  return (
    <div className="hp-bar-wrap">
      <div
        className="hp-bar-fill"
        style={{ width: `${pct}%`, background: barColor }}
      />
      <span className="hp-bar-value">{hp}</span>
    </div>
  );
}

function ArmorIcon({ armor, helmet }) {
  if (!armor && !helmet) return null;
  return (
    <span className={`armor-icon${helmet ? ' helmet' : ''}`} title={`Armor: ${armor}${helmet ? ' + Helmet' : ''}`}>
      {helmet ? '⛑' : '🛡'}
    </span>
  );
}

function WeaponIcon({ weapon }) {
  // Strip "weapon_" prefix for SVG filename matching
  const name = weapon.name.replace('weapon_', '');
  const isActive = weapon.state === 'active';
  return (
    <span className={`weapon-slot${isActive ? ' active' : ''}`} title={name}>
      <img
        src={`/assets/cs2/weapons/${name}.svg`}
        alt={name}
        className="weapon-svg"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </span>
  );
}

function PlayerRow({ player, side, teamColor }) {
  const isDead = player.hp <= 0;
  const activeWeapon = player.weapons.find((w) => w.state === 'active');

  return (
    <div className={`player-row player-row--${side}${isDead ? ' dead' : ''}`}>
      {/* Slot number */}
      <div className="player-slot" style={{ color: teamColor }}>
        {player.observer_slot !== null ? player.observer_slot : '—'}
      </div>

      {/* Name */}
      <div className="player-name">{player.name}</div>

      {/* Active weapon */}
      <div className="player-weapon">
        {activeWeapon && !isDead && (
          <WeaponIcon weapon={activeWeapon} />
        )}
      </div>

      {/* Armor */}
      <div className="player-armor">
        {!isDead && <ArmorIcon armor={player.armor} helmet={player.helmet} />}
      </div>

      {/* Money */}
      <div className="player-money">
        {!isDead && <span className="money-val">${player.money.toLocaleString()}</span>}
      </div>

      {/* HP bar */}
      <div className="player-hp">
        {isDead ? (
          <span className="dead-label">DEAD</span>
        ) : (
          <HPBar hp={player.hp} color={teamColor} />
        )}
      </div>

      {/* K/D/A */}
      <div className="player-kda">
        <span className="kda-k">{player.match_stats.kills}</span>
        <span className="kda-sep">/</span>
        <span className="kda-d">{player.match_stats.deaths}</span>
        <span className="kda-sep">/</span>
        <span className="kda-a">{player.match_stats.assists}</span>
      </div>
    </div>
  );
}

function TeamPanel({ players, side, team }) {
  const sideLabel = side === 'ct' ? 'CT' : 'T';
  const teamPlayers = players
    .filter((p) => p.team === sideLabel)
    .sort((a, b) => {
      if (a.observer_slot !== null && b.observer_slot !== null)
        return a.observer_slot - b.observer_slot;
      return 0;
    });

  return (
    <div className={`team-panel team-panel--${side}`}>
      <div className="team-header" style={{ borderColor: team.color }}>
        {team.logo && (
          <img src={team.logo} alt={team.name} className="team-logo" />
        )}
        <span className="team-name" style={{ color: team.color }}>
          {team.name}
        </span>
        <span className="team-score" style={{ color: team.color }}>
          {team.score}
        </span>
      </div>
      <div className="team-players">
        {teamPlayers.map((p) => (
          <PlayerRow
            key={p.steamid}
            player={p}
            side={side}
            teamColor={team.color}
          />
        ))}
        {teamPlayers.length === 0 && (
          <div className="no-players">Waiting for players...</div>
        )}
      </div>
    </div>
  );
}

function Scoreboard({ map, round, phaseCountdowns }) {
  return (
    <div className="scoreboard">
      <div className="scoreboard-ct-score" style={{ color: map.ct.color }}>
        {map.ct.score}
      </div>
      <div className="scoreboard-center">
        <div className="scoreboard-map">{map.name.replace('de_', '').toUpperCase()}</div>
        <div className="scoreboard-round">
          ROUND {map.round + 1}
          {phaseCountdowns.phase && (
            <span className="scoreboard-phase"> · {phaseCountdowns.phase.replace('_', ' ').toUpperCase()}</span>
          )}
        </div>
        {phaseCountdowns.phase_ends_in !== null && (
          <div className="scoreboard-timer">
            {Math.ceil(phaseCountdowns.phase_ends_in)}s
          </div>
        )}
      </div>
      <div className="scoreboard-t-score" style={{ color: map.t.color }}>
        {map.t.score}
      </div>
    </div>
  );
}

function BombTimer({ bomb }) {
  if (!bomb) return null;
  const isPlanted = bomb.state === 'planted' || bomb.state === 'ticking';
  const isDefusing = bomb.state === 'defusing';
  const isExploded = bomb.state === 'exploded';
  const isDefused = bomb.state === 'defused';

  if (!isPlanted && !isDefusing && !isExploded && !isDefused) return null;

  return (
    <div className={`bomb-timer bomb-timer--${bomb.state}`}>
      {isPlanted && (
        <>
          <span className="bomb-icon">💣</span>
          <span className="bomb-countdown">{bomb.countdown ? bomb.countdown.toFixed(1) : '?'}s</span>
          <span className="bomb-label">BOMB PLANTED</span>
        </>
      )}
      {isDefusing && (
        <>
          <span className="bomb-icon">🔧</span>
          <span className="bomb-label">DEFUSING</span>
          {bomb.countdown && <span className="bomb-countdown">{bomb.countdown.toFixed(1)}s</span>}
        </>
      )}
      {isExploded && (
        <span className="bomb-label bomb-exploded">BOMB EXPLODED</span>
      )}
      {isDefused && (
        <span className="bomb-label bomb-defused">BOMB DEFUSED</span>
      )}
    </div>
  );
}

function KillFeed({ kills }) {
  return (
    <div className="kill-feed">
      {kills.slice(-5).reverse().map((kill, i) => (
        <div key={`${kill.timestamp}-${i}`} className={`kill-entry kill-entry--age-${i}`}>
          <span className="kill-attacker">{kill.attacker}</span>
          <span className="kill-verb">killed</span>
          {kill.victim && <span className="kill-victim">{kill.victim}</span>}
          {kill.weapon && (
            <span className="kill-weapon">
              <img
                src={`/assets/cs2/weapons/${kill.weapon.replace('weapon_', '')}.svg`}
                alt={kill.weapon}
                className="kill-weapon-svg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </span>
          )}
          {kill.headshot && <span className="kill-hs">HS</span>}
        </div>
      ))}
    </div>
  );
}

function RoundResult({ round }) {
  if (round.phase !== 'over' || !round.win_team) return null;
  return (
    <div className={`round-result round-result--${round.win_team.toLowerCase()}`}>
      <span className="round-result-label">
        {round.win_team === 'CT' ? 'CT WIN' : 'T WIN'}
      </span>
    </div>
  );
}

// ─── Main CS2HUD component ───────────────────────────────────────────────────
export default function CS2HUD() {
  const [gamestate, setGamestate] = useState(null);
  const [kills, setKills] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('cs2:gamestate', (state) => {
      setGamestate(state);
    });

    socket.on('cs2:kill', (kill) => {
      setKills((prev) => [...prev.slice(-19), kill]);
    });

    socket.on('cs2:teamconfig', (config) => {
      // Team config update — reflected via next gamestate
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!gamestate) {
    return (
      <div className="cs2-hud cs2-hud--waiting">
        {connected ? (
          <div className="waiting-msg">Waiting for CS2 game data...</div>
        ) : (
          <div className="waiting-msg">Connecting to NGL server...</div>
        )}
      </div>
    );
  }

  const { map, round, phase_countdowns, bomb, players } = gamestate;

  return (
    <div className="cs2-hud">
      {/* Scoreboard top bar */}
      <div className="hud-top">
        <Scoreboard
          map={map}
          round={round}
          phaseCountdowns={phase_countdowns}
        />
      </div>

      {/* Team panels */}
      <div className="hud-sides">
        <TeamPanel players={players} side="ct" team={map.ct} />
        <div className="hud-center-space" />
        <TeamPanel players={players} side="t" team={map.t} />
      </div>

      {/* Bomb timer */}
      <div className="hud-bomb">
        <BombTimer bomb={bomb} />
      </div>

      {/* Round result overlay */}
      <RoundResult round={round} />

      {/* Kill feed */}
      <KillFeed kills={kills} />
    </div>
  );
}
