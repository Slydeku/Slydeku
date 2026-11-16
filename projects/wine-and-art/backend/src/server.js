'use strict';
require('./lib/env');
const { openDb, resolverRuta } = require('./db');
const { createApp } = require('./app');

const db = openDb(process.env.DB_PATH);
const app = createApp(db, {
  corsOrigin: process.env.CORS_ORIGIN,
  adminToken: process.env.ADMIN_TOKEN,
  trustProxy: !!process.env.TRUST_PROXY,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 10,
  intentosMax: Number(process.env.RATE_LIMIT_ATTEMPTS_MAX) || 30,
});
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`Wine and Art en http://localhost:${port} (DB: ${resolverRuta(process.env.DB_PATH)})`);
  if (!process.env.ADMIN_TOKEN) console.log('ADMIN_TOKEN no definido: /api/admin deshabilitado.');
});
const cerrar = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
