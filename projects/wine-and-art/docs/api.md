# API — Wine and Art

Base: `/api` (mismo origen que el frontend). JSON en UTF-8. Dinero en centavos. Fechas `YYYY-MM-DD`, horas `HH:MM` (24 h), zona America/Puerto_Rico. Mensajes de error en español.

## Cómo correrlo

```bash
cd backend
npm install
cp .env.example .env     # opcional; ajusta ADMIN_TOKEN, etc.
npm start                # http://localhost:3000 (API + frontend estático de ../frontend)
npm run dev              # con recarga
npm run db:init          # crea la DB con schema + seed (también se hace solo al arrancar)
npm test                 # pruebas (node:test, DB temporal)
```

Variables (`backend/.env.example`): `PORT`, `DB_PATH`, `CORS_ORIGIN` (lista separada por comas; vacío = solo mismo origen), `ADMIN_TOKEN` (vacío = admin deshabilitado), `TRUST_PROXY`, `RATE_LIMIT_MAX`, `RATE_LIMIT_ATTEMPTS_MAX`.

## GET /api/paquetes
Paquetes activos, por orden. **200**
```json
[{"id":1,"slug":"pincel-y-copa","nombre":"Pincel y Copa","descripcion":"...","precio_centavos":4500,
  "unidad_precio":"persona","duracion_min":120,"incluye":["1 copa de vino"],
  "min_personas":1,"max_personas":12,"destacado":false}]
```
```bash
curl localhost:3000/api/paquetes
```

## GET /api/disponibilidad?fecha=YYYY-MM-DD&paquete=<slug>
**200**
```json
{"fecha":"2026-12-03","horarios":[{"hora":"18:00","cupos_restantes":24,"disponible":true},
                                  {"hora":"20:30","cupos_restantes":1,"disponible":false}]}
```
- `disponible = cupos_restantes >= min_personas` del paquete.
- `horarios: []` si el día no abre o la fecha está fuera de rango (mañana a 6 meses).
- La capacidad por sesión es compartida entre paquetes.
- **400** `{"error":"..."}` si la fecha es inválida o el paquete no existe.

```bash
curl "localhost:3000/api/disponibilidad?fecha=2026-12-03&paquete=noche-de-vino"
```

## POST /api/reservas
Body JSON (máx. 10 KB):
```json
{"paquete":"noche-de-vino","fecha":"2026-12-03","hora":"18:00","personas":2,"nombre":"Ana Pérez",
 "email":"ana@correo.com","telefono":"787-555-0123","notas":"Cumpleaños","mayor_de_edad":true}
```
**201**
```json
{"codigo":"WA-K3F9QX","paquete":{"nombre":"Noche de Vino"},"fecha":"2026-12-03","hora":"18:00",
 "personas":2,"total_centavos":13000,"estado":"pendiente"}
```
**400** `{"error":"Revisa los campos marcados.","campos":{"telefono":"Escribe un teléfono de 10 dígitos, ej. 787-555-0123."}}`
Campos posibles: `paquete, fecha, hora, personas, nombre, email, telefono, notas, mayor_de_edad`.

Reglas: paquete activo existente; fecha de mañana a 6 meses con sesiones ese día; hora existente en el horario del día; `personas` entero dentro de min/max del paquete (leído de la BD); nombre 2-80; email válido; teléfono 10 dígitos (acepta espacios, guiones, paréntesis, +1; se guarda normalizado); notas opcional ≤ 500; `mayor_de_edad` debe ser `true` (booleano). El total lo calcula el servidor (persona: precio x personas; pareja: precio fijo).

Otros errores: **409** `{"error":"Esa hora ya no está disponible. Elige otra."}` (sin cupo); **413** body muy grande; **429** demasiados intentos (ver "Rate limit" abajo; cabecera `Retry-After` en segundos); **5xx** `{"error":"Error del servidor. Intenta de nuevo más tarde."}` (el detalle solo va al log).

```bash
curl -X POST localhost:3000/api/reservas -H 'Content-Type: application/json' \
  -d '{"paquete":"noche-de-vino","fecha":"2026-12-03","hora":"18:00","personas":2,"nombre":"Ana Pérez","email":"ana@correo.com","telefono":"787-555-0123","notas":"","mayor_de_edad":true}'
```

## GET /api/admin/reservas?fecha=YYYY-MM-DD
Header `Authorization: Bearer <ADMIN_TOKEN>`. Sin `fecha` devuelve hasta 500 reservas. Si `ADMIN_TOKEN` no está configurado el endpoint siempre responde 401.
**200** `{"reservas":[{"codigo","paquete":"slug","paquete_nombre","fecha","hora","personas","nombre","email","telefono","notas","total_centavos","estado","creada_en"}]}`
**401** `{"error":"No autorizado."}` · **400** fecha inválida.
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" "localhost:3000/api/admin/reservas?fecha=2026-12-03"
```

## Rate limit y TRUST_PROXY
`POST /api/reservas` tiene dos límites por IP, en memoria, ventana de 15 min:
- **Reservas creadas:** máximo `RATE_LIMIT_MAX` (10). Solo cuentan las respuestas **201**; los errores 400 (validación) y 409 (sin cupo) no consumen este límite, así que quien se equivoca puede corregir y reintentar.
- **Intentos totales (anti-abuso):** máximo `RATE_LIMIT_ATTEMPTS_MAX` (30), cuentan todas las peticiones válidas o no.

Al superar cualquiera: **429** `{"error":"Demasiados intentos. Intenta de nuevo en unos minutos."}` con cabecera `Retry-After` (segundos hasta que se reinicia la ventana). El frontend debe leerla.

`TRUST_PROXY`: vacío por defecto (se usa la IP del socket). Pon `TRUST_PROXY=1` cuando el servidor corra detrás de un proxy (Render, etc.) para que Express lea la IP real de `X-Forwarded-For`; sin esto todos los clientes comparten una IP y se bloquean entre sí. No lo actives si el servidor está expuesto directamente: cualquiera podría falsificar la cabecera y evadir el límite. Los contadores se reinician al reiniciar el servidor.

## Seguridad
Consultas parametrizadas; JSON limitado a 10 KB; cabeceras (nosniff, X-Frame-Options, Referrer-Policy) y CSP propia que permite `cdn.tailwindcss.com`, Google Fonts y `'unsafe-inline'` (lo requiere el CDN de Tailwind; quitarlo al compilar Tailwind en producción). Rutas `/api/*` desconocidas devuelven 404 JSON.
