# Guía de Deployment - EduApp

## Paso 1: Preparar Supabase

### 1.1 Crear Proyecto en Supabase
1. Ir a https://supabase.com y registrarse/iniciar sesión
2. Click en "New Project"
3. Seleccionar región más cercana
4. Crear proyecto

### 1.2 Obtener Credenciales
En el dashboard de Supabase:
1. Ir a Settings → API
2. Copiar:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Crear Tablas
1. En Supabase, ir a SQL Editor
2. Crear nueva consulta
3. Copiar y ejecutar el contenido de `scripts/001_create_tables.sql`
4. Crear otra consulta y ejecutar `scripts/002_create_profiles_trigger.sql`

## Paso 2: Preparar Vercel

### 2.1 Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/usuario/eduapp.git
git push -u origin main
```

### 2.2 Conectar con Vercel
1. Ir a https://vercel.com
2. Click en "Add New" → "Project"
3. Seleccionar repositorio de GitHub
4. Importar proyecto

### 2.3 Configurar Variables de Entorno
En Vercel, en Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=<valor-de-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<valor-de-supabase>
SUPABASE_SERVICE_ROLE_KEY=<valor-de-supabase>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://tu-app.vercel.app
```

### 2.4 Deploy
Click en "Deploy" y esperar a que termine.

## Paso 3: Verificar Deploy

1. Ir a la URL de la app en Vercel
2. Verificar que se carga correctamente
3. Intentar registrarse como profesor y estudiante
4. Crear un salón y agregar calificaciones

## Variables de Entorno Necesarias

| Variable | Origen | Ejemplo |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings | `eyJ...` |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Vercel URL | `https://app.vercel.app` |

## Solución de Problemas

### Error: "Invalid API Key"
- Verificar que las variables de entorno sean correctas en Vercel
- Asegurarse de copiar la clave completa sin espacios

### Error: "Row Level Security violation"
- Las políticas de RLS no están habilitadas
- Ejecutar el script `001_create_tables.sql` nuevamente

### Error: "User role not found"
- El usuario fue creado antes de ejecutar el trigger
- Crear un nuevo usuario para pruebas

### Emails de confirmación no llegan
- En desarrollo: deshabilitar email verification en Supabase
- En producción: configurar email provider en Supabase

## Escalabilidad

Para escalar la app:

1. **Base de Datos**: Supabase escala automáticamente
2. **Almacenamiento**: Agregar Supabase Storage para documentos
3. **Cache**: Agregar Redis (Upstash) para sesiones
4. **CDN**: Vercel incluye CDN global

## Monitoreo

1. Vercel Analytics: Dashboard de Vercel
2. Supabase: Monitorar en SQL Editor y Settings
3. Logs: Ir a Vercel → Deployments → Logs

## Backup

Supabase realiza backups automáticos. Para backup manual:
1. Ir a Supabase Dashboard
2. Settings → Backups
3. Click en "Backup now"

## Actualizar la App

```bash
git add .
git commit -m "Update: descripcion"
git push
# Vercel desplegará automáticamente
```

## Precios (Aproximado - Consultar sitios oficiales)

- **Vercel**: Free tier para desarrollo, $20/mes producción
- **Supabase**: Free tier 500MB, escalable según uso
- **Total**: Puede ser $0-50/mes según tráfico
