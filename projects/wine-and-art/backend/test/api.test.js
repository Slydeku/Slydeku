'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { openDb } = require('../src/db');
const { createApp } = require('../src/app');
const { hoyPR, sumarDias, sumarMeses, diaSemana } = require('../src/lib/fechas');

let server, base, db, dir;
const TOKEN = 'token-de-prueba';

function proximo(dow) { // primera fecha >= mañana con ese día de semana
  let f = sumarDias(hoyPR(), 1);
  while (diaSemana(f) !== dow) f = sumarDias(f, 1);
  return f;
}
const post = (body) => fetch(`${base}/api/reservas`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});
const valida = (o = {}) => ({
  paquete: 'noche-de-vino', fecha: proximo(4), hora: '18:00', personas: 2, nombre: 'Ana Pérez',
  email: 'ana@correo.com', telefono: '(787) 555-0123', notas: 'Cumpleaños', mayor_de_edad: true, ...o,
});

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-test-'));
  db = openDb(path.join(dir, 'test.db'));
  const app = createApp(db, { adminToken: TOKEN, rateLimitMax: 1000 });
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  db.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('GET /api/paquetes devuelve los 4 activos con el formato del contrato', async () => {
  const res = await fetch(`${base}/api/paquetes`);
  assert.equal(res.status, 200);
  const l = await res.json();
  assert.equal(l.length, 4);
  assert.equal(l[0].slug, 'pincel-y-copa');
  assert.ok(Array.isArray(l[0].incluye));
  assert.equal(typeof l[1].destacado, 'boolean');
  assert.equal(l[1].destacado, true);
  assert.equal(l[2].unidad_precio, 'pareja');
});

test('GET /api/disponibilidad: dia abierto, dia cerrado, fuera de rango y errores', async () => {
  const f = proximo(4);
  let j = await (await fetch(`${base}/api/disponibilidad?fecha=${f}&paquete=noche-de-vino`)).json();
  assert.deepEqual(j.horarios.map((h) => h.hora), ['18:00', '20:30']);
  assert.equal(j.horarios[0].cupos_restantes, 24);
  assert.equal(j.horarios[0].disponible, true);

  j = await (await fetch(`${base}/api/disponibilidad?fecha=${proximo(1)}&paquete=noche-de-vino`)).json();
  assert.deepEqual(j.horarios, []);

  j = await (await fetch(`${base}/api/disponibilidad?fecha=${sumarMeses(hoyPR(), 7)}&paquete=noche-de-vino`)).json();
  assert.deepEqual(j.horarios, []);

  assert.equal((await fetch(`${base}/api/disponibilidad?fecha=2026-13-45&paquete=noche-de-vino`)).status, 400);
  assert.equal((await fetch(`${base}/api/disponibilidad?fecha=${f}&paquete=nada`)).status, 400);
  assert.equal((await fetch(`${base}/api/disponibilidad?paquete=noche-de-vino`)).status, 400);
});

test('POST /api/reservas valida: 201, total calculado en servidor y cupo descontado', async () => {
  const f = proximo(6);
  const res = await post(valida({ fecha: f, hora: '14:00', personas: 3, total_centavos: 1 }));
  assert.equal(res.status, 201);
  const j = await res.json();
  assert.match(j.codigo, /^WA-[A-Z0-9]{6}$/);
  assert.equal(j.paquete.nombre, 'Noche de Vino');
  assert.equal(j.total_centavos, 6500 * 3);
  assert.equal(j.estado, 'pendiente');
  assert.equal(j.hora, '14:00');
  const row = db.prepare('SELECT telefono, email FROM reservas WHERE codigo = ?').get(j.codigo);
  assert.equal(row.telefono, '7875550123');

  const d = await (await fetch(`${base}/api/disponibilidad?fecha=${f}&paquete=noche-de-vino`)).json();
  assert.equal(d.horarios.find((h) => h.hora === '14:00').cupos_restantes, 21);

  const p = await post(valida({ paquete: 'pareja-artistica', personas: 2, fecha: f, hora: '20:30' }));
  assert.equal((await p.json()).total_centavos, 12000);
});

test('POST /api/reservas: validaciones 400 con mensajes por campo', async () => {
  const casos = [
    [{ paquete: 'x' }, 'paquete'],
    [{ paquete: undefined }, 'paquete'],
    [{ fecha: hoyPR() }, 'fecha'],
    [{ fecha: sumarMeses(hoyPR(), 7) }, 'fecha'],
    [{ fecha: proximo(1) }, 'fecha'],
    [{ fecha: 'mañana' }, 'fecha'],
    [{ hora: '19:00' }, 'hora'],
    [{ personas: 0 }, 'personas'],
    [{ personas: '2' }, 'personas'],
    [{ paquete: 'evento-privado', personas: 3 }, 'personas'],
    [{ paquete: 'pareja-artistica', personas: 3 }, 'personas'],
    [{ nombre: ' a ' }, 'nombre'],
    [{ email: 'no-es-email' }, 'email'],
    [{ telefono: '12345' }, 'telefono'],
    [{ notas: 'x'.repeat(501) }, 'notas'],
    [{ mayor_de_edad: false }, 'mayor_de_edad'],
    [{ mayor_de_edad: 'true' }, 'mayor_de_edad'],
  ];
  for (const [o, campo] of casos) {
    const res = await post(valida(o));
    assert.equal(res.status, 400, JSON.stringify(o));
    const j = await res.json();
    assert.ok(j.error);
    assert.ok(typeof j.campos[campo] === 'string' && j.campos[campo].length > 0, `${campo}: ${JSON.stringify(j)}`);
  }
  assert.equal((await fetch(`${base}/api/reservas`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{malo' })).status, 400);
  assert.equal((await post({ x: 'y'.repeat(11000) })).status, 413);
});

test('POST /api/reservas: 409 cuando no hay cupo', async () => {
  const f = proximo(5);
  for (let i = 0; i < 2; i++) assert.equal((await post(valida({ fecha: f, paquete: 'evento-privado', personas: 12 }))).status, 201);
  const res = await post(valida({ fecha: f, paquete: 'evento-privado', personas: 8 }));
  assert.equal(res.status, 409);
  assert.ok((await res.json()).error);
  const d = await (await fetch(`${base}/api/disponibilidad?fecha=${f}&paquete=evento-privado`)).json();
  const h = d.horarios.find((x) => x.hora === '18:00');
  assert.equal(h.cupos_restantes, 0);
  assert.equal(h.disponible, false);
});

test('GET /api/admin/reservas: 401 sin token o con token incorrecto, 200 con token', async () => {
  assert.equal((await fetch(`${base}/api/admin/reservas`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/reservas`, { headers: { authorization: 'Bearer malo' } })).status, 401);
  const res = await fetch(`${base}/api/admin/reservas?fecha=${proximo(5)}`, { headers: { authorization: `Bearer ${TOKEN}` } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).reservas.length, 2);
});

test('admin deshabilitado sin ADMIN_TOKEN', async () => {
  const app = createApp(db, {});
  const s = await new Promise((r) => { const x = app.listen(0, () => r(x)); });
  const b = `http://127.0.0.1:${s.address().port}`;
  try {
    assert.equal((await fetch(`${b}/api/admin/reservas`, { headers: { authorization: 'Bearer ' } })).status, 401);
    assert.equal((await fetch(`${b}/api/admin/reservas`, { headers: { authorization: 'Bearer undefined' } })).status, 401);
  } finally { await new Promise((r) => s.close(r)); }
});

async function conApp(cfg, fn) {
  const app = createApp(db, cfg);
  const s = await new Promise((r) => { const x = app.listen(0, () => r(x)); });
  const p = (body) => fetch(`http://127.0.0.1:${s.address().port}/api/reservas`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  try { await fn(p); } finally { await new Promise((r) => s.close(r)); }
}

test('rate limit: los 400 y 409 no consumen el cupo de reservas creadas', async () => {
  await conApp({ rateLimitMax: 2, intentosMax: 30 }, async (p) => {
    for (let i = 0; i < 4; i++) assert.equal((await p({})).status, 400);
    assert.equal((await p(valida({ fecha: proximo(6), hora: '18:00' }))).status, 201);
    assert.equal((await p(valida({ fecha: proximo(6), hora: '20:30' }))).status, 201);
    const r = await p(valida({ fecha: proximo(6) }));
    assert.equal(r.status, 429);
    assert.ok(Number(r.headers.get('retry-after')) > 0);
  });
});

test('rate limit: un 409 no consume el cupo de exitos', async () => {
  await conApp({ rateLimitMax: 1, intentosMax: 30 }, async (p) => {
    const f = proximo(0);
    // llena la sala con muchas personas via DB para forzar 409
    const paq = db.prepare("SELECT id FROM paquetes WHERE slug = 'noche-de-vino'").get();
    const ins = db.prepare(`INSERT INTO reservas (codigo, paquete_id, fecha, hora, personas, nombre, email, telefono, mayor_de_edad, total_centavos, estado)
      VALUES (?, ?, ?, '18:00', 12, 'Lleno', 'l@l.com', '7875550000', 1, 0, 'pendiente')`);
    ins.run('WA-LLENO1', paq.id, f);
    ins.run('WA-LLENO2', paq.id, f);
    assert.equal((await p(valida({ fecha: f, hora: '18:00' }))).status, 409);
    assert.equal((await p(valida({ fecha: f, hora: '18:00' }))).status, 409);
    assert.equal((await p(valida({ fecha: f, hora: '20:30' }))).status, 201);
    assert.equal((await p(valida({ fecha: f, hora: '20:30' }))).status, 429);
  });
});

test('rate limit: limite de intentos totales (anti-abuso) devuelve 429 con Retry-After', async () => {
  await conApp({ rateLimitMax: 10, intentosMax: 3 }, async (p) => {
    const codigos = [];
    let ultima;
    for (let i = 0; i < 4; i++) { ultima = await p({}); codigos.push(ultima.status); }
    assert.deepEqual(codigos, [400, 400, 400, 429]);
    assert.ok(Number(ultima.headers.get('retry-after')) > 0);
  });
});

test('sirve el frontend estatico', async () => {
  const res = await fetch(`${base}/`);
  assert.ok([200, 404].includes(res.status));
  assert.ok(res.headers.get('content-security-policy').includes('cdn.tailwindcss.com'));
});
