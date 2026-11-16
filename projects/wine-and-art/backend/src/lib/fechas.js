'use strict';
// Todas las fechas se manejan como 'YYYY-MM-DD' en la zona America/Puerto_Rico.
const TZ = 'America/Puerto_Rico';
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

function hoyPR(ahora = new Date()) { return fmt.format(ahora); }

function parseFecha(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}
const aStr = (dt) => dt.toISOString().slice(0, 10);

function sumarDias(fecha, n) { const dt = parseFecha(fecha); dt.setUTCDate(dt.getUTCDate() + n); return aStr(dt); }
function sumarMeses(fecha, n) {
  const dt = parseFecha(fecha);
  const dia = dt.getUTCDate();
  dt.setUTCDate(1);
  dt.setUTCMonth(dt.getUTCMonth() + n);
  const ult = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
  dt.setUTCDate(Math.min(dia, ult));
  return aStr(dt);
}
const diaSemana = (fecha) => parseFecha(fecha).getUTCDay(); // 0=domingo

function rangoPermitido(ahora = new Date()) {
  const hoy = hoyPR(ahora);
  return { min: sumarDias(hoy, 1), max: sumarMeses(hoy, 6) };
}

module.exports = { hoyPR, parseFecha, sumarDias, sumarMeses, diaSemana, rangoPermitido };
