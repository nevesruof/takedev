# iTake — Vercel

1. Descomprime este ZIP.
2. Sube su contenido a la raíz de tu repositorio: vercel.json y dist deben estar al mismo nivel.
3. Importa el repositorio en Vercel o vuelve a desplegarlo.
4. Root Directory: la carpeta que contiene vercel.json (raíz del repositorio si copiaste el contenido directamente).
5. Framework Preset: Other. Output Directory: dist. Build Command: vacío. Install Command: vacío.

No requiere npm ni compilación. El código HTML, CSS, JavaScript y las imágenes están en dist. Los módulos originales de la interfaz están compilados/minificados; los ajustes propios se encuentran también en archivos JavaScript y CSS separados.

Las pestañas usan parámetros de URL, por lo que no necesitan reglas de reescritura.
Si el 404 continúa, revisa que estés abriendo la URL del último deployment exitoso y que el dominio esté asignado al proyecto correcto.
