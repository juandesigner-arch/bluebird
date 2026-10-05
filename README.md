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
