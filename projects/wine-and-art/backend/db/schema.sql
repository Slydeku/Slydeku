-- Wine and Art - esquema SQLite (better-sqlite3)
-- Dan: ejecutar al abrir la conexion: PRAGMA foreign_keys = ON;  (SQLite lo trae apagado)
-- Fechas/horas en TEXT: fecha 'YYYY-MM-DD', hora 'HH:MM' (24 h, hora de America/Puerto_Rico).
-- Dinero siempre en centavos (INTEGER).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS paquetes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT    NOT NULL UNIQUE
                  CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'),
  nombre          TEXT    NOT NULL CHECK (length(nombre) BETWEEN 1 AND 80),
  descripcion     TEXT    NOT NULL DEFAULT '',
  precio_centavos INTEGER NOT NULL CHECK (precio_centavos >= 0),
  unidad_precio   TEXT    NOT NULL CHECK (unidad_precio IN ('persona', 'pareja')),
  duracion_min    INTEGER NOT NULL CHECK (duracion_min > 0),
  incluye         TEXT    NOT NULL DEFAULT '[]' CHECK (json_valid(incluye)),  -- arreglo JSON de textos
  min_personas    INTEGER NOT NULL DEFAULT 1 CHECK (min_personas >= 1),
  max_personas    INTEGER NOT NULL CHECK (max_personas >= min_personas),
  destacado       INTEGER NOT NULL DEFAULT 0 CHECK (destacado IN (0, 1)),
  activo          INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  orden           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS horarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),  -- 0=domingo ... 6=sabado (igual a strftime('%w'))
  hora       TEXT    NOT NULL CHECK (hora GLOB '[0-2][0-9]:[0-5][0-9]'),
  capacidad  INTEGER NOT NULL CHECK (capacidad > 0),               -- personas por sesion
  activo     INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  UNIQUE (dia_semana, hora)
);

CREATE TABLE IF NOT EXISTS reservas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo         TEXT    NOT NULL UNIQUE
                 CHECK (codigo GLOB 'WA-[A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9][A-Z0-9]'),
  paquete_id     INTEGER NOT NULL REFERENCES paquetes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  fecha          TEXT    NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]' AND date(fecha) = fecha),
  hora           TEXT    NOT NULL CHECK (hora GLOB '[0-2][0-9]:[0-5][0-9]'),
  personas       INTEGER NOT NULL CHECK (personas BETWEEN 1 AND 20),
  nombre         TEXT    NOT NULL CHECK (length(trim(nombre)) BETWEEN 2 AND 80),
  email          TEXT    NOT NULL CHECK (length(email) <= 254 AND email LIKE '_%@_%._%'),
  telefono       TEXT    NOT NULL CHECK (length(telefono) BETWEEN 10 AND 20),
  notas          TEXT    CHECK (notas IS NULL OR length(notas) <= 500),
  mayor_de_edad  INTEGER NOT NULL CHECK (mayor_de_edad = 1),
  total_centavos INTEGER NOT NULL CHECK (total_centavos >= 0),
  estado         TEXT    NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  creada_en      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))  -- UTC
);

CREATE INDEX IF NOT EXISTS idx_reservas_fecha_hora ON reservas (fecha, hora);
CREATE INDEX IF NOT EXISTS idx_reservas_estado     ON reservas (estado);
CREATE INDEX IF NOT EXISTS idx_reservas_paquete    ON reservas (paquete_id);
CREATE INDEX IF NOT EXISTS idx_reservas_email      ON reservas (email);
CREATE INDEX IF NOT EXISTS idx_paquetes_activo_orden ON paquetes (activo, orden);
