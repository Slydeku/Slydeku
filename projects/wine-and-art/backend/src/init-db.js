'use strict';
require('./lib/env');
const { openDb, resolverRuta } = require('./db');
const db = openDb(process.env.DB_PATH);
const n = db.prepare('SELECT count(*) AS n FROM paquetes').get().n;
console.log(`DB lista en ${resolverRuta(process.env.DB_PATH)} (${n} paquetes)`);
db.close();
