# Blue Bird

Mini app de gastos personales en COP.

## Versiones

- `/` — Blue Bird, versión visual completa.
- `/lite/` — Mini Gastos Lite, versión alternativa.
- `/v3/` — Blue Bird V3, base visual original con persistencia y cierre mensual protegidos.

Todas las versiones cargan el stock de pruebas de `test-data/` cuando no tienen datos guardados. Sus claves de almacenamiento son independientes. Solo publicar en blanco cuando el usuario lo solicite.

Es una app web estatica: se puede subir a GitHub y desplegar en Hostinger publicando esta carpeta.

## Archivos principales

- `index.html`
- `styles.css`
- `app.js`
- `assets/`

## Probar local

Abre `index.html` directamente o sirve la carpeta con:

```bash
python3 -m http.server 4174
```

## Deploy

Hostinger puede usar:

```bash
npm run build
```

Directorio publico:

```text
.
```

## V3: cuentas y pruebas

V3 incluye navegación fija, registros variables ilimitados y creación de deudas COP/USD con tasa manual. Mantiene el stock y la gráfica original.

El acceso Supabase requiere activar el proyecto siguiendo [la guía](v3/supabase/README.md); hasta entonces el perfil indica que el acceso está pendiente y permite continuar localmente.

Pruebas de datos: `node --test v3/tests/state.test.mjs lite/tests/state.test.mjs`. Las pruebas de navegador (`v3/tests/browser.cjs` y `v3/tests/auth-browser.cjs`) requieren Playwright y el servidor local en puerto 4175. `PLAYWRIGHT_MODULE` permite indicar la ruta del módulo instalado. La segunda prueba simula Supabase: no sustituye la verificación con un proyecto real y sus políticas RLS.
