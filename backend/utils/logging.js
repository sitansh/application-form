const sanitizeKeys = ['ssn', 'socialsecuritynumber', 'ssnlast4', 'creditcard', 'cardnumber', 'cvv', 'password', 'dob'];

function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  if (Array.isArray(payload)) {
    return payload.map(sanitizePayload);
  }

  const clone = { ...payload };

  Object.keys(clone).forEach((key) => {
    const lower = key.toLowerCase();
    if (sanitizeKeys.includes(lower) || sanitizeKeys.some(k => lower.includes(k))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitizePayload(clone[key]);
    }
  });

  return clone;
}

function extractFrontendDetails(req) {
  return {
    origin: req.get('origin') || null,
    referer: req.get('referer') || null,
    userAgent: req.get('user-agent') || null,
    acceptLanguage: req.get('accept-language') || null,
    acceptEncoding: req.get('accept-encoding') || null,
    host: req.get('host') || null,
    forwardedFor: req.get('x-forwarded-for') || null,
    forwardedHost: req.get('x-forwarded-host') || null,
    forwardedProto: req.get('x-forwarded-proto') || null,
    forwardedPort: req.get('x-forwarded-port') || null,
  };
}

function getDatabaseStatus() {
  const mongoose = require('mongoose');
  const connection = mongoose.connection;
  return {
    readyState: connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    status: connection.readyState === 1 ? 'connected' : 
            connection.readyState === 2 ? 'connecting' : 
            connection.readyState === 3 ? 'disconnecting' : 'disconnected',
    dbName: connection.db ? connection.db.databaseName : null,
    host: connection.host || null,
    port: connection.port || null,
  };
}

function requestLogger(req, res, next) {
  const start = Date.now();
  const method = req.method;
  const route = req.originalUrl || req.url;
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost';
  const endpoint = `${protocol}://${host}${route}`;
  
  // Capture payload - GET/DELETE use query params, POST/PUT/PATCH use body
  let payload = {};
  if (method === 'GET' || method === 'DELETE') {
    payload = Object.keys(req.query).length > 0 ? req.query : null;
  } else {
    payload = req.body && Object.keys(req.body).length > 0 ? req.body : null;
  }
  
  const frontendDetails = extractFrontendDetails(req);
  const dbStatus = getDatabaseStatus();

  // Log incoming request with comprehensive details
  req.log.info({ 
    component: 'backend',
    endpoint,
    route,
    method,
    payload: payload ? sanitizePayload(payload) : null,
    frontend: frontendDetails,
    database: dbStatus
  }, 'Incoming request');

  // Log completion when response finishes
  res.on('finish', () => {
    const duration_ms = Date.now() - start;
    const applicationStatus = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 
                             res.statusCode >= 400 && res.statusCode < 500 ? 'client_error' : 
                             res.statusCode >= 500 ? 'server_error' : 'unknown';
    
    // Re-capture payload for completion log (body might have been modified)
    let finalPayload = payload;
    if (method !== 'GET' && method !== 'DELETE') {
      finalPayload = req.body && Object.keys(req.body).length > 0 ? req.body : null;
    }
    
    req.log.info({ 
      component: 'backend',
      endpoint,
      route,
      method,
      statusCode: res.statusCode,
      status: applicationStatus,
      duration_ms,
      payload: finalPayload ? sanitizePayload(finalPayload) : null,
      frontend: frontendDetails,
      database: getDatabaseStatus() // Re-check DB status on completion
    }, 'Request completed');
  });

  next();
}

module.exports = {
  sanitizePayload,
  requestLogger,
  extractFrontendDetails,
  getDatabaseStatus
};
