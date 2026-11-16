'use strict';
const { Router } = require('express');

module.exports = (db) => {
  const r = Router();
  const q = db.prepare('SELECT * FROM paquetes WHERE activo = 1 ORDER BY orden, id');
  r.get('/', (_req, res) => {
    res.json(q.all().map((p) => ({
      id: p.id,
      slug: p.slug,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio_centavos: p.precio_centavos,
      unidad_precio: p.unidad_precio,
      duracion_min: p.duracion_min,
      incluye: JSON.parse(p.incluye),
      min_personas: p.min_personas,
      max_personas: p.max_personas,
      destacado: p.destacado === 1,
    })));
  });
  return r;
};
