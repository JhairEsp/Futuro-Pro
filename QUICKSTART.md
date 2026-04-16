# Quick Start - EduApp

## 🚀 Empezar en 5 minutos

### Paso 1: Clonar o Descargar
```bash
# Si clonaste desde GitHub
cd eduapp
pnpm install

# Si descargaste el ZIP
unzip eduapp.zip
cd eduapp
pnpm install
```

### Paso 2: Crear Proyecto Supabase

1. Ve a https://supabase.com/dashboard
2. Haz clic en "New Project"
3. Completa los datos y crea el proyecto
4. Espera a que se inicialice (2-5 minutos)

### Paso 3: Copiar Variables de Entorno

En el dashboard de Supabase:
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL** (debajo de "API")
   - **anon public** (debajo de "Project API keys")
   - **service_role secret** (debajo de "Project API keys")

### Paso 4: Configurar `.env.local`

Crea archivo `eduapp/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJ...xxxxx
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### Paso 5: Crear Tablas en Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Copia TODO el contenido de `scripts/001_create_tables.sql`
4. Haz clic en **Run** (botón azul)
5. Espera a que termine
6. Repite con `scripts/002_create_profiles_trigger.sql`

### Paso 6: Ejecutar Localmente

```bash
pnpm dev
```

Abre http://localhost:3000 en tu navegador.

## ✅ Probar la App

### Crear Profesor
1. Click en "Regístrate"
2. Selecciona **Profesor**
3. Completa: Nombre, Apellido, Email, Contraseña
4. Click en "Registrarse"
5. ✅ Ahora estás en el panel de profesor

### Crear Salón
1. Click en "Nuevo Salón"
2. Nombre: "Matemáticas 101"
3. Asignatura: "Matemáticas"
4. Año: 2024
5. Semestre: 1
6. Click en "Crear Salón"

### Agregar Estudiante
1. Click en "Agregar Estudiante"
2. Selecciona salón
3. Email: (usar email de estudiante que crearás)
4. Click en "Agregar"
5. Abre nueva pestaña incógnito

### Crear Estudiante
1. Nueva pestaña incógnito
2. Click en "Regístrate"
3. Selecciona **Estudiante**
4. Completa con el mismo email que pusiste arriba
5. Click en "Registrarse"
6. ✅ Ahora estás como estudiante

### Agregar Calificaciones
1. Vuelve a la pestaña del profesor
2. Click en "Calificaciones"
3. Selecciona el salón
4. Completa notas (0-100) en cada examen
5. ✅ Las notas se guardan al cambiar

### Ver Calificaciones (Estudiante)
1. En la pestaña del estudiante
2. Click en "Mis Calificaciones"
3. Ver notas organizadas por curso
4. Click en "Mis Habilidades"
5. ✅ Ver gráfico de radar

## 📁 Estructura Importante

```
eduapp/
├── .env.local          ← Tus variables de entorno
├── app/
│   ├── auth/           ← Páginas de login/signup
│   ├── dashboard/      ← Dashboards profesor/estudiante
│   └── api/            ← Endpoints para datos
├── components/         ← Componentes reutilizables
├── lib/supabase/       ← Configuración de Supabase
├── scripts/            ← Scripts SQL para DB
└── README.md           ← Documentación completa
```

## 🔧 Troubleshooting

### "Cannot find module '@/lib/supabase/client'"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Invalid API Key"
- Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` sean correctos
- No incluir comillas en .env.local

### "User already exists"
- Ese email ya existe
- Usa un email diferente para pruebas

### La página no carga
- ¿Ejecutaste `pnpm dev`?
- ¿Puerto 3000 está libre?
- Abre console (F12) y busca errores

## 🌐 Desplegar en Vercel

1. Sube código a GitHub (git push)
2. Ve a vercel.com
3. Click en "Add New" → "Project"
4. Selecciona tu repo
5. Add Environment Variables (mismo .env.local)
6. Click en "Deploy"

## 📚 Más Información

- README.md - Documentación completa
- DEPLOYMENT.md - Guía detallada de deployment
- Código comentado en components/ y app/

## ❓ Preguntas Frecuentes

**P: ¿Qué es Supabase?**
R: Base de datos PostgreSQL con autenticación integrada y RLS para seguridad.

**P: ¿Puedo usar mi propia base de datos?**
R: Sí, necesitarías cambiar queries en app/api/ y components/.

**P: ¿Es gratuito?**
R: Sí, el tier free de Supabase + Vercel cubre la mayoría de casos.

**P: ¿Cómo agrego más usuarios?**
R: Repite el proceso de "Probar la App" con diferentes emails.

**P: ¿Los datos se guardan?**
R: Sí, todo en Supabase (PostgreSQL). Los datos son persistentes.

---

¡Listo! Tu app educativa está funcionando. 🎉
