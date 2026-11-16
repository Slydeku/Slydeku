# Estado del proyecto — Wine and Art

**Fase actual:** 9. GitHub (Xaden) — pendiente.

**Siguiente paso:** Xaden sube el proyecto a GitHub (commit, PR y release) **solo tras confirmación del usuario**. Antes de publicar el sitio, resolver la lista de pendientes del cliente y técnicos (abajo).

**Veredicto de pruebas:** Lucas aprobó (rondas 1 y 2) con observaciones abiertas: 0 críticos, 0 altos, 0 medios.

## Fases

| # | Fase | Responsable | Estado |
|---|------|-------------|--------|
| 1 | Brief y estructura (`docs/brief.md`, `docs/estado.md`) | Orquestador | Completada |
| 2 | Estructura de carpetas (`projects/wine-and-art/`) | Archi | Completada |
| 3 | Diseño y wireframe (`docs/diseno.md`) | Mox | Completada |
| 4 | Identidad visual y assets (`docs/identidad.md`, `assets/`) | Luna | Completada |
| 5 | Base de datos (`backend/db/`, `docs/base-de-datos.md`) y API (`backend/`, `docs/api.md`) | Violet, Dan | Completada |
| 6 | Frontend (`frontend/`) | Yin | Completada |
| 7 | Pruebas (`docs/reporte-pruebas.md`), rondas 1 y 2 | Lucas | Completada (aprobado) |
| 8 | Pasada final: README, orden de archivos, `.gitignore`, `docs/estado.md` | Archi | Completada |
| 9 | GitHub: commit, PR y release | Xaden | Pendiente (requiere confirmación del usuario) |

## Responsables actuales
- Ninguno. Proyecto en espera de confirmación para la fase 9.

## Observaciones abiertas (de `docs/reporte-pruebas.md`)
- **O1:** redes, email y teléfono son placeholders.
- **O2:** `PAQUETES_RESPALDO` en `frontend/js/app.js` duplica precios y puede quedar desactualizado. El servidor calcula el total real.
- **O3:** Tailwind por CDN no es para producción. Compilar y quitar `'unsafe-inline'` de la CSP.
- **O4:** Evento Privado comparte los 24 cupos de la sesión. Confirmar con el cliente.
- **O5:** los nombres se guardan sin escapar. Un futuro panel admin debe escapar al mostrar.
- **O7:** faltan `robots.txt`, `sitemap.xml` y `favicon.ico` (opcional).

## Pendientes del cliente (bloquean la versión final)
- Precios reales de los paquetes (hoy son placeholders en `backend/db/seed.sql`).
- Horarios y capacidad reales por sesión.
- Dirección del local.
- Fotos reales para la galería.
- Email y teléfono de contacto.
- Redes sociales (Instagram, Facebook).
- Métodos de pago.
- Dominio final.

## Pendientes técnicos antes de publicar
- Cambiar `https://wineandart.example` por el dominio real en `frontend/index.html` (canonical, og:url, og:image).
- Definir `ADMIN_TOKEN`, `CORS_ORIGIN` y `TRUST_PROXY=1` en el hosting.
- Disco persistente para la base de datos (`DB_PATH`).
- Convertir el texto de los logos a trazos.
- Decidir la fuente única de assets (`assets/` y `frontend/assets/` son copias idénticas).
- Lista completa en la sección "Antes de publicar" de `README.md`.

## Bloqueos
- Ninguno técnico. Esperando al usuario para confirmar la subida a GitHub y al cliente para los datos reales.
