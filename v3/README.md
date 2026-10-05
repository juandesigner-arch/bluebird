# Blue Bird V3

Base visual tomada de Blue Bird original. Conserva su CSS, ilustraciones, navegación, textos, composición y reglas de super checks. Las vistas y los eventos siguen en `app.js`; no incorpora el diseño de Lite.

## Capa interna

- `data.mjs`: catálogo y estado inicial de V3.
- `calculations.mjs`: cálculos puros extraídos del original, manteniendo sus reglas actuales.
- `state.mjs`: almacenamiento protegido, migración con respaldo, fotografías mensuales y protección contra escrituras de pestañas antiguas.
- `tests/state.test.mjs`: pruebas con reloj y almacenamiento controlados.

Se conserva la clave `blue-bird-v3-expenses-v1`, con `schemaVersion: 2` y `activeMonth`. Toda migración o reparación crea primero una copia literal `blue-bird-v3-expenses-v1-backup-*`. Si el respaldo falla, se bloquea la escritura. Las migraciones antiguas que sobrescribían deudas se retiraron. Los errores de guardado se avisan mediante un diálogo del navegador, sin añadir controles ni modificar las pantallas.

Al cambiar de mes, se cierra el período activo antes de cualquier modificación: se guardan resúmenes compatibles con el historial original y una fotografía detallada con nombres, iconos, importes, saldos de deuda, registros y checks. Se reinician checks manuales y registros variables; permanecen gastos, saldos, etiquetas y eliminaciones. Se comprueba al abrir, editar, recuperar foco/visibilidad y cada 30 segundos. No se inventan meses sin actividad ni se reabren meses por retrocesos del reloj.

Los historiales antiguos se preservan. Si no existía mes activo, la migración lo infiere del historial más reciente o del mes actual. El detalle que nunca guardó la versión anterior no puede reconstruirse.

Los cálculos, indicadores y reglas de progreso originales se conservan intencionalmente: no se reemplazaron por las reglas visuales de Lite. La etiqueta de deuda restante conserva la fórmula del original; no es una liquidación bancaria.

## Stock de pruebas

Por instrucción del usuario, las instalaciones nuevas cargan los datos exportados del navegador del Blue Bird original desde `../test-data/stock.js`. Conservan checks, registros, valores e historial; abren Inicio. La captura literal está en `../test-data/bluebird-stock-2026-10-05.json`. No se reemplazan datos ya guardados. Usar este stock en las próximas releases salvo petición explícita de lanzamiento en blanco.

## Verificación

```sh
node --test v3/tests/state.test.mjs
node --check v3/app.js
node --check v3/state.mjs
node --check v3/calculations.mjs
node --check v3/data.mjs
git diff --check
```

Se compararon diez pantallas de V3 antes/después con el mismo estado de prueba: cero píxeles distintos. También se probaron escritura continua, super checks, persistencia, cambio de año con un input enfocado, historial inmutable, entradas dañadas, escape de texto y conflicto entre pestañas.
