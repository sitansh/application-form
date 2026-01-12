const { verifyToken } = require('../utils/authStore');

function authMiddleware(req, res, next) {
  try {
    const auth = req.headers['authorization'] || req.headers['x-crm-token'];
    if (!auth) return res.status(401).json({ success: false, message: 'Missing auth token' });

    let token = auth;
    if (auth.startsWith && auth.startsWith('Bearer ')) {
      token = auth.slice('Bearer '.length);
    }

    const user = verifyToken(token);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid or expired token' });

    req.crmUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auth error', error: err.message });
  }
}

module.exports = authMiddleware;
