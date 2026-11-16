# Identidad visual — Wine and Art

## Concepto
Una copa de vino cuyo contenido es pintura, y un pincel con una gota. Cálido, elegante y relajado: noche de arte entre amigos.

## Paleta

| Rol | Nombre | HEX |
|-----|--------|-----|
| Primario | Rojo vino | `#8B1E2D` |
| Oscuro | Burgundy | `#4A0E1C` |
| Secundario | Merlot | `#6B1A2E` |
| Acento vivo (ilustración, hover) | Rojo pintura | `#B3202F` |
| Suave | Rosé | `#E8B4B8` |
| Acento | Dorado champaña | `#C9A24B` (sobre oscuro puede usarse `#E0C27A`) |
| Fondo | Crema | `#FAF4EC` |
| Texto | Tinta vino | `#2B1519` |

## Contraste (WCAG 2.x, ratio calculado)
AA: 4.5:1 texto normal, 3:1 texto grande (18 px bold / 24 px) y componentes UI.

| Texto / fondo | Ratio | Resultado |
|---|---|---|
| Texto `#2B1519` sobre crema | 15.7 | AAA |
| Rojo vino sobre crema (enlaces, botones outline) | 8.28 | AAA |
| Merlot sobre crema | 10.6 | AAA |
| Burgundy sobre crema | 14.02 | AAA |
| Crema sobre rojo vino (botón primario) | 8.28 | AAA |
| Crema sobre merlot | 10.6 | AAA |
| Crema sobre burgundy (footer) | 14.02 | AAA |
| Crema sobre rojo pintura `#B3202F` | 6.07 | AA |
| Rosé sobre burgundy | 8.5 | AAA |
| Rosé sobre merlot | 6.43 | AA |
| Dorado sobre burgundy | 6.39 | AA |
| Dorado sobre merlot | 4.83 | AA |
| Texto `#2B1519` sobre rosé | 9.52 | AAA |
| Texto `#2B1519` sobre dorado (botón acento) | 7.15 | AAA |
| **Dorado sobre crema** | **2.2** | **NO CUMPLE** |

Regla: el dorado nunca va como texto ni línea informativa sobre crema; solo decorativo, o texto oscuro sobre fondo dorado.

## Tipografías (Google Fonts)
- Títulos: **Playfair Display** (serif elegante), 600/700 y cursiva 500.
- Cuerpo y UI: **Lato** (sans), 400/700.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">
```
Tailwind: `fontFamily: { serif: ['"Playfair Display"', 'Georgia', 'serif'], sans: ['Lato', 'Arial', 'sans-serif'] }`.

## Logo
- `assets/logo.svg`: horizontal, para fondos claros (crema/blanco).
- `assets/logo-claro.svg`: para fondos oscuros (burgundy, merlot, vino).
- `assets/logo-mono.svg`: una tinta, usa `currentColor` (útil con `fill`/`color` CSS, impresión, sellos).
- `assets/favicon.svg`: copa sobre cuadrado merlot.
- Espacio libre: alto de la gota alrededor. Tamaño mínimo: 120 px de ancho (horizontal), 16 px (favicon).
- No estirar, rotar, recolorear fuera de la paleta ni poner el logo normal sobre fondos oscuros o con ruido.
- Nota: el texto del logo es `<text>` y usa Playfair Display/Lato con respaldo Georgia/Arial. Ver pendientes.

## Íconos (`assets/icons/`)
paleta, copa, pincel, calendario: 24x24, trazo 1.75, `stroke="currentColor"`; heredan el color del texto.

## Imágenes
- `assets/hero.svg`: fondo del hero; zona izquierda crema y tranquila para texto oscuro (cumple AA); derecha con caballete y copas.
- `assets/galeria/obra-1..6.svg`: placeholders 800x600 hasta tener fotos reales.

## Tono visual
Cálido, íntimo y festivo sin ser recargado. Mucho crema, rojo vino como protagonista, dorado en pequeños detalles. Formas orgánicas (manchas, gotas), esquinas suavemente redondeadas, fotografía con luz cálida.
