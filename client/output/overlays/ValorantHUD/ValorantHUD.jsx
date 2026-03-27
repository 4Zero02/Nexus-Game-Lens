import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:8765`;

export default function ValorantHUD() {
  const [gamestate, setGamestate] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('valorant:gamestate', setGamestate);
    return () => socket.disconnect();
  }, []);

  if (!gamestate) return null;
  return <div style={{ color: '#fff', padding: 8, fontSize: 12 }}>Valorant HUD Active</div>;
}
