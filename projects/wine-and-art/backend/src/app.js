'use strict';
const path = require('path');
const express = require('express');
const paquetes = require('./rutas/paquetes');
const disponibilidad = require('./rutas/disponibilidad');
const reservas = require('./rutas/reservas');
const admin = require('./rutas/admin');

const FRONTEND = path.join(__dirname, '..', '..', 'frontend');

// CSP compatible con Tailwind CDN (script + estilos inline que inyecta) y Google Fonts.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

function createApp(db, cfg = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (cfg.trustProxy) app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    });
    next();
  });

  const origenes = (cfg.corsOrigin || '').split(',').map((s) => s.trim()).filter(Boolean);
  app.use('/api', (req, res, next) => {
    const o = req.get('origin');
    if (o && origenes.includes(o)) {
      res.set({ 'Access-Control-Allow-Origin': o, Vary: 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', express.json({ limit: '10kb' }));

  app.use('/api/paquetes', paquetes(db));
  app.use('/api/disponibilidad', disponibilidad(db));
  app.use('/api/reservas', reservas(db, { rateLimitMax: cfg.rateLimitMax, intentosMax: cfg.intentosMax }));
  app.use('/api/admin', admin(db, cfg.adminToken));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'No encontrado.' }));

  app.use(express.static(FRONTEND, { index: 'index.html', dotfiles: 'ignore' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande.' });
    console.error('[error]', err);
    res.status(500).json({ error: 'Error del servidor. Intenta de nuevo más tarde.' });
  });
  return app;
}
module.exports = { createApp };
