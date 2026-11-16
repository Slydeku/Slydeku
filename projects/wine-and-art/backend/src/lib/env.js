'use strict';
// Carga .env simple (sin dependencias). Las variables ya definidas en el entorno tienen prioridad.
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(f)) {
  for (const linea of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
