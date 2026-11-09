# Take — sitio personal

Sitio estático en HTML, CSS y JavaScript sin compilar ni dependencias. Se despliega en Vercel tal cual.

## Despliegue

1. Sube el contenido de esta carpeta a la raíz del repositorio (`vercel.json` y `dist` al mismo nivel).
2. Framework Preset: Other. Output Directory: `dist`. Build y Install Command vacíos.

Para probarlo en local: `cd dist && python3 -m http.server 8000`.

## Dónde cambiar cosas

| Qué | Archivo |
| --- | --- |
| Nombre, usuario, bio, enlaces, Discord ID, usuario de stats.fm, zona horaria, proyecto actual | `dist/js/config.js` |
| Lista de proyectos | `dist/js/data/projects.js` |
| Stack (categorías y tecnologías) | `dist/js/data/stack.js` |
| Máquinas, escritorio, software y herramientas | `dist/js/data/setup.js` |
| Colores y tipografía | variables al inicio de `dist/css/base.css` |

## Estructura

```
dist/
  index.html
  css/        base, componentes y páginas
  js/
    main.js, router.js, config.js
    pages/    home, projects, music, stack, setup
    services/ presence (Discord vía Lanyard) y statsfm
    data/     contenido editable
    lib/      utilidades (DOM, iconos, formato, efectos)
    icons.js  iconos en SVG (generado)
  data/       copia local de stats.fm por si la API no responde
  assets/     fuente, favicon y portadas
```

## Notas

- La presencia de Discord usa Lanyard: tu cuenta debe estar en su servidor (discord.gg/lanyard) para que aparezca el estado.
- Los iconos son monocromos y se iluminan con su color de marca al pasar el cursor; si el color es demasiado oscuro para el fondo negro, usan blanco.
- Atajos: `1`–`5` cambian de pestaña, `←` `→` navegan, `/` filtra el stack, `?` muestra la ayuda.
