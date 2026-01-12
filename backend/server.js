const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB, setLogger } = require('./config/database');
const applicationRoutes = require('./routes/applicationRoutes');
const pino = require('pino');
const pinoHttp = require('pino-http');
const metrics = require('./metrics');
const { requestLogger } = require('./utils/logging');
require('dotenv').config();

// ensure logs directory exists
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

// pino logger writing structured JSON to logs/backend.log
const logDest = pino.destination({ dest: './logs/backend.log', sync: false });
const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'application-fullstack' } }, logDest);
const pinoMiddleware = pinoHttp({ logger });

const app = express();

// Set logger for database connection
setLogger(logger);

// Connect to MongoDB
connectDB();

// Middleware
app.use(pinoMiddleware);

// In test mode, capture logs into app.locals.capturedLogs for assertions
if (process.env.NODE_ENV === 'test') {
  app.locals.capturedLogs = [];
  app.use((req, res, next) => {
    const originalLog = req.log;
    req.log = {
      info: (obj, msg) => {
        app.locals.capturedLogs.push({ level: 'info', obj, msg });
        if (originalLog && originalLog.info) originalLog.info(obj, msg);
      },
      error: (obj, msg) => {
        app.locals.capturedLogs.push({ level: 'error', obj, msg });
        if (originalLog && originalLog.error) originalLog.error(obj, msg);
      }
    };
    next();
  });
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api', applicationRoutes);

// Health check route
app.get('/health', (req, res) => {
  req.log.info({ route: '/health' }, 'Health check');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.client.register.contentType);
    res.send(await metrics.client.register.metrics());
  } catch (err) {
    req.log.error({ err }, 'Failed to gather metrics');
    res.status(500).send(err.message);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Export app for testing; only listen when running directly
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
