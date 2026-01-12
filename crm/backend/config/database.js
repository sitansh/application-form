const mongoose = require('mongoose');
require('dotenv').config();

// Get logger instance (will be available after server.js initializes logger)
let logger = null;
const setLogger = (logInstance) => {
  logger = logInstance;
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.CRM_MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not configured. Set MONGODB_URI or CRM_MONGODB_URI in .env');
    }

    if (logger) {
      logger.info({
        component: 'crm-backend',
        service: 'database',
        event: 'database_connection_attempt',
        uri: uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : null,
        status: 'connecting'
      }, 'Attempting MongoDB connection');
    }
    
    await mongoose.connect(uri);
    
    const connection = mongoose.connection;
    const dbStatus = {
      readyState: connection.readyState,
      status: 'connected',
      dbName: connection.db ? connection.db.databaseName : null,
      host: connection.host || null,
      port: connection.port || null,
    };
    
    if (logger) {
      logger.info({
        component: 'crm-backend',
        service: 'database',
        event: 'database_connection_success',
        database: dbStatus
      }, 'MongoDB connected successfully');
    } else {
      console.log('MongoDB connected successfully');
    }

    // Log connection events
    connection.on('error', (err) => {
      if (logger) {
        logger.error({
          component: 'crm-backend',
          service: 'database',
          event: 'database_connection_error',
          error: err.message,
          database: {
            readyState: connection.readyState,
            status: 'error'
          }
        }, 'MongoDB connection error');
      } else {
        console.error('MongoDB connection error:', err);
      }
    });

    connection.on('disconnected', () => {
      if (logger) {
        logger.warn({
          component: 'crm-backend',
          service: 'database',
          event: 'database_disconnected',
          database: {
            readyState: connection.readyState,
            status: 'disconnected'
          }
        }, 'MongoDB disconnected');
      }
    });

    connection.on('reconnected', () => {
      if (logger) {
        logger.info({
          component: 'crm-backend',
          service: 'database',
          event: 'database_reconnected',
          database: {
            readyState: connection.readyState,
            status: 'connected',
            dbName: connection.db ? connection.db.databaseName : null
          }
        }, 'MongoDB reconnected');
      }
    });

  } catch (error) {
    if (logger) {
      logger.error({
        component: 'crm-backend',
        service: 'database',
        event: 'database_connection_failed',
        error: error.message,
        database: {
          status: 'failed'
        }
      }, 'MongoDB connection failed');
    } else {
      console.error('MongoDB connection error:', error);
    }
    process.exit(1);
  }
};

module.exports = { connectDB, setLogger };