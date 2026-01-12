const express = require('express');
const router = express.Router();
require('dotenv').config();

// Simple, minimal authentication for the CRM UI.
// Credentials come from environment variables with safe defaults for local development.
const ADMIN_USER = process.env.CRM_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.CRM_ADMIN_PASS || 'password';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Missing credentials' });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // create a simple session token (not a JWT) - OK for local/dev only
      const { createToken } = require('../utils/authStore');
      const token = createToken(username);
      return res.status(200).json({ success: true, token, username });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    req.log && req.log.error({ err }, 'Auth login error');
    return res.status(500).json({ success: false, message: 'Auth error', error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || req.headers['x-crm-token'];
    if (!auth) return res.status(400).json({ success: false, message: 'Missing token' });
    let token = auth;
    if (auth.startsWith && auth.startsWith('Bearer ')) token = auth.slice('Bearer '.length);
    const { revokeToken } = require('../utils/authStore');
    revokeToken(token);
    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    req.log && req.log.error({ err }, 'Auth logout error');
    return res.status(500).json({ success: false, message: 'Auth error', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || req.headers['x-crm-token'];
    if (!auth) return res.status(200).json({ success: false, authenticated: false });
    let token = auth;
    if (auth.startsWith && auth.startsWith('Bearer ')) token = auth.slice('Bearer '.length);
    const { verifyToken } = require('../utils/authStore');
    const user = verifyToken(token);
    if (!user) return res.status(200).json({ success: false, authenticated: false });
    return res.status(200).json({ success: true, authenticated: true, user });
  } catch (err) {
    req.log && req.log.error({ err }, 'Auth me error');
    return res.status(500).json({ success: false, message: 'Auth error', error: err.message });
  }
});

module.exports = router;

