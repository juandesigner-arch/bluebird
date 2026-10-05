# Mini Gastos Lite

Aplicación estática sin dependencias de ejecución. `index.html` carga módulos ES nativos; servir mediante HTTP(S), como en Hostinger.

- `data.js`: catálogo público con valores iniciales cero.
- `calculations.js`: funciones puras de cálculo que reciben el estado. Agua al 50%, seguros anuales /12, deuda solo por cuota mínima. Redondeo únicamente al mostrar COP; el valor anual mostrado es una proyección, no gasto histórico acumulado.
- `state.js`: validación, migración, persistencia, fotografías mensuales y cambio de período; reloj y almacenamiento inyectables para pruebas.
- `app.js`: vistas y eventos delegados. Los inputs actualizan totales y estados sin sustituir el DOM del formulario.

## Datos

Se conserva `mini-gastos-lite-v3`, con `schemaVersion: 4` y `activeMonth: YYYY-MM`. Antes de migrar o normalizar datos existentes se guarda el texto original bajo `mini-gastos-lite-v3-backup-*`. Si no se puede crear ese respaldo, no se sobrescribe el original. Las versiones futuras se protegen de escritura. Los errores de almacenamiento se muestran en pantalla; los cambios quedan en memoria si falla una escritura.

El historial del mes activo se actualiza con cada cambio. Al avanzar el calendario se cierra el mes anterior con una copia independiente de categorías, gastos, nombres, emojis, valores, cuotas, deuda total, slots y checks. Se reinician checks y slots, conservando gastos fijos, personalizados y eliminaciones. No se inventan registros para meses sin actividad. Un reloj que retrocede no reabre períodos cerrados.

La migración antigua infiere el período a partir de la entrada más reciente del historial. Si no hay historial, usa el mes actual. Los resúmenes antiguos no contienen suficiente información para reconstruir el detalle de todos los meses: se conservan como resúmenes. El último período se cierra con los datos disponibles. El respaldo conserva íntegro el documento anterior.

La detección del cambio mensual ocurre al abrir, antes de editar, al recuperar foco/visibilidad y cada 30 segundos. Si otra pestaña cambia los datos, se detienen las escrituras y se pide recargar para evitar sobrescribirla.

## Verificación

Desde la raíz, con Node moderno:

```sh
node --test lite/tests/state.test.mjs
node --check lite/app.js
node --check lite/state.js
node --check lite/calculations.js
node --check lite/data.js
git diff --check
python3 -m http.server 4175 --bind 127.0.0.1
```

En `/lite/`: comprobar navegación y ocho categorías, escritura continua, totales mensual/anual, checks, nombres y emojis, slots, agregar fijo/variable, eliminar gastos y deudas, recarga e historial. Revisar a 320–390 px y escritorio. Los valores usados en pruebas son ficticios; nunca se incluyen datos del navegador del usuario en el repositorio.

Los parámetros `?v=lite-4` de HTML e imports se actualizan juntos al cambiar archivos de ejecución. No modificar la clave de almacenamiento por cambios de caché.
