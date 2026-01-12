const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB, setLogger } = require('./config/database');
const applicationsRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const pino = require('pino');
const pinoHttp = require('pino-http');
require('dotenv').config();

// ensure logs directory exists
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

// pino logger writing structured JSON to logs/crm.log
const logDest = pino.destination({ dest: './logs/crm.log', sync: false });
const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'crm-backend' } }, logDest);
const pinoMiddleware = pinoHttp({ logger });

const app = express();

// Set logger for database connection
setLogger(logger);

// Connect to MongoDB
connectDB();

// Middleware
app.use(pinoMiddleware);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// Protect application APIs with auth middleware
app.use('/api/auth', authRoutes);
app.use('/api/applications', authMiddleware, applicationsRoutes);

// Serve a minimal CRM static frontend if present
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('/crm', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
  app.get('/crm/*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// Health check route
app.get('/health', (req, res) => {
  req.log.info({ route: '/health' }, 'Health check');
  res.status(200).json({ status: 'OK', message: 'CRM server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Error handler');
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

// Export app for testing; only listen when running directly
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CRM server is running on port ${PORT}`);
  });
}