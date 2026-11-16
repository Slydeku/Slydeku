# Brief — Wine and Art

## Negocio
Wine and Art vende sesiones de pintura y paquetes que incluyen vino. Operan en Puerto Rico.

## Objetivo
Una página donde el cliente vea los diferentes paquetes y pueda reservar.

## Identidad visual
- Colores: rojo y tonos de vino (burgundy, merlot, rosé), con neutros cálidos.

## Páginas (one-page)
1. Inicio (hero)
2. Paquetes
3. Cómo funciona
4. Galería
5. Reservar (formulario)
6. FAQ
7. Contacto / footer

## Funciones
- **Catálogo de paquetes:** nombre, descripción, precio por persona, duración, qué incluye, mínimo y máximo de personas.
- **Formulario de reserva:** paquete, fecha, hora, cantidad de personas, nombre, email, teléfono, notas.
- **Confirmación en pantalla** al enviar la reserva.
- **Restricción de edad:** los clientes deben ser 21+ por el vino. Checkbox de confirmación de edad obligatorio en el formulario.

## Paquetes de ejemplo
Precios placeholder, pendientes de confirmar con el cliente.

| Paquete | Descripción | Duración | Precio | Incluye | Personas |
|---------|-------------|----------|--------|---------|----------|
| Pincel y Copa | Sesión básica de pintura | 2 h | $45 por persona | 1 copa de vino | Según sesión |
| Noche de Vino | Sesión de pintura con vino y picadera | 2.5 h | $65 por persona | Media botella de vino por persona y picadera | Según sesión |
| Pareja Artística | Sesión para dos con lienzo compartido | Según sesión | $120 por pareja | 1 botella de vino | 2 personas |
| Evento Privado | Grupos para eventos | Según sesión | $55 por persona | 1 botella por cada 2 personas | 8 a 20 personas |

## Stack
- **Frontend:** HTML + Tailwind CSS (CDN) + JavaScript vanilla.
- **Backend:** Node.js + Express + SQLite (better-sqlite3). El SQL debe ser compatible para migrar luego a PostgreSQL / Supabase.

## Idioma
Español (Puerto Rico).

## Pendientes con el cliente
- Precios reales de los paquetes
- Dirección del local
- Horarios
- Fotos reales para la galería
- Email y teléfono de contacto
- Métodos de pago
