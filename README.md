# SAVA - Permisos y Justificaciones

Sistema web inicial con `Next.js` + `Supabase` para gestionar permisos/justificaciones con flujo por roles.

## Roles implementados

- `administrativo`: crea, edita y visualiza solicitudes.
- `secretaria`: revisa solicitudes y las envía a Decano.
- `decano`: aprueba/firma solicitudes y es el único que crea usuarios y delega funcionalidades.
- `superusuario`: acceso total al flujo funcional (sin creación de usuarios, por la regla solicitada).

## Flujo

1. Cualquier rol crea solicitud (con justificativo en archivo).
2. Secretaria revisa y envía a aprobación.
3. Decano aprueba (firma) o rechaza.
4. Decano puede delegar capacidades específicas a otros usuarios.

## Configuración rápida

1. Instala dependencias:
   - `npm install`
2. Crea `.env.local` desde `.env.example`.
3. Ejecuta `sql/schema.sql` en Supabase SQL Editor.
4. Crea los 4 usuarios de prueba:
   - `npm run seed`
   - correos: `superusuario@sava.test`, `decano@sava.test`, `secretaria@sava.test`, `administrativo@sava.test`
   - contraseña por defecto: `SavaDemo2026!` (o `SEED_TEST_PASSWORD`)
   - contraseña temporal para altas: `SavaTemporal2026!` (o `SEED_TEMP_PASSWORD`)
5. Levanta el proyecto:
   - `npm run dev`

## Importante sobre creación de usuarios

La acción de crear usuarios usa `SUPABASE_SERVICE_ROLE_KEY` desde backend (`lib/supabase/admin.ts`).  
Nunca expongas esta llave en frontend.

## Siguiente paso recomendado

Cuando compartas versiones legibles de los diseños (imagen o PDF con texto), adapto estos módulos al UI exacto (maquetación, campos y validaciones finales) para que quede idéntico al diseño docente.
