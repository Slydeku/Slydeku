'use strict';
const crypto = require('crypto');
const { Router } = require('express');
const { parseFecha, diaSemana, rangoPermitido } = require('../lib/fechas');
const { cuposDelDia } = require('../lib/cupos');

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function generarCodigo() {
  let s = 'WA-';
  for (let i = 0; i < 6; i++) s += ALFABETO[crypto.randomInt(ALFABETO.length)];
  return s;
}
// Quita caracteres de control (conserva saltos de linea en notas)
const limpiar = (s, saltos) => s.replace(saltos ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '').trim();

function validar(body, paq, db) {
  const c = {};
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const str = (v) => (typeof v === 'string' ? v : '');

  if (!paq) c.paquete = 'Elige un paquete para continuar.';

  const fecha = str(b.fecha).trim();
  let dia = null;
  if (!fecha) c.fecha = 'Elige una fecha a partir de mañana.';
  else if (!parseFecha(fecha)) c.fecha = 'Elige una fecha válida.';
  else {
    const { min, max } = rangoPermitido();
    if (fecha < min) c.fecha = 'Elige una fecha a partir de mañana.';
    else if (fecha > max) c.fecha = 'Solo aceptamos reservas hasta 6 meses por adelantado.';
    else dia = diaSemana(fecha);
  }

  const hora = str(b.hora).trim();
  if (!/^\d{2}:\d{2}$/.test(hora)) c.hora = 'Elige una hora disponible.';
  else if (dia !== null) {
    const ok = db.prepare('SELECT 1 FROM horarios WHERE activo = 1 AND dia_semana = ? AND hora = ?').get(dia, hora);
    if (!ok) {
      if (!db.prepare('SELECT 1 FROM horarios WHERE activo = 1 AND dia_semana = ?').get(dia)) {
        c.fecha = 'Ese día no tenemos sesiones. Elige de jueves a domingo.';
      } else c.hora = 'Elige una hora disponible.';
    }
  }

  const personas = b.personas;
  if (!Number.isInteger(personas)) c.personas = 'Indica la cantidad de personas.';
  else if (paq && (personas < paq.min_personas || personas > paq.max_personas)) {
    c.personas = paq.min_personas === paq.max_personas
      ? `${paq.nombre} es para ${paq.min_personas} personas.`
      : `Este paquete es para ${paq.min_personas} a ${paq.max_personas} personas.`;
  }

  const nombre = limpiar(str(b.nombre));
  if (nombre.length < 2 || nombre.length > 80) c.nombre = 'Escribe tu nombre (2 a 80 caracteres).';

  const email = str(b.email).trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    c.email = 'Escribe un correo válido, ej. nombre@correo.com.';
  }

  let tel = str(b.telefono).replace(/[\s\-().+]/g, '');
  if (/^1\d{10}$/.test(tel)) tel = tel.slice(1);
  if (!/^\d{10}$/.test(tel) || str(b.telefono).length > 30) c.telefono = 'Escribe un teléfono de 10 dígitos, ej. 787-555-0123.';

  let notas = null;
  if (b.notas !== undefined && b.notas !== null && b.notas !== '') {
    if (typeof b.notas !== 'string') c.notas = 'Las notas deben ser texto.';
    else if (b.notas.length > 500) c.notas = 'Máximo 500 caracteres.';
    else notas = limpiar(b.notas, true) || null;
  }

  if (b.mayor_de_edad !== true) c.mayor_de_edad = 'Debes confirmar que todas las personas tienen 21 años o más.';

  return { campos: c, datos: { fecha, hora, personas, nombre, email, telefono: tel, notas } };
}

// Contador por IP en ventana fija. `revisar` bloquea si ya se alcanzo el maximo;
// `contar` suma un uso (se llama aparte para poder contar solo ciertos resultados).
function contador(max, ventanaMs) {
  const hits = new Map();
  setInterval(() => { const t = Date.now(); for (const [k, v] of hits) if (v.fin < t) hits.delete(k); }, 60000).unref();
  const get = (ip, t) => {
    let h = hits.get(ip);
    if (!h || h.fin < t) { h = { n: 0, fin: t + ventanaMs }; hits.set(ip, h); }
    return h;
  };
  return {
    // true si ya agoto el cupo (y fija Retry-After)
    agotado(req, res) {
      const t = Date.now();
      const h = get(req.ip, t);
      if (h.n < max) return false;
      res.set('Retry-After', String(Math.max(1, Math.ceil((h.fin - t) / 1000))));
      return true;
    },
    contar(req) { get(req.ip, Date.now()).n++; },
  };
}

const VENTANA_MS = 15 * 60 * 1000;
const MSG_429 = { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' };

module.exports = (db, { rateLimitMax = 10, intentosMax = 30 } = {}) => {
  // Limite principal: solo reservas creadas (201). Anti-abuso: todos los intentos.
  const exitos = contador(rateLimitMax, VENTANA_MS);
  const intentos = contador(intentosMax, VENTANA_MS);
  const r = Router();
  const qPaq = db.prepare('SELECT * FROM paquetes WHERE slug = ? AND activo = 1');
  const ins = db.prepare(`INSERT INTO reservas
    (codigo, paquete_id, fecha, hora, personas, nombre, email, telefono, notas, mayor_de_edad, total_centavos, estado)
    VALUES (@codigo, @paquete_id, @fecha, @hora, @personas, @nombre, @email, @telefono, @notas, 1, @total, 'pendiente')`);

  const reservar = db.transaction((paq, d, codigo) => {
    const fila = cuposDelDia(db, d.fecha, diaSemana(d.fecha)).find((h) => h.hora === d.hora);
    if (!fila || fila.restantes < d.personas) return null;
    const total = paq.unidad_precio === 'pareja' ? paq.precio_centavos : paq.precio_centavos * d.personas;
    ins.run({ ...d, codigo, paquete_id: paq.id, total });
    return total;
  });

  r.post('/', (req, res) => {
    if (intentos.agotado(req, res) || exitos.agotado(req, res)) return res.status(429).json(MSG_429);
    intentos.contar(req);
    const paq = typeof req.body?.paquete === 'string' ? qPaq.get(req.body.paquete) : null;
    const { campos, datos } = validar(req.body, paq, db);
    if (Object.keys(campos).length) {
      return res.status(400).json({ error: 'Revisa los campos marcados.', campos });
    }
    for (let i = 0; i < 5; i++) {
      const codigo = generarCodigo();
      try {
        const total = reservar(paq, datos, codigo);
        if (total === null) return res.status(409).json({ error: 'Esa hora ya no está disponible. Elige otra.' });
        exitos.contar(req);
        return res.status(201).json({
          codigo, paquete: { nombre: paq.nombre }, fecha: datos.fecha, hora: datos.hora,
          personas: datos.personas, total_centavos: total, estado: 'pendiente',
        });
      } catch (e) {
        if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE' && /codigo/.test(e.message)) continue; // colision: reintentar
        throw e;
      }
    }
    throw new Error('No se pudo generar un código único');
  });
  return r;
};
