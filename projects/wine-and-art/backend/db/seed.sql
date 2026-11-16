-- Datos iniciales (precios, horarios y capacidades son placeholders; ver docs/brief.md)
-- Idempotente: se puede correr mas de una vez sin duplicar.

INSERT OR IGNORE INTO paquetes
  (slug, nombre, descripcion, precio_centavos, unidad_precio, duracion_min, incluye, min_personas, max_personas, destacado, activo, orden)
VALUES
  ('pincel-y-copa', 'Pincel y Copa',
   'Nuestra sesión básica de pintura, ideal para probar.',
   4500, 'persona', 120,
   '["1 copa de vino","Lienzo, pinceles y delantal","Guía paso a paso de un instructor"]',
   1, 12, 0, 1, 1),
  ('noche-de-vino', 'Noche de Vino',
   'Pintura con vino y picadera para una noche completa.',
   6500, 'persona', 150,
   '["Media botella de vino por persona","Picadera","Lienzo, pinceles y delantal"]',
   1, 12, 1, 1, 2),
  ('pareja-artistica', 'Pareja Artística',
   'Una cita diferente: pintan juntos en un lienzo compartido.',
   12000, 'pareja', 150,
   '["1 botella de vino","Lienzo compartido, pinceles y delantales","Guía paso a paso de un instructor"]',
   2, 2, 0, 1, 3),
  ('evento-privado', 'Evento Privado',
   'Cumpleaños, despedidas o actividades de equipo, solo para tu grupo.',
   5500, 'persona', 180,
   '["1 botella de vino por cada 2 personas","Lienzo, pinceles y delantal","Instructor para tu grupo"]',
   8, 20, 0, 1, 4);

-- dia_semana: 0=dom, 4=jue, 5=vie, 6=sab
INSERT OR IGNORE INTO horarios (dia_semana, hora, capacidad, activo) VALUES
  (4, '18:00', 24, 1), (4, '20:30', 24, 1),
  (5, '18:00', 24, 1), (5, '20:30', 24, 1),
  (6, '14:00', 24, 1), (6, '18:00', 24, 1), (6, '20:30', 24, 1),
  (0, '14:00', 24, 1), (0, '18:00', 24, 1), (0, '20:30', 24, 1);
