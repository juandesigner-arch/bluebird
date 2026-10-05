# Activar cuentas de Blue Bird V3

1. Crear un proyecto en https://supabase.com/dashboard (conservar la contraseña de base de datos en privado).
2. En SQL Editor, ejecutar `setup.sql` de esta carpeta. Crea la tabla, el aislamiento por usuario y el guardado con control de conflictos.
3. En Authentication → URL Configuration, configurar Site URL y Redirect URLs con `https://darkred-raccoon-217438.hostingersite.com/v3/`. Para pruebas locales añadir la URL local exacta.
4. En Authentication → Providers habilitar Email y confirmación del correo. Configurar SMTP para enviar invitaciones a amigos: el correo de prueba de Supabase tiene restricciones y no sirve como correo público de producción.
5. En Project Settings → API, copiar Project URL y la clave **publishable** (`sb_publishable_…`) o legacy **anon**. Ponerlas en `v3/auth-config.js`. NUNCA usar `service_role`, `sb_secret_…`, contraseña de base de datos o token de administración.
6. Publicar. Registrar dos cuentas con correos distintos, confirmar los correos y comprobar que editar una no modifica la otra. Probar recuperación de contraseña, cierre de sesión y entrada desde otro dispositivo.

Hasta completar estos pasos, la app explica que el acceso por correo está pendiente de activar y sigue usando almacenamiento local. No simula cuentas reales.

Cada cuenta tiene su propia clave local y una fila protegida por RLS. Las cuentas nuevas incluyen el stock de prueba autorizado. El invitado mantiene su copia independiente. Los cambios se guardan localmente y se envían con revisión: otro dispositivo nunca se sobrescribe silenciosamente. Ante conflicto, el perfil permite recuperar la nube guardando antes un respaldo local. Sin red, se conserva la copia local; al reconectar se reintenta. No borrar los datos del navegador antes de sincronizar.

SDK oficial supabase-js 2.117.2 vendorizado con su licencia MIT. Documentación: https://supabase.com/docs/guides/auth y https://supabase.com/docs/guides/database/postgres/row-level-security .
