'use strict';
const SQL_CUPOS = `
  SELECT h.hora, h.capacidad,
         h.capacidad - COALESCE((SELECT SUM(r.personas) FROM reservas r
                                 WHERE r.fecha = @fecha AND r.hora = h.hora AND r.estado <> 'cancelada'), 0) AS restantes
  FROM horarios h
  WHERE h.activo = 1 AND h.dia_semana = @dia
  ORDER BY h.hora`;

function cuposDelDia(db, fecha, dia) {
  return db.prepare(SQL_CUPOS).all({ fecha, dia });
}
module.exports = { cuposDelDia };
