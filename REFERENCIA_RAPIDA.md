# Referencia Rápida - Dónde Está Cada Cosa

## 🔑 Autenticación y Seguridad

### Recuperación de Contraseña
```
URL: http://localhost:3000/auth/forgot-password
Archivo: app/auth/forgot-password/page.tsx
Función: Permite solicitar enlace de recuperación
```

```
URL: http://localhost:3000/auth/reset-password
Archivo: app/auth/reset-password/page.tsx
Función: Permite cambiar contraseña
```

### Login Mejorado
```
URL: http://localhost:3000/auth/login
Archivo: app/auth/login/page.tsx (modificado)
Cambio: Agregado enlace "¿Olvidaste?" junto a contraseña
```

### Signup Mejorado
```
URL: http://localhost:3000/auth/signup
Archivo: app/auth/signup/page.tsx (modificado)
Cambios:
  - Mejor manejo de errores RLS
  - Mensajes de éxito/error claros
  - Redirección automática
```

---

## 👨‍🏫 Gestión de Salones

### Página de Salones
```
URL: http://localhost:3000/dashboard/teacher/classrooms
Archivo: app/dashboard/teacher/classrooms/page.tsx (reescrito)
Cambios:
  ✓ Dropdown de materia con 6 opciones
  ✓ Removido campo de semestre
  ✓ Funcionalidad de editar completa
  ✓ Modal de edición
```

### Opciones de Materia
```javascript
const SUBJECTS = [
  'Matemática',
  'Comunicación',
  'Ciencias Sociales',
  'Inglés',
  'Arte',
  'Educación Física',
]
```

### API de Salones
```
GET /api/classrooms - Listar salones
POST /api/classrooms - Crear salón
GET /api/classrooms/[id] - Obtener uno (NUEVO)
PATCH /api/classrooms/[id] - Editar salón (NUEVO)
DELETE /api/classrooms/[id] - Eliminar salón (NUEVO)

Archivo: app/api/classrooms/[id]/route.ts (nuevo)
```

---

## 👥 Gestión de Alumnos

### Página de Alumnos
```
URL: http://localhost:3000/dashboard/teacher/students
Archivo: app/dashboard/teacher/students/page.tsx (reescrito)
Cambios:
  ✓ Dropdown de alumnos con búsqueda
  ✓ Muestra TODOS los estudiantes registrados
  ✓ Búsqueda en tiempo real
  ✓ Prevención de duplicados
  ✓ Interfaz mejorada
```

### Búsqueda de Alumnos
```javascript
// La búsqueda filtra por:
- Nombre (first_name)
- Apellido (last_name)
- Email

// La búsqueda es case-insensitive
"Carlos" busca "carlos", "CARLOS", "CaRlOs" etc.
```

---

## 📊 Datos y Base de Datos

### Estructura de Salón (Classroom)
```typescript
{
  id: string (UUID)
  teacher_id: string (UUID) // Profesor propietario
  name: string // Ej: "5to A"
  subject: string // Ej: "Matemática"
  year: number // Ej: 2024
  description: string // Opcional
  // ❌ NO TIENE: semester
}
```

### Estructura de Alumno (Student)
```typescript
{
  id: string (UUID)
  email: string
  first_name: string
  last_name: string
  enrollment_number: string
}
```

### Estructura de Inscripción (Enrollment)
```typescript
{
  id: string (UUID)
  student_id: string (UUID)
  classroom_id: string (UUID)
  created_at: timestamp
}
```

---

## 🔒 Seguridad y Validaciones

### Row Level Security (RLS)
```
Habilitado en:
✓ teachers - Cada profesor ve solo sus datos
✓ students - Cada estudiante ve solo sus datos
✓ classrooms - Solo el profesor propietario puede editar
✓ enrollments - Datos protegidos
✓ grades - Solo el profesor propietario puede ver/editar
```

### Validaciones en Classrooms
```
Campo 'name':
  - Requerido
  - Min: 1 carácter

Campo 'subject':
  - Requerido
  - Solo 6 opciones predefinidas

Campo 'year':
  - Número entre 2024 y 2050
  
Campo 'description':
  - Opcional
  - Max: sin límite en BD
```

---

## 🎨 Componentes y UI

### Elementos Nuevo
```
Modal de Editar Salón:
  - Aparece cuando haces clic en "Editar"
  - Muestra todos los campos
  - Tiene botón X para cerrar
  - Tiene "Guardar Cambios" y "Cancelar"

Dropdown de Materia:
  - 6 opciones visuales
  - Se puede cambiar fácilmente
  - Valor por defecto: "Matemática"

Búsqueda de Alumnos:
  - Input con ícono de lupa
  - Filtra en tiempo real
  - Muestra max 10 resultados
  - Selección visual con box verde
```

---

## 🔄 Flujos Principales

### Crear y Editar Salón
```
1. Ve a "Mis Salones"
2. Click "Nuevo Salón"
3. Rellena:
   - Nombre (ej: 5to A)
   - Materia (elige del dropdown)
   - Año (ej: 2024)
   - Descripción (opcional)
4. Click "Crear Salón"

PARA EDITAR:
1. Click "Editar" en el salón
2. Cambia los datos que quieras
3. Click "Guardar Cambios"
4. Click "Cancelar" para no guardar
```

### Agregar Alumno a Salón
```
1. Ve a "Alumnos"
2. Click "Agregar Estudiante"
3. Selecciona el salón
4. Busca alumno (escribe nombre/email)
5. Click en alumno de la lista
6. Click "Agregar Estudiante"

VALIDACIONES:
- No permite duplicados
- Requiere alumno y salón
- Muestra errores claros
```

### Recuperar Contraseña
```
1. En login, click "¿Olvidaste?"
2. Ingresa email
3. Click "Enviar Enlace"
4. Haz clic en el enlace del email
5. Ingresa nueva contraseña
6. Click "Cambiar Contraseña"
7. Inicia sesión con nueva contraseña
```

---

## 📝 Archivos de Documentación

```
LEER_PRIMERO.md (este es el mejor para empezar)
├─ Resumen de cambios
├─ Cómo empezar
└─ Preguntas frecuentes

CAMBIOS_REALIZADOS.md (detalles técnicos)
├─ Cada cambio explicado
├─ Archivos nuevos y modificados
└─ Notas técnicas

TESTING_GUIDE.md (guía paso a paso)
├─ Test de cada funcionalidad
├─ Pasos exactos a seguir
├─ Validaciones esperadas
└─ Checklist

REFERENCIA_RAPIDA.md (este archivo)
├─ Dónde está cada cosa
├─ Estructura de datos
└─ Flujos principales

RESUMEN_CAMBIOS.txt (resumen visual)
└─ Vista rápida de cambios
```

---

## 🐛 Debugging

### Si algo no funciona...

**Error: "No se pudieron cargar los salones"**
- Verifica que iniciaste sesión
- Verifica que eres profesor
- Revisa la consola del navegador

**Error: "Este estudiante ya está inscrito"**
- Es normal, significa que previene duplicados
- Escoge otro alumno

**Error: "Campo requerido"**
- Completa el campo indicado
- Los campos con * son obligatorios

**Editar salón no funciona**
- Asegúrate de ser el profesor creador
- Recarga la página
- Intenta de nuevo

---

## 🚀 Deployment

### En Vercel
```
1. Conecta tu repositorio GitHub
2. Vercel detecta Next.js automáticamente
3. Configura variables de entorno (Supabase)
4. Click "Deploy"
```

### Variables de Entorno Necesarias
```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

---

## 📞 Soporte Rápido

**¿Cómo veo todos los cambios?**
→ Lee CAMBIOS_REALIZADOS.md

**¿Cómo pruebo todo?**
→ Lee TESTING_GUIDE.md

**¿Cómo empiezo rápido?**
→ Lee LEER_PRIMERO.md

**¿Dónde está el código?**
→ Usa esta referencia rápida

---

**Última actualización: Abril 2026**
**Versión: 1.0 (Todos los cambios implementados)**
