'use strict';
const crypto = require('crypto');
const { Router } = require('express');
const { parseFecha } = require('../lib/fechas');

const hash = (s) => crypto.createHash('sha256').update(s).digest();

module.exports = (db, adminToken) => {
  const r = Router();
  const esperado = adminToken ? hash(adminToken) : null;

  r.use((req, res, next) => {
    const m = /^Bearer (.+)$/.exec(req.get('authorization') || '');
    if (!esperado || !m || !crypto.timingSafeEqual(hash(m[1]), esperado)) {
      return res.status(401).json({ error: 'No autorizado.' });
    }
    next();
  });

  const SEL = `SELECT r.codigo, p.slug AS paquete, p.nombre AS paquete_nombre, r.fecha, r.hora, r.personas,
      r.nombre, r.email, r.telefono, r.notas, r.total_centavos, r.estado, r.creada_en
    FROM reservas r JOIN paquetes p ON p.id = r.paquete_id`;
  r.get('/reservas', (req, res) => {
    const { fecha } = req.query;
    if (fecha !== undefined && (typeof fecha !== 'string' || !parseFecha(fecha))) {
      return res.status(400).json({ error: 'Fecha inválida. Usa el formato AAAA-MM-DD.' });
    }
    const rows = fecha
      ? db.prepare(`${SEL} WHERE r.fecha = ? ORDER BY r.hora, r.id`).all(fecha)
      : db.prepare(`${SEL} ORDER BY r.fecha, r.hora, r.id LIMIT 500`).all();
    res.json({ reservas: rows });
  });
  return r;
};
