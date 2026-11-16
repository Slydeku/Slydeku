# Reporte de pruebas — Wine and Art (ronda 1)

**Tester:** Lucas · **Fecha:** 2026-11-16
**Veredicto: APROBADO CON OBSERVACIONES** — 0 críticos, 0 altos, 2 medios, 6 bajos.

Limitaciones del entorno (no son bugs): `cdn.tailwindcss.com` y Google Fonts bloqueados (se sirvió Tailwind v3 compilado con la misma config; fuentes de respaldo). Sin Lighthouse; rendimiento medido por peso de recursos.

## Bugs

| ID | Sev. | Dónde | Problema / cómo reproducir | Asignado |
|----|------|-------|-----------------|---------|
| B-01 | medio | `assets/logo.svg`, `assets/logo-claro.svg` (+ copias en `frontend/assets/`) | Tagline con `letter-spacing="4.5"` termina en x=400 con viewBox 380 → "PUERTO RIC". | Luna |
| B-02 | medio | `frontend/index.html` `og:image` | Ruta relativa y SVG; redes no la muestran. Usar PNG 1200x630 con URL absoluta; faltan `og:url`, `twitter:card`, `canonical`. | Yin (PNG: Luna) |
| B-03 | bajo | `frontend/js/app.js` envío | 429 muestra "Revisa tu conexión..."; debe pedir esperar unos minutos (`Retry-After`). | Yin |
| B-04 | bajo | `backend/src/rutas/reservas.js` | `rateLimit` corre antes de validar: 400/409 consumen el cupo de intentos. | Dan |
| B-05 | bajo | `frontend/css/estilos.css` | Placeholder `#9CA3AF` sobre blanco ≈2.5:1 (< 4.5:1). | Yin |
| B-06 | bajo | `frontend/index.html` `#notas` | `maxlength="600"` con contador /500; servidor rechaza >500. | Yin |
| B-07 | bajo | `frontend/index.html` enlaces redes | Objetivos táctiles de ~19 px de alto (< 44 px). | Yin |
| B-08 | bajo | `frontend/js/app.js` `huboErrorEnvio` | Tras 409 el botón dice "Reintentar" aunque hay que elegir otra hora. | Yin |

## Observaciones (no son bugs)
- O1: Redes, email y teléfono son placeholders — reemplazar antes de publicar.
- O2: `PAQUETES_RESPALDO` en `app.js` duplica precios; podría quedar desactualizado (el servidor calcula el total real).
- O3: Tailwind por CDN no es para producción: compilar y quitar `'unsafe-inline'` de la CSP.
- O4: Evento Privado comparte los 24 cupos de la sesión — confirmar con el cliente.
- O5: Nombres se guardan sin escapar; un futuro panel admin debe escapar al mostrar.
- O6: Doble llamada a `/api/disponibilidad` al elegir paquete con fecha puesta (sin impacto).
- O7: Faltan `robots.txt`, `sitemap.xml`, `favicon.ico` (opcional).

## Lo que pasó bien
- Flujo end-to-end contra la API real: reserva `WA-67M0JP`, 3 personas, $195, guardada correctamente (verificado vía admin).
- Reglas: Pareja fija 2 / $120; Evento 8–20; 409 sin cupo; 4 POST concurrentes sin sobreventa.
- Backend `npm test` 8/8; validaciones, 413, 429 con `Retry-After`, admin 401/200, cabeceras de seguridad, SQLi/XSS inofensivos.
- Sin errores JS; 360/375/768/1280 sin scroll horizontal; menú móvil, FAQ y lightbox accesibles por teclado con foco atrapado/devuelto.
- axe-core WCAG 2.1 AA: 0 violaciones. Un H1, jerarquía correcta, alt y labels completos.
- Peso de página ≈74 KB.

## Para aprobar sin observaciones
Corregir B-01 y B-02, idealmente B-03 y B-05.

---

# Ronda 2 — verificación de correcciones

**Veredicto: APROBADO CON OBSERVACIONES** — 0 críticos, 0 altos, 0 medios. B-01..B-08 y O6 verificados como corregidos.

| ID | Estado | Evidencia |
|----|--------|-----------|
| B-01 | Corregido | Tagline con `textLength="262"`, termina en x=368/380; render completo en fondo claro y oscuro. |
| B-02 | Corregido | `og:image` absoluta a `og-image.png` 1200x630 (PNG real, 200 image/png), `og:url`, `canonical`, `twitter:card`. Dominio placeholder pendiente. |
| B-03 | Corregido | 429 con `Retry-After: 600` → "Espera 10 minutos…"; botón en "Confirmar reserva". |
| B-04 | Corregido | `npm test` 11/11; 400/409 no consumen el cupo de reservas; intento 31 → 429. |
| B-05 | Corregido | Placeholder `#5E4A4E` ≈ 8:1. |
| B-06 | Corregido | `maxlength="500"`, contador 500/500. |
| B-07 | Corregido | Enlaces de redes 44 px. |
| B-08 | Corregido | 409 real: mensaje claro, horarios recargados, foco en horas, botón "Confirmar reserva". |
| O6 | Corregido | Una sola llamada a `/api/disponibilidad` por cambio. |
| B-09 (nuevo, bajo) | Corregido por el orquestador | aria-label del logo del header decía "Wine and Art" y el texto visible "Wine & Art" (WCAG 2.5.3). Cambiado a "Wine & Art, ir al inicio". |

Regresión: reserva completa a 375px contra la API real (WA-O3PDKN, $195), sin errores JS, sin scroll horizontal, axe 0 violaciones salvo B-09.

Observaciones abiertas antes de publicar: O1 (dominio, redes, email, teléfono placeholders), O3 (Tailwind por CDN / CSP `unsafe-inline`), O7 (robots.txt, sitemap.xml, favicon.ico).
