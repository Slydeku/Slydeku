-- Consultas de referencia para Dan (parametros con nombre de better-sqlite3: @fecha, @hora, ...)

-- 1) Cupos restantes por fecha + hora (una hora concreta).
--    Las reservas canceladas no cuentan. Devuelve NULL en capacidad si el horario no existe/esta inactivo.
SELECT h.hora,
       h.capacidad,
       COALESCE(SUM(r.personas), 0)                    AS ocupados,
       h.capacidad - COALESCE(SUM(r.personas), 0)      AS cupos_restantes
FROM horarios h
LEFT JOIN reservas r
       ON r.fecha = @fecha AND r.hora = h.hora AND r.estado <> 'cancelada'
WHERE h.dia_semana = CAST(strftime('%w', @fecha) AS INTEGER)
  AND h.hora = @hora
  AND h.activo = 1
GROUP BY h.id;

-- 2) Disponibilidad de todas las horas de una fecha (para llenar el select de Hora).
SELECT h.hora,
       h.capacidad,
       h.capacidad - COALESCE(SUM(r.personas), 0) AS cupos_restantes
FROM horarios h
LEFT JOIN reservas r
       ON r.fecha = @fecha AND r.hora = h.hora AND r.estado <> 'cancelada'
WHERE h.dia_semana = CAST(strftime('%w', @fecha) AS INTEGER)
  AND h.activo = 1
GROUP BY h.id
ORDER BY h.hora;

-- 3) Listado de reservas por fecha (SOLO uso interno/admin: contiene datos personales).
SELECT r.codigo, r.hora, p.nombre AS paquete, r.personas, r.nombre, r.email, r.telefono,
       r.notas, r.total_centavos, r.estado, r.creada_en
FROM reservas r
JOIN paquetes p ON p.id = r.paquete_id
WHERE r.fecha = @fecha
ORDER BY r.hora, r.creada_en;

-- 4) Catalogo publico de paquetes activos.
SELECT id, slug, nombre, descripcion, precio_centavos, unidad_precio, duracion_min,
       incluye, min_personas, max_personas, destacado
FROM paquetes
WHERE activo = 1
ORDER BY orden;

-- 5) Insertar reserva (Dan: hacerlo dentro de db.transaction() junto con la consulta 1,
--    y calcular total_centavos en el servidor: persona = precio*personas; pareja = precio).
-- INSERT INTO reservas (codigo, paquete_id, fecha, hora, personas, nombre, email, telefono, notas, mayor_de_edad, total_centavos)
-- VALUES (@codigo, @paquete_id, @fecha, @hora, @personas, @nombre, @email, @telefono, @notas, 1, @total_centavos);

-- 6) Buscar reserva por codigo (confirmacion).
SELECT r.codigo, p.nombre AS paquete, r.fecha, r.hora, r.personas, r.total_centavos, r.estado
FROM reservas r JOIN paquetes p ON p.id = r.paquete_id
WHERE r.codigo = @codigo;
