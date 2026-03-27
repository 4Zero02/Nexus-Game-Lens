const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { getHealthStatus } = require('./state');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 8765;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve built output overlays (for OBS Browser Source)
const outputDist = path.join(__dirname, '..', 'dist', 'output');
app.use('/output/assets', express.static(path.join(outputDist, 'assets')));

app.get('/output/cs2-hud', (req, res) => {
  res.sendFile(path.join(outputDist, 'index.html'));
});

app.get('/output/lol-hud', (req, res) => {
  res.sendFile(path.join(outputDist, 'index.html'));
});

app.get('/output/valorant-hud', (req, res) => {
  res.sendFile(path.join(outputDist, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', games: getHealthStatus() });
});

// Load integrations (pass io instance)
const cs2Integration = require('./integrations/cs2');
const lolIntegration = require('./integrations/lol');
const valorantIntegration = require('./integrations/valorant');

cs2Integration.setup(app, io);
lolIntegration.setup(io);
valorantIntegration.setup(io);

// Team config endpoint
const { updateTeamConfig, getState } = require('./state');

app.post('/config/cs2/teams', (req, res) => {
  const { ct, t } = req.body;
  updateTeamConfig('cs2', { ct, t });
  io.emit('cs2:teamconfig', getState('cs2').teamConfig);
  res.json({ ok: true, teamConfig: getState('cs2').teamConfig });
});

app.get('/config/cs2/teams', (req, res) => {
  res.json(getState('cs2').teamConfig);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[NGL] Server running on http://0.0.0.0:${PORT}`);
});

module.exports = { app, io, server };
