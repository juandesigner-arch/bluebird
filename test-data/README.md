# Datos de prueba compartidos

El usuario designó la memoria del Blue Bird original como stock de pruebas el 5 de octubre de 2026 y pidió incluirlo en todas las releases, salvo que solicite un lanzamiento en blanco.

`bluebird-stock-2026-10-05.json` es la exportación exacta de `blue-bird-expenses-v1` obtenida de la pestaña original de Safari. No es una recreación a partir de los importes del código. Conservarla sin cambios.

`stock.js` contiene esa carga y su adaptación al esquema Lite; `build-stock.mjs` la genera con Node. La copia exacta conserva vista y datos; las instalaciones nuevas abren Inicio con los mismos valores, checks, registros e historial. Las claves de almacenamiento continúan separadas y la carga inicial solo se aplica cuando no existe estado guardado. No sustituye silenciosamente datos existentes ni sincroniza navegadores.

La captura histórica se conserva. V3 y Lite inician los checks de prueba en el mes de instalación; el siguiente cambio de mes aplica el cierre y reinicio normales. Para una release explícitamente en blanco, omitir el script de stock; las tres aplicaciones conservan su estado por defecto como alternativa (el original contiene sus valores de catálogo anteriores).
