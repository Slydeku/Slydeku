# Diseño — Wine and Art

Autor: Mox (UX/UI). Versión 1.0. Idioma: español (Puerto Rico). Mobile-first, accesibilidad WCAG 2.1 AA.
Todos los precios, horarios, capacidades, dirección y contacto son **placeholders** pendientes de confirmar con el cliente (ver brief).

---

## 1. Objetivo del sitio y público

**Objetivo:** que la persona vea los paquetes, elija uno y reserve su sesión en menos de 2 minutos desde el celular.

**Métrica principal:** reservas enviadas. Secundarias: clics en "Reservar" desde tarjetas, clics a WhatsApp/teléfono.

**Público:**
- Parejas buscando una cita diferente (Pareja Artística).
- Amigas/os y grupos pequeños (Pincel y Copa, Noche de Vino).
- Organizadoras de cumpleaños, despedidas y eventos de empresa (Evento Privado, 8 a 20).
- Todos 21+ por el vino. Llegan sobre todo por celular (Instagram/WhatsApp), tecnología básica.

**Principios:** una sola acción clara por pantalla, precios visibles sin entrar a otra página, formulario corto, tono cálido y relajado ("no necesitas saber pintar").

---

## 2. Mapa del sitio (one-page)

Navegación por anclas. Orden y IDs de sección:

| # | Sección | ID ancla | Propósito |
|---|---------|----------|-----------|
| 1 | Inicio / Hero | `#inicio` | Propuesta de valor + CTA |
| 2 | Paquetes | `#paquetes` | Catálogo, CTA por tarjeta |
| 3 | Cómo funciona | `#como-funciona` | 4 pasos, quitar miedo |
| 4 | Galería | `#galeria` | Prueba social/visual (6 obras) |
| 5 | Reservar | `#reservar` | Formulario |
| 6 | FAQ | `#faq` | Resolver dudas |
| 7 | Contacto / footer | `#contacto` | Datos, redes, aviso 21+ |

**Header (sticky):** logo (izq.), enlaces: Paquetes, Cómo funciona, Galería, FAQ, Contacto; botón "Reservar" (der.). En móvil: logo + botón "Reservar" + botón menú (hamburguesa). Altura 64px.
Además: barra fija inferior en móvil NO; el botón Reservar del header ya cumple esa función.

---

## 3. Wireframes por sección

Leyenda: `[ Botón ]`, `( ) radio`, `[x] checkbox`, `▢` imagen, `—` texto.

### 3.1 Header

Desktop (≥1024px)
```
┌────────────────────────────────────────────────────────────────────┐
│ ▢ logo.svg     Paquetes  Cómo funciona  Galería  FAQ  Contacto  [Reservar] │
└────────────────────────────────────────────────────────────────────┘
```
Móvil (<768px)
```
┌──────────────────────────────┐
│ ▢ logo      [Reservar]  [☰]  │
└──────────────────────────────┘
 (☰ abre panel a pantalla completa con los enlaces, 56px por ítem)
```

### 3.2 Inicio / Hero (`#inicio`)

Desktop
```
┌────────────────────────────────────────────────────────────────────┐
│  Pintura + vino                      ┌──────────────────────┐      │
│  H1: Pinta, brinda y                 │                      │      │
│  crea algo tuyo                      │   ▢ hero.svg         │      │
│  Sub: Sesiones de pintura guiadas…   │                      │      │
│  [Ver paquetes]  [Reservar ahora]    └──────────────────────┘      │
│  Solo 21+ · Todo el material incluido                              │
└────────────────────────────────────────────────────────────────────┘
```
Móvil (orden vertical)
```
┌──────────────────────┐
│ Etiqueta: Pintura+vino│
│ H1                   │
│ Subtítulo            │
│ [Reservar ahora]     │  (ancho completo, 52px)
│ [Ver paquetes]       │  (secundario)
│ ▢ hero.svg (16:10)   │
│ Solo 21+ · Material  │
└──────────────────────┘
```

### 3.3 Paquetes (`#paquetes`)

Desktop: 4 tarjetas en fila (grid 4 col) o 2x2 entre 768–1023px.
```
 H2: Elige tu experiencia      Sub: Todos incluyen lienzo, pinceles y guía.
┌─────────┐┌─────────┐┌─────────┐┌─────────┐
│ ▢ icono ││ ▢ icono ││ ▢ icono ││ ▢ icono │
│ Nombre  ││ Nombre  ││ Nombre  ││ Nombre  │
│ Desc.   ││ Desc.   ││ Desc.   ││ Desc.   │
│ $45     ││ $65     ││ $120    ││ $55     │
│ /persona││ /persona││ /pareja ││ /persona│
│ ⏱ 2 h  ││ ⏱ 2.5 h││ ⏱ 2 h*  ││ ⏱ 3 h*  │
│ 👥 1–12 ││ 👥 1–12 ││ 👥 2    ││ 👥 8–20 │
│ ✓ Incluye││ ✓ …    ││ ✓ …     ││ ✓ …     │
│[Reservar]││[Reservar]││[Reservar]││[Reservar]│
└─────────┘└─────────┘└─────────┘└─────────┘
```
(* duración "Según sesión" en el brief; mostrar "Duración según sesión" si no hay valor confirmado. No inventar en producción.)

Móvil: tarjetas apiladas, 1 columna, ancho completo, gap 16px. Alternativa aceptable: carrusel con scroll-snap, pero **preferida la lista apilada** (más accesible).

Tarjeta (anatomía, de arriba a abajo):
1. Icono (assets/icons) 48px en círculo rosé.
2. Nombre (H3, serif).
3. Descripción (1–2 líneas).
4. Precio grande + unidad ("por persona" / "por pareja").
5. Fila de datos: duración, personas (mín–máx).
6. Lista "Incluye" (2–3 ítems con check).
7. Botón primario "Reservar este paquete" (ancho completo de tarjeta).
Distintivo opcional "Más popular" en Noche de Vino (decisión de diseño, confirmar con cliente).

### 3.4 Cómo funciona (`#como-funciona`)

Desktop: 4 columnas con línea conectora.
```
 H2: Así de fácil
 ①▢calendario   ②▢paleta      ③▢pincel      ④▢copa
 Reserva        Llega y       Pinta con     Brinda y
                elige lienzo  guía           llévate tu obra
```
Móvil: lista vertical, icono a la izquierda (56px) y texto a la derecha, número visible como texto.
Cierre: `[Reservar mi sesión]`.

### 3.5 Galería (`#galeria`)

Desktop: grid 3x2 de `obra-1..6.svg`, relación 4:5, esquinas 12px.
Móvil: grid 2 columnas x 3 filas (gap 8px). Sin carrusel automático.
Clic/tap abre lightbox (opcional, ver notas para Yin): imagen grande, botón cerrar 44px, flechas anterior/siguiente, Esc cierra.
Pie: "Obras creadas por nuestros invitados. Tú serás el próximo." + enlace a Instagram (placeholder).

### 3.6 Reservar (`#reservar`)

Desktop: 2 columnas. Izquierda (5/12): resumen sticky de la reserva (paquete, precio, total estimado). Derecha (7/12): formulario.
```
 H2: Reserva tu sesión
┌ Resumen (sticky) ──────┐ ┌ Formulario ───────────────────────────┐
│ Pincel y Copa          │ │ 1. Tu experiencia                     │
│ 2 h · 1 copa de vino   │ │   Paquete ▾ [ Pincel y Copa        ]  │
│ $45 x 2 personas      │ │   Fecha     [ dd/mm/aaaa ]            │
│ Total est.: $90        │ │   Hora      ( )6:00 pm ( )8:30 pm     │
│ Fecha: —  Hora: —      │ │   Personas  [-] 2 [+]  (mín 1, máx 12)│
└────────────────────────┘ │ 2. Tus datos                          │
                           │   Nombre / Email / Teléfono / Notas   │
                           │ 3. Confirmación                       │
                           │   [x] Confirmo que todas las personas │
                           │       tienen 21 años o más            │
                           │   [ Confirmar reserva ]               │
                           └───────────────────────────────────────┘
```
Móvil: una columna. Resumen como bloque colapsable **arriba del botón de envío** (no sticky arriba, para no ocupar pantalla). Secciones del formulario con encabezados "1. Tu experiencia", "2. Tus datos", "3. Confirmar".

Éxito (reemplaza al formulario, mismo contenedor, foco movido al título):
```
┌──────────────────────────────────────┐
│ ✓ ¡Reserva recibida!                 │
│ Gracias, María. Te escribimos a      │
│ maria@correo.com para confirmar.     │
│ ─ Resumen ───────────────────────    │
│ Paquete: Noche de Vino               │
│ Fecha: sáb., 5 dic. 2026 · 8:30 pm   │
│ Personas: 4                          │
│ Total estimado: $260                 │
│ Código: WA-XXXXXX                    │
│ ──────────────────────────────────   │
│ [Hacer otra reserva] [Volver al inicio]│
└──────────────────────────────────────┘
```

### 3.7 FAQ (`#faq`)

Acordeón de una columna (máx. 760px de ancho, centrado). Cada pregunta es un botón de ≥56px de alto. Se permite abrir varias a la vez. Primera pregunta cerrada por defecto.

### 3.8 Contacto / Footer (`#contacto`)

Desktop: 3 columnas sobre fondo vino oscuro.
```
 ▢ logo (versión clara)    Contacto            Horario
 Pintura + vino en PR      📍 [Dirección]      Jue–Dom (ver reserva)
 Redes: IG · FB            ✉ [email]  ☎ [tel]  WhatsApp [tel]
 ────────────────────────────────────────────────────────
 © 2026 Wine and Art · Solo 21+ · Bebe con responsabilidad
```
Móvil: columnas apiladas; enlaces de teléfono/email con altura táctil 48px (`tel:` y `mailto:`).

---

## 4. Flujo de reserva

```
Visitante llega (#inicio)
   │  CTA hero / header
   ▼
#paquetes ── compara tarjetas ── [Reservar este paquete]
   │                               (en tarjeta X)
   ▼
#reservar: scroll suave, el paquete X queda PRESELECCIONADO,
           el resumen se actualiza; foco al campo Fecha
   ▼
Fecha → Hora (según día) → Personas (límites del paquete)
   ▼
Datos: nombre, email, teléfono, notas (opcional)
   ▼
Checkbox 21+ (obligatorio)
   ▼
[Confirmar reserva] → validación
   ├─ con errores: resumen de errores arriba + foco al primer campo inválido
   └─ ok: estado "Enviando…" (botón deshabilitado) → POST a la API de Dan
          ├─ error de red/servidor: mensaje no destructivo, datos conservados, [Reintentar]
          └─ éxito: pantalla de confirmación con resumen + código
```
Si el visitante entra por "Reservar" del header/hero (sin paquete): el campo Paquete queda vacío con placeholder "Elige un paquete".
Cambiar paquete en el select actualiza límites de personas, precio y resumen; si las personas quedan fuera del rango nuevo, se ajustan al límite más cercano y se anuncia el cambio (aria-live).

### Reglas de datos por paquete (placeholders)

| Paquete (value) | Precio | Unidad | Mín | Máx |
|-----------------|--------|--------|-----|-----|
| `pincel-y-copa` | 45 | persona | 1 | 12 |
| `noche-de-vino` | 65 | persona | 1 | 12 |
| `pareja-artistica` | 120 | pareja | 2 | 2 |
| `evento-privado` | 55 | persona | 8 | 20 |

Total estimado: por persona = precio × personas; por pareja = precio fijo. Siempre rotular "Total estimado" (pagos por definir).
Nota: el brief dice "según sesión" para mín/máx de Pincel y Copa/Noche de Vino; 1–12 es supuesto de diseño. Dan debe leer estos valores de la BD (no hardcodear) para que sean editables.

### Horarios disponibles (placeholder)

| Día | Horas |
|-----|-------|
| Lun–mié | No disponible |
| Jue, vie | 6:00 pm, 8:30 pm |
| Sáb, dom | 2:00 pm, 6:00 pm, 8:30 pm |

Evento Privado: mismas horas placeholder; el cliente puede pedir otro horario en Notas.

### Validaciones del formulario

Se validan al enviar y, por campo, al salir del campo (blur). Errores se limpian al corregir.

| Campo | Regla | Mensaje (es-PR) |
|-------|-------|-----------------|
| Paquete | Requerido | "Elige un paquete para continuar." |
| Fecha | Requerida; ≥ mañana (hoy no se permite); máx. 6 meses adelante; debe caer jue–dom | "Elige una fecha a partir de mañana." / "Ese día no tenemos sesiones. Elige de jueves a domingo." / "Solo aceptamos reservas hasta 6 meses por adelantado." |
| Hora | Requerida; debe pertenecer a las horas del día elegido. Al cambiar la fecha se limpia la hora si ya no es válida | "Elige una hora disponible." |
| Personas | Entero; mín/máx del paquete | "Este paquete es para 8 a 20 personas." / "Pareja Artística es para 2 personas." |
| Nombre | Requerido, 2–80 caracteres | "Escribe tu nombre." |
| Email | Requerido, formato válido | "Escribe un correo válido, ej. nombre@correo.com." |
| Teléfono | Requerido; 10 dígitos (acepta espacios, guiones, paréntesis; PR: 787/939) | "Escribe un teléfono de 10 dígitos, ej. 787-555-0123." |
| Notas | Opcional, máx. 500 caracteres, contador visible | "Máximo 500 caracteres." |
| 21+ | Checkbox obligatorio | "Debes confirmar que todas las personas tienen 21 años o más." |

Notas técnicas:
- Fecha: usar `<input type="date">` con `min` = mañana y `max`; validar día de la semana con JS (la zona horaria de PR, America/Puerto_Rico, evitar bug de UTC al parsear la fecha).
- El servidor debe repetir **todas** las validaciones (Dan); el front no es suficiente.
- Si hora/fecha ya no está disponible en servidor: "Esa hora ya no está disponible. Elige otra."

---

## 5. Copy (español de Puerto Rico)

Tono: cálido, cercano, sin tecnicismos. Uso de "tú".

### Header
- Enlaces: Paquetes · Cómo funciona · Galería · FAQ · Contacto
- CTA: **Reservar**

### Hero
- Etiqueta: Pintura + vino en Puerto Rico
- H1: **Pinta, brinda y crea algo tuyo**
- Subtítulo: Sesiones de pintura guiadas con vino. No necesitas saber pintar, solo ganas de pasarla bien.
- CTA primario: **Reservar ahora**
- CTA secundario: Ver paquetes
- Nota: Solo para mayores de 21 años · Materiales incluidos

### Paquetes
- H2: **Elige tu experiencia**
- Subtítulo: Todos los paquetes incluyen lienzo, pinceles, delantal y un instructor que te guía paso a paso.
- Tarjetas (precios placeholder):
  - **Pincel y Copa** — "Nuestra sesión básica de pintura, ideal para probar." $45 por persona · 2 h · Incluye: 1 copa de vino. Personas: 1 a 12.
  - **Noche de Vino** — "Pintura con vino y picadera para una noche completa." $65 por persona · 2.5 h · Incluye: media botella de vino por persona y picadera. Personas: 1 a 12.
  - **Pareja Artística** — "Una cita diferente: pintan juntos en un lienzo compartido." $120 por pareja · Duración según sesión · Incluye: 1 botella de vino. 2 personas.
  - **Evento Privado** — "Cumpleaños, despedidas o actividades de equipo, solo para tu grupo." $55 por persona · Duración según sesión · Incluye: 1 botella por cada 2 personas. 8 a 20 personas.
- CTA de cada tarjeta: **Reservar este paquete**
- Nota al pie: Precios sujetos a confirmación. Los precios no incluyen impuestos ni propina. *(placeholder, validar con cliente)*

### Cómo funciona
- H2: **Así de fácil**
- Paso 1 (calendario): **Reserva tu fecha** — Elige paquete, día y hora. Te confirmamos por correo.
- Paso 2 (paleta): **Llega y escoge tu estilo** — Te recibimos con tu lienzo y tu paleta de colores.
- Paso 3 (pincel): **Pinta con guía** — Paso a paso, sin presión. Todos terminan con una obra.
- Paso 4 (copa): **Brinda y llévate tu obra** — Disfruta tu vino y llévate tu creación a casa.
- CTA: **Reservar mi sesión**

### Galería
- H2: **Obras de nuestras sesiones**
- Subtítulo: Cada lienzo es único. El tuyo también lo será.
- Pie: ¿Quieres ver más? Síguenos en Instagram. *(enlace placeholder)*

### Reservar
- H2: **Reserva tu sesión**
- Subtítulo: Completa el formulario y te confirmamos por correo. Toma menos de 2 minutos.
- Grupo 1: **Tu experiencia**
  - Etiquetas: Paquete · Fecha · Hora · Cantidad de personas
  - Ayuda fecha: Sesiones de jueves a domingo.
  - Ayuda hora: Elige primero la fecha para ver las horas disponibles.
  - Ayuda personas: Mínimo X, máximo Y para este paquete. (dinámico)
- Grupo 2: **Tus datos**
  - Etiquetas: Nombre completo · Correo electrónico · Teléfono · Notas (opcional)
  - Placeholder notas: ¿Alergias, una ocasión especial o algo que debamos saber?
- Grupo 3: **Confirmar**
  - Checkbox: Confirmo que todas las personas que asistirán tienen 21 años o más.
  - Aviso: Se pedirá identificación al llegar.
  - Botón: **Confirmar reserva** (cargando: "Enviando…")
- Éxito: H3 **¡Reserva recibida, {nombre}!** — "Te enviaremos un correo a {email} para confirmar tu sesión. Guarda tu código por si necesitas escribirnos."
  - Etiquetas del resumen: Paquete · Fecha · Hora · Personas · Total estimado · Código de reserva
  - Botones: Hacer otra reserva · Volver al inicio
- Error de envío: "No pudimos enviar tu reserva. Revisa tu conexión e inténtalo de nuevo. Tus datos siguen aquí." Botón: **Reintentar**
- Resumen de errores (arriba del formulario): "Revisa {n} campo(s) para continuar:" + lista de enlaces a cada campo.

### FAQ
- H2: **Preguntas frecuentes**
1. **¿Necesito saber pintar?** — Para nada. Un instructor te guía paso a paso y todos terminan con una obra.
2. **¿Hay que tener 21 años?** — Sí. Por el vino, todas las personas deben tener 21 años o más y pedimos identificación al llegar.
3. **¿Qué incluye el precio?** — Lienzo, pinceles, pintura, delantal, guía del instructor y el vino o la picadera según el paquete que elijas.
4. **¿Cuántas personas pueden venir?** — Depende del paquete: Pareja Artística es para 2 y Evento Privado, de 8 a 20. Revisa el mínimo y el máximo en cada tarjeta.
5. **¿Puedo cambiar o cancelar mi reserva?** — Escríbenos con anticipación y buscamos otra fecha. *(política por confirmar con el cliente)*
6. **¿Cómo se paga?** — Te confirmamos los métodos de pago por correo cuando recibamos tu reserva. *(por confirmar con el cliente)*

### Contacto / footer
- H2 (visualmente oculto o pequeño): Contacto
- Texto: ¿Dudas? Escríbenos y te ayudamos.
- Datos placeholder: Dirección: [por confirmar] · Correo: [por confirmar] · Teléfono/WhatsApp: [por confirmar]
- Legal: © 2026 Wine and Art. Solo para mayores de 21 años. Disfruta con responsabilidad.

---

## 6. Guía de estilo y componentes

### 6.1 Color (tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-vino-950` | `#2B0A12` | Fondo footer, texto sobre claros muy fuertes |
| `--color-vino-800` | `#5C1020` | Hover botón primario, titulares |
| `--color-vino-700` | `#7A1B2D` | **Primario** (botones, enlaces, foco) |
| `--color-rojo-600` | `#B3202F` | Acento (precios, detalles, badges) |
| `--color-rose-300` | `#F0B8C0` | Acento suave sobre fondo oscuro |
| `--color-rose-100` | `#F9E3E6` | Fondos de iconos, chips, errores suaves |
| `--color-crema-50` | `#FBF6F0` | **Fondo base** de página |
| `--color-arena-200` | `#EADFD3` | Secciones alternas, bordes |
| `--color-ink-900` | `#2A1A1D` | **Texto principal** |
| `--color-ink-600` | `#6A565A` | Texto secundario |
| `--color-white` | `#FFFFFF` | Tarjetas, campos |
| `--color-ok-700` | `#1F6B3A` | Éxito |
| `--color-error-700` | `#A4122B` | Errores (siempre con icono y texto) |

Contrastes (aprox., Yin/Lucas verificar con herramienta):
- ink-900 sobre crema-50: ~15:1 (AAA).
- ink-600 sobre crema-50: ~5.9:1 (AA texto normal).
- Blanco sobre vino-700: ~11:1. Blanco sobre rojo-600: ~6.4:1.
- vino-700 sobre crema-50 (enlaces): ~10:1.
- rose-300 sobre vino-950: ~10:1.
- Prohibido: texto rosé/rose-300 sobre fondos claros; ink-600 sobre arena-200 en tamaños <16px (usar ink-900).
- No comunicar estado solo con color: errores con icono + texto.

Configuración Tailwind sugerida (Yin): extender `theme.colors` con estos nombres (`vino`, `rojo`, `rose`, `crema`, `arena`, `ink`).

### 6.2 Tipografía (Google Fonts)

- Títulos: **Playfair Display** (600, 700). Elegante, buena legibilidad en tamaños grandes.
- Texto/UI: **Inter** (400, 500, 600). Muy legible en móvil.
- Cargar con `display=swap`, solo los pesos indicados, `preconnect` a fonts.googleapis/gstatic. Fallbacks: `Georgia, serif` y `system-ui, sans-serif`.

| Rol | Móvil | Desktop | Fuente / peso | Interlineado |
|-----|-------|---------|---------------|--------------|
| H1 | 36px | 56px | Playfair 700 | 1.1 |
| H2 | 28px | 40px | Playfair 700 | 1.2 |
| H3 | 22px | 24px | Playfair 600 | 1.3 |
| Cuerpo | 17px | 18px | Inter 400 | 1.6 |
| Pequeño/ayuda | 15px | 15px | Inter 400 | 1.5 |
| Botón / etiqueta | 16px | 16px | Inter 600 | 1 |
| Precio | 36px | 40px | Playfair 700, color rojo-600 | 1 |

Nunca menos de 15px. Longitud de línea máx. ~70 caracteres. Texto alineado a la izquierda (centrado solo en titulares cortos).

### 6.3 Grid, espaciado y layout

- Escala de espaciado (base 4px): 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Contenedor: máx. 1200px, padding lateral 16px (móvil), 24px (tablet), 32px (desktop).
- Grid: 4 col (móvil), 8 col (tablet 768+), 12 col (desktop 1024+), gap 16/24/24px.
- Breakpoints: 640, 768, 1024, 1280 (mobile-first, `min-width`).
- Padding vertical de sección: 64px móvil, 96px desktop. Alternar fondos crema-50 / arena-200 / blanco; Contacto en vino-950.
- Radios: campos y botones 10px, tarjetas 16px, chips 999px.
- Sombra tarjeta: `0 2px 8px rgba(43,10,18,.08)`; hover: `0 8px 24px rgba(43,10,18,.14)`.

### 6.4 Botones

| Tipo | Fondo | Texto | Borde | Uso |
|------|-------|-------|-------|-----|
| Primario | vino-700 | blanco | — | Una por vista: Reservar, Confirmar |
| Secundario | transparente | vino-700 | 2px vino-700 | Ver paquetes |
| Sobre oscuro | blanco | vino-800 | — | En footer/hero oscuro |
| Enlace | — | vino-700 subrayado | — | Textos |

- Alto mínimo 48px (nunca <44px), padding horizontal 24px, ancho completo en móvil para CTAs de formulario/tarjeta.
- Estados: hover primario vino-800; active vino-950 y `translateY(1px)`; disabled fondo `#CBB9BC` con texto ink-900 al 70% y cursor `not-allowed` (el texto disabled está exento de contraste, pero debe seguir legible); loading con spinner y texto "Enviando…" + `aria-busy="true"`.
- Separación mínima entre objetivos táctiles: 8px.

### 6.5 Tarjetas

- Fondo blanco, borde 1px arena-200, radio 16px, padding 24px, sombra tarjeta.
- Misma altura en la fila (flex, botón alineado abajo con `mt-auto`).
- Hover (solo desktop): sombra elevada. Toda interacción pasa por el botón (la tarjeta completa NO es un enlace).
- Seleccionada (paquete elegido en el formulario): borde 2px vino-700 y chip "Elegido" (texto, no solo color). Se aplica al volver a ver la tarjeta tras seleccionarla.
- Chip "Más popular": fondo rose-100, texto vino-800, 14px/600 (excepción documentada al mínimo de 15px por ser etiqueta corta; si se prefiere, usar 15px).

### 6.6 Formularios

- Etiqueta visible sobre cada campo (nunca solo placeholder), Inter 600 16px, ink-900.
- Campo: alto 48px, fondo blanco, borde 1.5px `#8A777B` (contraste ≥3:1 con el fondo), radio 10px, texto 17px (evita zoom en iOS).
- Ayuda bajo el campo: 15px ink-600. Error: borde error-700 2px, icono + texto error-700 15px/500, `aria-invalid="true"`, enlazado con `aria-describedby`.
- Campos obligatorios marcados con "(obligatorio)" en el label o nota general "Todos los campos son obligatorios salvo Notas".
- Hora: radios estilizados como botones (chips 48px) en vez de select.
- Personas: input numérico con botones − / + de 48x48px.
- Checkbox 21+: caja 24px dentro de un área táctil de 48px; el texto completo es parte del `<label>`.
- `autocomplete`: name, email, tel. `inputmode="tel"` en teléfono, `inputmode="numeric"` en personas.

### 6.7 Estados de foco

- Todo elemento interactivo: `outline: 3px solid #7A1B2D; outline-offset: 3px` en fondos claros; sobre fondos oscuros: `outline: 3px solid #F0B8C0`.
- Nunca `outline: none` sin reemplazo. Usar `:focus-visible`.
- Doble anillo opcional: `box-shadow: 0 0 0 2px #fff` por dentro para campos.
- Enlace "Saltar al contenido" visible al recibir foco, primer elemento del DOM.

### 6.8 Otros componentes

- **Acordeón FAQ:** botón con `aria-expanded` y `aria-controls`; icono +/− (SVG inline) 24px; fila ≥56px; borde inferior arena-200.
- **Menú móvil:** panel de pantalla completa, fondo crema-50, cierre con botón 48px y Esc; foco atrapado mientras está abierto.
- **Lightbox galería:** `role="dialog"` `aria-modal="true"`, foco atrapado, devuelve foco a la miniatura.
- **Toast/aviso:** solo para avisos de ajuste (ej. personas ajustadas), `role="status"`.
- **Movimiento:** transiciones 150–250ms; respetar `prefers-reduced-motion` (scroll suave y animaciones desactivados).

### 6.9 Accesibilidad (checklist AA)

- `lang="es-PR"` (o `es`), un solo H1, jerarquía H2 por sección, landmarks `header/nav/main/footer`.
- Todo texto ≥4.5:1 (≥3:1 para texto grande ≥24px o 18.66px bold y para bordes/iconos de UI).
- Imágenes con `alt` descriptivo; decorativas `alt=""`. Iconos de pasos acompañados de texto.
- Orden de tabulación lógico; formulario operable 100% con teclado; hallazgo de errores anunciado (resumen con `role="alert"` y foco).
- Zoom 200% sin pérdida de contenido ni scroll horizontal; reflow a 320px de ancho.
- Aviso 21+ no depende de color ni de imagen.

---

## 7. Notas para Luna (assets)

Rutas esperadas (usar estos nombres exactos). Todos SVG, `viewBox` definido, sin tamaños fijos en px, sin texto como imagen cuando sea posible (si lleva texto, convertir a trazos y proporcionar `<title>`).

| Archivo | Descripción | Especificaciones |
|---------|-------------|------------------|
| `assets/logo.svg` | Logo horizontal "Wine and Art" (copa + pincel o paleta, tipografía serif) | Versión sobre fondo claro (vino-700/ink). Se muestra a 40px de alto en header. Además pedir **`assets/logo-claro.svg`** (versión blanca/rosé para el footer oscuro) |
| `assets/favicon.svg` | Símbolo solo (copa/pincel), legible a 16–32px | Cuadrado, fondo vino-700, trazo crema |
| `assets/hero.svg` | Ilustración principal: lienzo + copa de vino/pinceles, ambiente cálido | Relación ~16:10, funciona recortada a 4:3 en móvil; paleta de este documento |
| `assets/icons/paleta.svg` | Icono paso 2 (y paquete Pareja si aplica) | 48x48, trazo 2px, `currentColor` |
| `assets/icons/copa.svg` | Icono paso 4 / paquetes con vino | Igual |
| `assets/icons/pincel.svg` | Icono paso 3 | Igual |
| `assets/icons/calendario.svg` | Icono paso 1 | Igual |
| `assets/galeria/obra-1.svg` … `obra-6.svg` | 6 obras de ejemplo (abstractos, paisaje tropical, atardecer, flores, etc.) | Relación 4:5 (viewBox 800x1000), paleta cálida con rojos/vinos; son placeholders hasta tener fotos reales |

Pedidos extra (opcionales, confirmar con Luna): iconos de paquete (usar los 4 de arriba: Pincel y Copa = pincel, Noche de Vino = copa, Pareja Artística = paleta, Evento Privado = calendario).
Usar los tokens de color de la sección 6.1. Los iconos con `stroke="currentColor"` para poder colorearse con CSS.
Verificar contraste del logo: ≥4.5:1 sobre crema-50 y sobre vino-950 (versión clara).

---

## 8. Notas para Yin (comportamientos interactivos)

1. **Stack:** HTML + Tailwind CDN + JS vanilla. Definir los tokens en `tailwind.config` y exponerlos como variables CSS.
2. **Datos de paquetes:** renderizar tarjetas y `<select>` desde una sola fuente (JSON/endpoint de Dan, `GET /api/paquetes`) con campos: id, nombre, descripcion, precio, unidad, duracion, incluye[], min, max. Fallback a un objeto local si falla la API.
3. **Reservar desde tarjeta:** al clic, setear el select, actualizar resumen y límites, `scrollIntoView` (instantáneo con `prefers-reduced-motion`) y mover el foco al campo Fecha. Marcar la tarjeta como "Elegida".
4. **Fecha/Hora:** al elegir fecha, calcular día de la semana (en zona PR, sin conversión UTC) y renderizar horas disponibles (tabla en sección 4). Si el día no tiene horas, mostrar el mensaje de error. Preferible `GET /api/disponibilidad?fecha=` cuando Dan lo tenga; si no, tabla local.
5. **Personas:** stepper − / +, limitado a mín/máx; deshabilitar botones en los extremos (con `aria-disabled`); anunciar cambios con `aria-live="polite"`.
6. **Resumen:** se actualiza en vivo (paquete, fecha formateada "sáb., 5 dic. 2026", hora, total estimado). Formato moneda `Intl.NumberFormat('es-PR',{style:'currency',currency:'USD'})`.
7. **Validación:** según tabla de sección 4; resumen de errores con `role="alert"`; foco al primer campo inválido; `novalidate` en el form y mensajes propios.
8. **Envío:** `POST /api/reservas` (JSON), botón en estado loading y deshabilitado para evitar doble envío; manejar 400 (errores por campo), 409 (hora ya ocupada), 5xx/red (mensaje + Reintentar, sin perder datos).
9. **Éxito:** ocultar formulario, mostrar confirmación, mover foco al H3 (`tabindex="-1"`), mostrar código de reserva devuelto por la API. "Hacer otra reserva" resetea el formulario.
10. **Menú móvil, acordeón FAQ, lightbox:** según sección 6.8, con soporte de teclado completo.
11. **Header sticky:** añadir `scroll-margin-top: 72px` a las secciones para que el ancla no quede tapada. Resaltar enlace de sección activa (con `aria-current="true"`, no solo color).
12. **Rendimiento:** imágenes SVG con `width/height` o `aspect-ratio` para evitar saltos; galería con `loading="lazy"`; hero sin lazy.
13. **Honeypot anti-spam** opcional (campo oculto) para Dan.

---

## 9. Pendientes y preguntas abiertas

- Precios reales, duración de Pareja Artística y Evento Privado, y mín/máx de Pincel y Copa / Noche de Vino (usé 1–12 como supuesto).
- Horarios reales (usé jue–dom 6:00 pm y 8:30 pm, sáb–dom también 2:00 pm) y si Evento Privado tiene horarios propios.
- Anticipación mínima de reserva (supuesto: desde mañana) y máximo (supuesto: 6 meses).
- Capacidad por sesión (si dos reservas pueden coincidir a la misma hora).
- Política de cancelación y métodos de pago (FAQ 5 y 6 son provisionales); ¿se cobra depósito en línea? De momento, solo reserva sin pago.
- Dirección, correo, teléfono/WhatsApp, redes sociales.
- Fotos reales para la galería (hasta entonces, obras SVG de Luna).
- ¿Mostrar el distintivo "Más popular" en Noche de Vino?
- Verificar contrastes finales con herramienta una vez Luna entregue el logo y assets (Lucas).
