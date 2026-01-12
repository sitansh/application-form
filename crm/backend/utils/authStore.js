const TOKEN_TTL_MS = parseInt(process.env.CRM_TOKEN_TTL_MS || String(1000 * 60 * 60)); // 1 hour

const store = new Map(); // token -> { username, createdAt, expiresAt }

function createToken(username) {
  const token = require('crypto').randomUUID();
  const createdAt = Date.now();
  const expiresAt = createdAt + TOKEN_TTL_MS;
  store.set(token, { username, createdAt, expiresAt });
  return token;
}

function verifyToken(token) {
  if (!token) return null;
  const rec = store.get(token);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    store.delete(token);
    return null;
  }
  return { username: rec.username, createdAt: rec.createdAt, expiresAt: rec.expiresAt };
}

function revokeToken(token) {
  return store.delete(token);
}

module.exports = { createToken, verifyToken, revokeToken };
