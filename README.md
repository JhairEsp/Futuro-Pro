# EduApp - Plataforma de Gestión Educativa

Una plataforma completa de gestión educativa construida con Next.js, Supabase y React. Permite a profesores gestionar aulas y calificaciones, y a estudiantes ver sus notas y análisis de habilidades.

## Características

### Para Profesores
- ✅ Crear y gestionar salones de clase
- ✅ Agregar y remover estudiantes de salones
- ✅ Gestionar calificaciones (7 exámenes por estudiante)
- ✅ Ver promedios y estadísticas

### Para Estudiantes
- ✅ Ver calificaciones por curso
- ✅ Análisis de habilidades con gráfico de radar
- ✅ Promedio general de calificaciones
- ✅ Interpretación visual de rendimiento

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Visualización**: Recharts
- **Deployment**: Vercel

## Instalación y Configuración

### 1. Clonar el Proyecto
```bash
git clone <repo-url>
cd eduapp
pnpm install
```

### 2. Configurar Supabase

1. Crear una cuenta en [supabase.com](https://supabase.com)
2. Crear un nuevo proyecto
3. Copiar las credenciales:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Variables de Entorno

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=<tu-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### 4. Crear Tablas en Supabase

Ejecutar los scripts SQL en orden:
1. Ir a Supabase Dashboard → SQL Editor
2. Crear nueva consulta y copiar contenido de `scripts/001_create_tables.sql`
3. Ejecutar
4. Repetir con `scripts/002_create_profiles_trigger.sql`

### 5. Ejecutar Localmente

```bash
pnpm dev
```

La app estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
app/
  ├── auth/
  │   ├── login/page.tsx
  │   └── signup/page.tsx
  ├── dashboard/
  │   ├── teacher/
  │   │   ├── classrooms/page.tsx
  │   │   ├── students/page.tsx
  │   │   └── grades/page.tsx
  │   └── student/
  │       ├── grades/page.tsx
  │       └── skills/page.tsx
  ├── api/
  │   ├── teachers/route.ts
  │   ├── students/route.ts
  │   ├── classrooms/route.ts
  │   └── grades/route.ts
  └── page.tsx

components/
  ├── sidebar.tsx
  ├── header.tsx
  └── dashboard-layout.tsx

lib/
  └── supabase/
      ├── client.ts
      ├── server.ts
      └── proxy.ts
```

## Flujo de Uso

### Registrarse
1. Ir a `/auth/signup`
2. Seleccionar rol (Profesor o Estudiante)
3. Llenar datos personales
4. Confirmar email (en desarrollo se puede saltar)

### Como Profesor
1. Crear salones desde "Mis Salones"
2. Ir a "Alumnos" y agregar estudiantes
3. En "Calificaciones" ingresar notas (1-100 para cada examen)

### Como Estudiante
1. Ver calificaciones en "Mis Calificaciones"
2. Analizar habilidades en "Mis Habilidades"
3. Ver gráfico de radar con análisis detallado

## Base de Datos

### Tablas Principales
- `teachers` - Perfil de profesores
- `students` - Perfil de estudiantes
- `classrooms` - Salones de clase
- `enrollments` - Inscripciones (relación estudiante-salón)
- `grades` - Calificaciones (7 exámenes por inscripción)

### Políticas RLS
- Los profesores solo ven sus propios salones y alumnos
- Los estudiantes solo ven sus propias calificaciones
- Todas las tablas tienen Row Level Security habilitado

## Deployment en Vercel

1. Subir repositorio a GitHub
2. Conectar repo en [vercel.com](https://vercel.com)
3. Añadir variables de entorno en Settings
4. Deploy automático

## Desarrollo Futuro

- [ ] Integración con IA para análisis automático de habilidades
- [ ] Sistema de mensajería profesor-estudiante
- [ ] Reportes y estadísticas avanzadas
- [ ] Integración con Google Classroom
- [ ] App móvil

## Soporte

Para problemas o preguntas, abrir un issue en GitHub.

## Licencia

MIT
