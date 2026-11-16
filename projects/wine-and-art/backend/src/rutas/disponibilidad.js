'use strict';
const { Router } = require('express');
const { parseFecha, diaSemana, rangoPermitido } = require('../lib/fechas');
const { cuposDelDia } = require('../lib/cupos');

module.exports = (db) => {
  const r = Router();
  const qPaq = db.prepare('SELECT min_personas FROM paquetes WHERE slug = ? AND activo = 1');
  r.get('/', (req, res) => {
    const { fecha, paquete } = req.query;
    if (typeof fecha !== 'string' || !parseFecha(fecha)) {
      return res.status(400).json({ error: 'Fecha inválida. Usa el formato AAAA-MM-DD.' });
    }
    const paq = typeof paquete === 'string' ? qPaq.get(paquete) : null;
    if (!paq) return res.status(400).json({ error: 'El paquete no existe.' });

    const { min, max } = rangoPermitido();
    if (fecha < min || fecha > max) return res.json({ fecha, horarios: [] });

    const horarios = cuposDelDia(db, fecha, diaSemana(fecha)).map((h) => {
      const cupos = Math.max(0, h.restantes);
      return { hora: h.hora, cupos_restantes: cupos, disponible: cupos >= paq.min_personas };
    });
    res.json({ fecha, horarios });
  });
  return r;
};
