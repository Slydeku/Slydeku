# Wine and Art

Página web de Wine and Art, negocio de sesiones de pintura con vino en Puerto Rico. Permite ver los paquetes y reservar en línea. Solo para mayores de 21 años (confirmación obligatoria en el formulario).

Estado: pruebas de Lucas aprobadas con observaciones abiertas (ver [`docs/reporte-pruebas.md`](docs/reporte-pruebas.md)). Pendiente de subir a GitHub y publicar.

## Stack
- **Frontend:** HTML + Tailwind CSS (CDN por ahora) + JavaScript vanilla
- **Backend:** Node.js (>= 20) + Express + SQLite (better-sqlite3)
- **Base de datos:** SQLite; el SQL está escrito para poder migrar a PostgreSQL / Supabase

## Cómo correr el proyecto

```bash
cd backend
npm install
npm start
```

Abre http://localhost:3000. El mismo servidor sirve el frontend (`frontend/`) y la API (`/api`).

- **Base de datos:** se crea sola en `backend/data/wine-and-art.db` la primera vez que arranca, con el esquema y los datos de ejemplo (`backend/db/schema.sql` y `seed.sql`). La carpeta `backend/data/` está en `.gitignore`.
- **Configuración opcional:** copia `backend/.env.example` a `backend/.env` y ajusta las variables (puerto, ruta de la BD, `ADMIN_TOKEN`, `CORS_ORIGIN`, `TRUST_PROXY`, límites de reservas). Sin `.env` el proyecto arranca con los valores por defecto. Nunca subas `.env` a git.
- **Pruebas:** `cd backend && npm test` (node:test, 11 pruebas de la API).
- **Desarrollo:** `npm run dev` reinicia el servidor al cambiar archivos.

## Estructura

```
wine-and-art/
├── README.md
├── .gitignore
├── docs/                 documentación del proyecto
│   ├── brief.md              brief del cliente
│   ├── diseno.md             arquitectura del sitio y wireframe
│   ├── identidad.md          paleta, tipografía y concepto visual
│   ├── base-de-datos.md      modelo de datos
│   ├── api.md                endpoints de la API
│   ├── reporte-pruebas.md    reportes de Lucas (rondas 1 y 2)
│   └── estado.md             avance, responsables y pendientes
├── assets/               logos, favicon, imagen OG y galería (fuente)
├── frontend/             sitio público que sirve Express
│   ├── index.html
│   ├── css/estilos.css
│   ├── js/app.js
│   └── assets/           copia de assets/ que se sirve al público
└── backend/
    ├── package.json
    ├── .env.example
    ├── db/               schema.sql, seed.sql, consultas.sql
    ├── src/
    │   ├── server.js         arranque
    │   ├── app.js            rutas, cabeceras de seguridad y CSP
    │   ├── db.js             apertura y creación de la BD
    │   ├── init-db.js        script `npm run db:init`
    │   ├── rutas/            paquetes, disponibilidad, reservas, admin
    │   └── lib/              cupos, fechas, env
    └── test/api.test.js
```

## Antes de publicar

Pendientes técnicos y de contenido. Varios dependen de datos que el cliente aún no ha confirmado.

**Contenido y datos del cliente**
- [ ] Precios, horarios y capacidad reales en la BD. Los de `backend/db/seed.sql` son placeholders. La BD ya creada no se actualiza sola: hay que editarla directamente o recrearla.
- [ ] Dirección, horarios, fotos reales para la galería, métodos de pago.
- [ ] Datos de contacto: en `frontend/index.html` aparecen `info@wineandart.example`, el teléfono `+17875550123` y el texto "[por confirmar]". Confirmar el teléfono de 10 dígitos que valida `frontend/js/app.js`.
- [ ] Redes sociales: los enlaces de Instagram y Facebook en `frontend/index.html` apuntan a `#contacto` (placeholder).
- [ ] Evento Privado: confirmar si comparte los 24 cupos de la sesión (observación O4).

**Dominio y SEO**
- [ ] Cambiar `https://wineandart.example` por el dominio real en `frontend/index.html` (`canonical`, `og:url`, `og:image`). El TODO está en el mismo archivo.
- [ ] Crear `robots.txt` y `sitemap.xml` (observación O7). `favicon.ico` es opcional.

**Assets**
- [ ] Convertir el texto del logo (`assets/logo.svg`, `logo-claro.svg`, `logo-mono.svg`) a trazos para que no dependa de las fuentes instaladas.
- [ ] Revisar la duplicación `assets/` y `frontend/assets/`: son copias idénticas. Decidir cuál es la fuente y mantener solo una copia servida, o automatizar la copia.

**Producción y seguridad**
- [ ] Definir `ADMIN_TOKEN` con un valor largo. Sin él, `/api/admin` queda deshabilitado. Ejemplo para generarlo: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- [ ] Definir `CORS_ORIGIN` con el dominio final, si el frontend y la API se separan en hosts distintos.
- [ ] Definir `TRUST_PROXY=1` en Render (u otro proxy) para que el límite de reservas vea la IP real del cliente.
- [ ] Montar un disco persistente y apuntar `DB_PATH` a él. Sin disco, SQLite se borra en cada despliegue.
- [ ] Compilar Tailwind (quitar el CDN `cdn.tailwindcss.com` de `frontend/index.html`) y quitar `'unsafe-inline'` de `script-src` y `style-src` en la CSP de `backend/src/app.js`.
- [ ] Escapar nombres y notas al mostrarlos en un futuro panel admin (observación O5).

## Documentación relacionada
- [`docs/estado.md`](docs/estado.md): fase actual, responsables y pendientes del cliente
- [`docs/reporte-pruebas.md`](docs/reporte-pruebas.md): bugs y observaciones abiertas
