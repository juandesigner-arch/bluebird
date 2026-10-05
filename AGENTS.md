# Blue Bird: reglas de publicación

- El trabajo de producto actual se hace en `/v3/`. Conservar sus gráficos e interacciones salvo petición expresa.
- Mantener `/`, `/lite/` y `/v3/` con claves de almacenamiento independientes.
- El usuario pidió que todas las releases incluyan el stock de prueba exportado del Blue Bird original. Usar `test-data/stock.js`, generado a partir de `test-data/bluebird-stock-2026-10-05.json`.
- Solo lanzar en blanco cuando el usuario lo pida explícitamente. No sustituir datos existentes en el navegador para aplicar el stock.
- No cambiar el stock por ejemplos inventados ni confundirlo con valores predeterminados del código. Al actualizarlo, conservar el respaldo de la captura anterior.
