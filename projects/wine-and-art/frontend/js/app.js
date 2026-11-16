/* Wine and Art - frontend (JS vanilla) */
(function () {
  'use strict';

  // Base de la API (mismo origen). Se puede cambiar con window.API_BASE antes de cargar este script.
  const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || '/api';

  // ---------- Datos de respaldo (si la API no responde) ----------
  const PAQUETES_RESPALDO = [
    { id: 1, slug: 'pincel-y-copa', nombre: 'Pincel y Copa', descripcion: 'Nuestra sesión básica de pintura, ideal para probar.', precio_centavos: 4500, unidad_precio: 'persona', duracion_min: 120, incluye: ['1 copa de vino'], min_personas: 1, max_personas: 12, destacado: false },
    { id: 2, slug: 'noche-de-vino', nombre: 'Noche de Vino', descripcion: 'Pintura con vino y picadera para una noche completa.', precio_centavos: 6500, unidad_precio: 'persona', duracion_min: 150, incluye: ['Media botella de vino por persona', 'Picadera'], min_personas: 1, max_personas: 12, destacado: true },
    { id: 3, slug: 'pareja-artistica', nombre: 'Pareja Artística', descripcion: 'Una cita diferente: pintan juntos en un lienzo compartido.', precio_centavos: 12000, unidad_precio: 'pareja', duracion_min: null, incluye: ['1 botella de vino'], min_personas: 2, max_personas: 2, destacado: false },
    { id: 4, slug: 'evento-privado', nombre: 'Evento Privado', descripcion: 'Cumpleaños, despedidas o actividades de equipo, solo para tu grupo.', precio_centavos: 5500, unidad_precio: 'persona', duracion_min: null, incluye: ['1 botella por cada 2 personas'], min_personas: 8, max_personas: 20, destacado: false }
  ];
  const ICONO_POR_SLUG = { 'pincel-y-copa': 'pincel', 'noche-de-vino': 'copa', 'pareja-artistica': 'paleta', 'evento-privado': 'calendario' };

  // Horarios por defecto según docs/diseno.md (0=dom ... 6=sáb)
  function horariosPorDefecto(dow) {
    if (dow === 4 || dow === 5) return ['18:00', '20:30'];
    if (dow === 6 || dow === 0) return ['14:00', '18:00', '20:30'];
    return [];
  }

  // ---------- Utilidades ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reducirMov = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const moneda = new Intl.NumberFormat('es-PR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const dinero = (c) => moneda.format(c / 100);
  function esc(t) { const d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

  function hoyPR() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Puerto_Rico' }).format(new Date()); // YYYY-MM-DD
  }
  function sumarDias(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  }
  function sumarMeses(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
  }
  function diaSemana(iso) { // sin conversión UTC
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
  }
  function fechaBonita(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('es-PR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(y, m - 1, d)));
  }
  function horaBonita(hhmm) {
    const [h, mi] = hhmm.split(':').map(Number);
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + String(mi).padStart(2, '0') + ' ' + (h >= 12 ? 'pm' : 'am');
  }
  function duracionTexto(min) {
    if (!min) return 'Duración según sesión';
    const h = min / 60;
    return (Number.isInteger(h) ? h : h.toFixed(1).replace(/\.0$/, '')) + ' h';
  }
  function personasTexto(p) {
    if (p.min_personas === p.max_personas) return p.min_personas + ' personas';
    return p.min_personas + ' a ' + p.max_personas + ' personas';
  }
  function totalCentavos(p, n) { return p.unidad_precio === 'pareja' ? p.precio_centavos : p.precio_centavos * n; }

  async function pedirJSON(url, opciones) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(url, Object.assign({ signal: ctrl.signal }, opciones));
      let cuerpo = null;
      try { cuerpo = await r.json(); } catch (e) { /* sin JSON */ }
      return { ok: r.ok, status: r.status, cuerpo, retryAfter: parseInt(r.headers.get('Retry-After'), 10) || 0 };
    } finally { clearTimeout(t); }
  }

  // ---------- Estado ----------
  let paquetes = [];
  let horarios = [];            // [{hora, cupos_restantes, disponible}]
  let horariosCargados = false; // true si ya tenemos lista para fecha+paquete actuales
  let tokenHorarios = 0;

  const f = {
    form: $('#form-reserva'), paquete: $('#paquete'), fecha: $('#fecha'), horas: $('#horas'),
    personas: $('#personas'), nombre: $('#nombre'), email: $('#email'), telefono: $('#telefono'),
    notas: $('#notas'), mayor: $('#mayor'), btn: $('#btn-enviar'), txtBtn: $('#txt-enviar'),
    resErr: $('#resumen-errores'), errGen: $('#error-general'), ayudaHora: $('#a-hora'), ayudaPers: $('#a-personas')
  };
  const paqueteActual = () => paquetes.find((p) => p.slug === f.paquete.value) || null;

  // ---------- Paquetes ----------
  async function cargarPaquetes() {
    try {
      const r = await pedirJSON(API_BASE + '/paquetes');
      if (r.ok && Array.isArray(r.cuerpo) && r.cuerpo.length) { paquetes = r.cuerpo; }
      else throw new Error('respuesta inválida');
    } catch (e) {
      paquetes = PAQUETES_RESPALDO;
    }
    renderPaquetes();
    renderSelect();
    const pre = new URLSearchParams(location.search).get('paquete');
    if (pre && paquetes.some((p) => p.slug === pre)) { f.paquete.value = pre; }
    alCambiarPaquete(false);
  }

  function renderPaquetes() {
    const cont = $('#lista-paquetes');
    cont.innerHTML = paquetes.map((p) => {
      const icono = ICONO_POR_SLUG[p.slug] || 'paleta';
      const unidad = p.unidad_precio === 'pareja' ? 'por pareja' : 'por persona';
      return '<article class="tarjeta" data-slug="' + esc(p.slug) + '" aria-labelledby="t-' + esc(p.slug) + '">' +
        '<div class="flex items-start justify-between gap-2 mb-4">' +
          '<span class="tarjeta-ico"><svg class="ico w-8 h-8" aria-hidden="true"><use href="#i-' + icono + '"/></svg></span>' +
          '<span class="flex flex-col items-end gap-1">' +
            (p.destacado ? '<span class="chip">Más popular</span>' : '') +
            '<span class="chip chip-elegido" hidden style="background:#6B1A2E;color:#FAF4EC">Elegido</span>' +
          '</span>' +
        '</div>' +
        '<h3 id="t-' + esc(p.slug) + '" class="h3">' + esc(p.nombre) + '</h3>' +
        '<p class="mt-2 text-tinta-suave text-base">' + esc(p.descripcion) + '</p>' +
        '<p class="mt-5 flex items-baseline gap-2"><span class="precio">' + esc(dinero(p.precio_centavos)) + '</span><span class="text-base text-tinta-suave">' + unidad + '</span></p>' +
        '<ul class="mt-4 space-y-2 text-base">' +
          '<li class="flex items-center gap-2"><svg class="ico w-5 h-5 text-vino shrink-0" aria-hidden="true"><use href="#i-reloj"/></svg>' + esc(duracionTexto(p.duracion_min)) + '</li>' +
          '<li class="flex items-center gap-2"><svg class="ico w-5 h-5 text-vino shrink-0" aria-hidden="true"><use href="#i-personas"/></svg>' + esc(personasTexto(p)) + '</li>' +
        '</ul>' +
        '<p class="mt-4 font-bold text-base">Incluye</p>' +
        '<ul class="mt-1 space-y-1 text-base mb-6">' +
          (p.incluye || []).map((i) => '<li class="flex items-start gap-2"><svg class="ico w-5 h-5 mt-1 text-ok shrink-0" aria-hidden="true"><use href="#i-check"/></svg><span>' + esc(i) + '</span></li>').join('') +
        '</ul>' +
        '<button type="button" class="btn btn-primario w-full mt-auto" data-reservar="' + esc(p.slug) + '">Reservar este paquete<span class="sr-only">: ' + esc(p.nombre) + '</span></button>' +
      '</article>';
    }).join('');
    marcarElegida();
  }

  function marcarElegida() {
    $$('.tarjeta').forEach((t) => {
      const sel = t.dataset.slug === f.paquete.value;
      t.classList.toggle('elegida', sel);
      $('.chip-elegido', t).hidden = !sel;
    });
  }

  function renderSelect() {
    const actual = f.paquete.value;
    f.paquete.innerHTML = '<option value="">Elige un paquete</option>' +
      paquetes.map((p) => '<option value="' + esc(p.slug) + '">' + esc(p.nombre) + ' (' + esc(dinero(p.precio_centavos)) + (p.unidad_precio === 'pareja' ? ' por pareja' : ' por persona') + ')</option>').join('');
    f.paquete.value = actual;
  }

  $('#lista-paquetes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-reservar]');
    if (!b) return;
    f.paquete.value = b.dataset.reservar;
    mostrarFormulario();
    alCambiarPaquete(true);
    clearError('paquete');
    $('#reservar').scrollIntoView({ behavior: reducirMov() ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => f.fecha.focus({ preventScroll: true }), reducirMov() ? 0 : 450);
  });

  // ---------- Personas ----------
  function limitesPersonas() {
    const p = paqueteActual();
    return p ? { min: p.min_personas, max: p.max_personas } : { min: 1, max: 20 };
  }
  function leerPersonas() { const n = parseInt(f.personas.value, 10); return Number.isFinite(n) ? n : NaN; }
  function pintarPasos() {
    const { min, max } = limitesPersonas();
    const n = leerPersonas();
    $('#p-menos').setAttribute('aria-disabled', String(!(n > min)));
    $('#p-mas').setAttribute('aria-disabled', String(!(n < max)));
  }
  function ajustarPersonas(n, anunciar) {
    const { min, max } = limitesPersonas();
    const nuevo = Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
    const cambio = nuevo !== leerPersonas();
    f.personas.value = nuevo;
    if (cambio && anunciar) {
      $('#aviso-personas').textContent = 'Ajustamos la cantidad a ' + nuevo + ' personas según el paquete.';
    }
    pintarPasos();
  }
  $('#p-menos').addEventListener('click', () => { const { min } = limitesPersonas(); const n = leerPersonas(); if (n > min) { f.personas.value = n - 1; clearError('personas'); actualizar(); } });
  $('#p-mas').addEventListener('click', () => { const { max } = limitesPersonas(); const n = leerPersonas(); if (!(n >= max)) { f.personas.value = (Number.isFinite(n) ? n : 0) + 1; clearError('personas'); actualizar(); } });
  f.personas.addEventListener('input', () => { f.personas.value = f.personas.value.replace(/\D/g, '').slice(0, 2); actualizar(); });

  function alCambiarPaquete(anunciar) {
    const p = paqueteActual();
    if (p) {
      f.ayudaPers.textContent = p.min_personas === p.max_personas
        ? 'Este paquete es para ' + p.min_personas + ' personas.'
        : 'Mínimo ' + p.min_personas + ', máximo ' + p.max_personas + ' para este paquete.';
      ajustarPersonas(leerPersonas(), anunciar);
    } else {
      f.ayudaPers.textContent = 'Elige un paquete para ver los límites.';
      pintarPasos();
    }
    marcarElegida();
    actualizar();
    cargarHorarios();
  }

  // ---------- Fecha y horarios ----------
  function configurarFecha() {
    const hoy = hoyPR();
    f.fecha.min = sumarDias(hoy, 1);
    f.fecha.max = sumarMeses(hoy, 6);
  }

  function errorFecha(v) {
    if (!v) return 'Elige una fecha a partir de mañana.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Elige una fecha a partir de mañana.';
    const hoy = hoyPR();
    if (v < sumarDias(hoy, 1)) return 'Elige una fecha a partir de mañana.';
    if (v > sumarMeses(hoy, 6)) return 'Solo aceptamos reservas hasta 6 meses por adelantado.';
    if (horariosPorDefecto(diaSemana(v)).length === 0) return 'Ese día no tenemos sesiones. Elige de jueves a domingo.';
    return '';
  }

  let claveHorarios = '';
  async function cargarHorarios(forzar) {
    const fecha = f.fecha.value;
    const p = paqueteActual();
    // O6: evita repetir la misma consulta si ya está cargada o en curso
    const clave = fecha && p ? fecha + '|' + p.slug : '';
    if (!forzar && clave && clave === claveHorarios) return;
    claveHorarios = clave;
    const token = ++tokenHorarios;
    const horaPrevia = valorHora();
    horariosCargados = false;
    if (!fecha || !p || errorFecha(fecha)) {
      horarios = [];
      renderHoras(horaPrevia);
      f.ayudaHora.textContent = !fecha ? 'Elige primero la fecha para ver las horas disponibles.' : (!p ? 'Elige un paquete para ver las horas disponibles.' : 'Elige una fecha válida para ver las horas.');
      return;
    }
    f.ayudaHora.textContent = 'Buscando horas disponibles…';
    let lista = null;
    try {
      const r = await pedirJSON(API_BASE + '/disponibilidad?fecha=' + encodeURIComponent(fecha) + '&paquete=' + encodeURIComponent(p.slug));
      if (r.ok && r.cuerpo && Array.isArray(r.cuerpo.horarios)) lista = r.cuerpo.horarios;
    } catch (e) { /* usa respaldo */ }
    if (token !== tokenHorarios) return; // llegó otra petición después
    if (!lista) lista = horariosPorDefecto(diaSemana(fecha)).map((h) => ({ hora: h, cupos_restantes: null, disponible: true }));
    horarios = lista;
    horariosCargados = true;
    renderHoras(horaPrevia);
    if (!horarios.length) {
      setError('fecha', 'Ese día no tenemos sesiones. Elige de jueves a domingo.');
      f.ayudaHora.textContent = 'No hay horas disponibles para esta fecha.';
    } else {
      if (f.fecha.getAttribute('aria-invalid') === 'true' && !errorFecha(fecha)) clearError('fecha');
      f.ayudaHora.textContent = 'Elige una de las horas disponibles.';
    }
    actualizar();
  }

  function renderHoras(previa) {
    f.horas.innerHTML = horarios.map((h, i) => {
      const dis = h.disponible !== false;
      const extra = !dis ? 'Agotado' : (typeof h.cupos_restantes === 'number' && h.cupos_restantes <= 5 ? 'Quedan ' + h.cupos_restantes : '');
      return '<label class="chip-hora"><input type="radio" name="hora" value="' + esc(h.hora) + '"' + (dis ? '' : ' disabled') + (previa === h.hora && dis ? ' checked' : '') + '>' +
        '<span>' + esc(horaBonita(h.hora)) + (extra ? '<small>' + extra + '</small>' : '') + '</span></label>';
    }).join('');
  }
  const valorHora = () => { const r = $('input[name="hora"]:checked', f.horas); return r ? r.value : ''; };
  f.horas.addEventListener('change', () => { clearError('hora'); actualizar(); });

  f.fecha.addEventListener('change', () => {
    const e = errorFecha(f.fecha.value);
    if (e) setError('fecha', e); else clearError('fecha');
    cargarHorarios();
    actualizar();
  });
  f.paquete.addEventListener('change', () => { if (f.paquete.value) clearError('paquete'); alCambiarPaquete(true); });

  // ---------- Resumen ----------
  function actualizar() {
    const p = paqueteActual();
    const n = leerPersonas();
    const fecha = f.fecha.value;
    const hora = valorHora();
    $('#r-paquete').textContent = p ? p.nombre : '—';
    $('#r-fecha').textContent = fecha && !errorFecha(fecha) ? fechaBonita(fecha) : '—';
    $('#r-hora').textContent = hora ? horaBonita(hora) : '—';
    $('#r-personas').textContent = Number.isFinite(n) ? String(n) : '—';
    $('#r-precio').textContent = p ? dinero(p.precio_centavos) + (p.unidad_precio === 'pareja' ? ' por pareja' : ' x persona') : '—';
    $('#r-total').textContent = p && Number.isFinite(n) ? dinero(totalCentavos(p, n)) : '—';
    pintarPasos();
  }

  // ---------- Errores ----------
  const ETIQUETAS = { paquete: 'Paquete', fecha: 'Fecha', hora: 'Hora', personas: 'Cantidad de personas', nombre: 'Nombre', email: 'Correo', telefono: 'Teléfono', notas: 'Notas', mayor: 'Confirmación de 21 años o más' };
  function campoEl(c) { return c === 'hora' ? ($('input[name="hora"]:not(:disabled)', f.horas) || f.horas) : f[c]; }

  function setError(campo, msg) {
    const e = $('#e-' + campo);
    e.textContent = msg; e.hidden = false;
    if (campo === 'hora') f.horas.setAttribute('aria-invalid', 'true');
    else if (f[campo]) f[campo].setAttribute('aria-invalid', 'true');
  }
  function clearError(campo) {
    const e = $('#e-' + campo);
    if (!e) return;
    e.textContent = ''; e.hidden = true;
    if (campo === 'hora') f.horas.removeAttribute('aria-invalid');
    else if (f[campo]) f[campo].removeAttribute('aria-invalid');
  }

  const validadores = {
    paquete: () => (f.paquete.value ? '' : 'Elige un paquete para continuar.'),
    fecha: () => errorFecha(f.fecha.value),
    hora: () => {
      const h = valorHora();
      if (!h) return 'Elige una hora disponible.';
      if (horariosCargados && !horarios.some((x) => x.hora === h && x.disponible !== false)) return 'Elige una hora disponible.';
      return '';
    },
    personas: () => {
      const n = leerPersonas(); const p = paqueteActual();
      if (!Number.isInteger(n)) return 'Escribe cuántas personas asistirán.';
      if (!p) return n < 1 ? 'Escribe al menos 1 persona.' : '';
      if (n < p.min_personas || n > p.max_personas) {
        return p.min_personas === p.max_personas
          ? p.nombre + ' es para ' + p.min_personas + ' personas.'
          : 'Este paquete es para ' + p.min_personas + ' a ' + p.max_personas + ' personas.';
      }
      return '';
    },
    nombre: () => { const v = f.nombre.value.trim(); return v.length >= 2 && v.length <= 80 ? '' : 'Escribe tu nombre.'; },
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? '' : 'Escribe un correo válido, ej. nombre@correo.com.'),
    telefono: () => {
      let d = f.telefono.value.replace(/[\s\-().]/g, '');
      if (/^\+?1\d{10}$/.test(d)) d = d.replace(/^\+?1/, '');
      return /^\d{10}$/.test(d) ? '' : 'Escribe un teléfono de 10 dígitos, ej. 787-555-0123.';
    },
    notas: () => (f.notas.value.length > 500 ? 'Máximo 500 caracteres.' : ''),
    mayor: () => (f.mayor.checked ? '' : 'Debes confirmar que todas las personas tienen 21 años o más.')
  };
  const ORDEN = ['paquete', 'fecha', 'hora', 'personas', 'nombre', 'email', 'telefono', 'notas', 'mayor'];

  function validarCampo(c) {
    const msg = validadores[c]();
    if (msg) setError(c, msg); else clearError(c);
    return msg;
  }
  ['nombre', 'email', 'telefono', 'personas', 'paquete', 'notas'].forEach((c) => {
    f[c].addEventListener('blur', () => validarCampo(c));
    f[c].addEventListener('input', () => { if (f[c].getAttribute('aria-invalid') === 'true') validarCampo(c); });
  });
  f.mayor.addEventListener('change', () => { if (f.mayor.checked) clearError('mayor'); });
  f.notas.addEventListener('input', () => { $('#n-notas').textContent = f.notas.value.length; });

  function mostrarResumenErrores(errores) {
    const n = errores.length;
    f.resErr.innerHTML = '<p class="font-bold text-error">Revisa ' + n + (n === 1 ? ' campo' : ' campos') + ' para continuar:</p><ul class="mt-2 list-disc pl-6 space-y-1">' +
      errores.map(([c, m]) => '<li><a href="#" data-campo="' + c + '">' + esc(ETIQUETAS[c]) + ': ' + esc(m) + '</a></li>').join('') + '</ul>';
    f.resErr.classList.remove('hidden');
  }
  f.resErr.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-campo]');
    if (!a) return;
    e.preventDefault();
    enfocarCampo(a.dataset.campo);
  });
  function enfocarCampo(c) {
    const el = c === 'hora' ? ($('input[name="hora"]:not(:disabled)', f.horas) || f.fecha) : f[c];
    if (el) el.focus();
  }
  function limpiarGeneral() { f.errGen.classList.add('hidden'); f.errGen.innerHTML = ''; }
  function mostrarGeneral(msg) {
    f.errGen.innerHTML = '<p class="font-bold text-error">' + esc(msg) + '</p>';
    f.errGen.classList.remove('hidden');
  }

  // ---------- Envío ----------
  function setCargando(on) {
    f.btn.disabled = on;
    f.btn.setAttribute('aria-busy', String(on));
    f.txtBtn.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Enviando…' : (huboErrorEnvio ? 'Reintentar' : 'Confirmar reserva');
  }
  let huboErrorEnvio = false;

  f.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (f.btn.disabled) return;
    limpiarGeneral();
    const errores = [];
    ORDEN.forEach((c) => { const m = validarCampo(c); if (m) errores.push([c, m]); });
    if (errores.length) {
      mostrarResumenErrores(errores);
      f.resErr.focus();
      enfocarCampo(errores[0][0]);
      return;
    }
    f.resErr.classList.add('hidden'); f.resErr.innerHTML = '';

    const p = paqueteActual();
    const datos = {
      paquete: p.slug, fecha: f.fecha.value, hora: valorHora(), personas: leerPersonas(),
      nombre: f.nombre.value.trim(), email: f.email.value.trim(), telefono: f.telefono.value.trim(),
      notas: f.notas.value.trim(), mayor_de_edad: true
    };
    setCargando(true);
    try {
      const r = await pedirJSON(API_BASE + '/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(datos) });
      if (r.status === 201 && r.cuerpo) { huboErrorEnvio = false; setCargando(false); mostrarExito(r.cuerpo, datos, p); return; }
      huboErrorEnvio = true;
      if (r.status === 400 && r.cuerpo && r.cuerpo.campos) {
        const errs = [];
        Object.keys(r.cuerpo.campos).forEach((k) => {
          const c = k === 'mayor_de_edad' ? 'mayor' : k;
          if (ORDEN.includes(c)) { setError(c, r.cuerpo.campos[k]); errs.push([c, r.cuerpo.campos[k]]); }
        });
        if (errs.length) {
          errs.sort((a, b) => ORDEN.indexOf(a[0]) - ORDEN.indexOf(b[0]));
          mostrarResumenErrores(errs); f.resErr.focus(); enfocarCampo(errs[0][0]);
        } else mostrarGeneral((r.cuerpo && r.cuerpo.error) || 'Revisa los datos e inténtalo de nuevo.');
        huboErrorEnvio = false;
      } else if (r.status === 409) {
        // Conflicto de cupo: no es un error de red, hay que elegir otra hora.
        huboErrorEnvio = false;
        mostrarGeneral('Esa hora ya no está disponible. Elige otra.');
        f.horas.querySelectorAll('input:checked').forEach((i) => { i.checked = false; });
        await cargarHorarios(true);
        actualizar();
        const primera = $('input[name="hora"]:not(:disabled)', f.horas);
        (primera || f.fecha).focus();
      } else if (r.status === 429) {
        huboErrorEnvio = false;
        const min = r.retryAfter ? Math.max(1, Math.ceil(r.retryAfter / 60)) : 0;
        mostrarGeneral('Recibimos muchos intentos desde tu conexión. ' + (min ? 'Espera ' + (min === 1 ? 'un minuto' : min + ' minutos') + ' e inténtalo otra vez.' : 'Espera unos minutos e inténtalo otra vez.'));
      } else {
        mostrarGeneral('No pudimos enviar tu reserva. Revisa tu conexión e inténtalo de nuevo. Tus datos siguen aquí.');
      }
    } catch (err) {
      huboErrorEnvio = true;
      mostrarGeneral('No pudimos enviar tu reserva. Revisa tu conexión e inténtalo de nuevo. Tus datos siguen aquí.');
    }
    setCargando(false);
    if (!f.errGen.classList.contains('hidden')) f.errGen.scrollIntoView({ behavior: reducirMov() ? 'auto' : 'smooth', block: 'center' });
  });

  function mostrarExito(res, datos, p) {
    f.form.classList.add('hidden');
    $('#exito').classList.remove('hidden');
    $('#exito-titulo').textContent = '¡Reserva recibida, ' + datos.nombre.split(/\s+/)[0] + '!';
    $('#exito-texto').textContent = 'Te enviaremos un correo a ' + datos.email + ' para confirmar tu sesión. Guarda tu código por si necesitas escribirnos.';
    const fecha = res.fecha || datos.fecha; const hora = res.hora || datos.hora; const n = res.personas || datos.personas;
    $('#x-paquete').textContent = (res.paquete && res.paquete.nombre) || p.nombre;
    $('#x-fecha').textContent = fechaBonita(fecha);
    $('#x-hora').textContent = horaBonita(String(hora).slice(0, 5));
    $('#x-personas').textContent = n;
    $('#x-total').textContent = dinero(typeof res.total_centavos === 'number' ? res.total_centavos : totalCentavos(p, n));
    $('#x-codigo').textContent = res.codigo || '';
    $('#contenedor-form').scrollIntoView({ behavior: reducirMov() ? 'auto' : 'smooth', block: 'start' });
    $('#exito-titulo').focus({ preventScroll: true });
  }
  function mostrarFormulario() {
    $('#exito').classList.add('hidden');
    f.form.classList.remove('hidden');
  }
  function reiniciar() {
    f.form.reset();
    f.personas.value = 2;
    $$('[aria-invalid]', f.form).forEach((el) => el.removeAttribute('aria-invalid'));
    $$('.error', f.form).forEach((el) => { el.hidden = true; el.textContent = ''; });
    f.resErr.classList.add('hidden'); limpiarGeneral();
    $('#n-notas').textContent = '0';
    huboErrorEnvio = false; setCargando(false);
    horarios = []; renderHoras('');
    mostrarFormulario();
    alCambiarPaquete(false);
  }
  $('#otra-reserva').addEventListener('click', () => { reiniciar(); f.paquete.focus(); });
  $('#volver-inicio').addEventListener('click', () => { reiniciar(); });

  // ---------- Menú móvil ----------
  const menu = $('#menu-movil'), btnMenu = $('#btn-menu');
  function enfocables(c) { return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', c).filter((el) => el.offsetParent !== null || el === document.activeElement); }
  function abrirMenu() {
    menu.classList.remove('hidden'); menu.classList.add('flex');
    btnMenu.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    $('#btn-cerrar-menu').focus();
  }
  function cerrarMenu(devolver) {
    menu.classList.add('hidden'); menu.classList.remove('flex');
    btnMenu.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (devolver) btnMenu.focus();
  }
  btnMenu.addEventListener('click', abrirMenu);
  $('#btn-cerrar-menu').addEventListener('click', () => cerrarMenu(true));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => cerrarMenu(false)));
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) cerrarMenu(false); });

  // ---------- Lightbox ----------
  const lb = $('#lightbox'); const minis = $$('.miniatura');
  let lbIndice = 0, lbOrigen = null;
  function pintarLb() {
    const img = $('img', minis[lbIndice]);
    $('#lb-img').src = img.src; $('#lb-img').alt = img.alt;
    $('#lb-cap').textContent = 'Obra ' + (lbIndice + 1) + ' de ' + minis.length;
  }
  function abrirLb(i) {
    lbOrigen = minis[i]; lbIndice = i; pintarLb();
    lb.classList.remove('hidden'); lb.classList.add('flex');
    document.body.style.overflow = 'hidden';
    $('#lb-cerrar').focus();
  }
  function cerrarLb() {
    lb.classList.add('hidden'); lb.classList.remove('flex');
    document.body.style.overflow = '';
    if (lbOrigen) lbOrigen.focus();
  }
  function moverLb(d) { lbIndice = (lbIndice + d + minis.length) % minis.length; pintarLb(); }
  minis.forEach((b, i) => b.addEventListener('click', () => abrirLb(i)));
  $('#lb-cerrar').addEventListener('click', cerrarLb);
  $('#lb-ant').addEventListener('click', () => moverLb(-1));
  $('#lb-sig').addEventListener('click', () => moverLb(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) cerrarLb(); });

  // Teclado global: Esc y trampa de foco
  document.addEventListener('keydown', (e) => {
    const lbAbierto = !lb.classList.contains('hidden');
    const menuAbierto = !menu.classList.contains('hidden');
    if (e.key === 'Escape') { if (lbAbierto) cerrarLb(); else if (menuAbierto) cerrarMenu(true); return; }
    if (lbAbierto) {
      if (e.key === 'ArrowLeft') moverLb(-1);
      if (e.key === 'ArrowRight') moverLb(1);
    }
    if (e.key === 'Tab' && (lbAbierto || menuAbierto)) {
      const lista = enfocables(lbAbierto ? lb : menu);
      if (!lista.length) return;
      const primero = lista[0], ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });

  // ---------- FAQ ----------
  $$('.faq-btn').forEach((b) => b.addEventListener('click', () => {
    const abierto = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!abierto));
    $('#' + b.getAttribute('aria-controls')).hidden = abierto;
    $('use', b).setAttribute('href', abierto ? '#i-mas' : '#i-menos');
  }));

  // ---------- Enlace activo en el menú ----------
  if ('IntersectionObserver' in window) {
    const enlaces = $$('header nav a.nav-link');
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        enlaces.forEach((a) => { if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['paquetes', 'como-funciona', 'galeria', 'faq', 'contacto'].forEach((id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
  }

  // ---------- Inicio ----------
  configurarFecha();
  actualizar();
  cargarPaquetes();
})();
