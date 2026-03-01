require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/diagnose', require('./routes/diagnose'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/safety-score', require('./routes/safety'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/history', require('./routes/history'));
app.use('/api/community', require('./routes/community'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/ai', require('./routes/ai'));

const path = require('path');

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // Health check for development
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AutoPulse API is running 🚗', timestamp: new Date().toISOString() });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n  🚗 AutoPulse API Server`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  🌐 Running on: http://localhost:${PORT}`);
  console.log(`  📡 Endpoints:`);
  console.log(`     POST /api/diagnose       — Fault detection`);
  console.log(`     POST /api/predict         — Predictive maintenance`);
  console.log(`     POST /api/safety-score    — Drive safety score`);
  console.log(`     POST /api/emergency       — Emergency SOS`);
  console.log(`     GET  /api/history         — Health timeline`);
  console.log(`     GET  /api/community/tips  — Expert tips`);
  console.log(`     POST /api/alerts/analyze  — Intelligent Multi-Factor Alerts`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━\n`);
});
