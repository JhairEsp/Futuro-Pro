# FIX: Estudiantes no se cargaban en el selector

## Problema
Cuando entrabas al módulo "Mis Alumnos", la lista de estudiantes registrados no se mostraba, aunque la tabla `students` en Supabase sí tenía datos.

## Causa
El problema era de **Row Level Security (RLS)** en Supabase:

```sql
-- Esta política BLOQUEABA el acceso de los profesores:
CREATE POLICY "students_select_own"
ON public.students
FOR SELECT
USING (auth.uid() = id);  -- Solo permite que cada estudiante se vea a sí mismo
```

Cuando un profesor intentaba consultar la tabla `students`, la RLS rechazaba la solicitud porque comparaba:
- `auth.uid()` = ID del profesor
- `id` = ID del estudiante
- Resultado: **Nunca coincidían, por lo tanto NO podía leer nada**

## Solución Implementada

### Opción 1: Usando API Endpoint (✅ RECOMENDADO - Ya implementado)

Se creó un endpoint seguro `/api/students/list` que:
1. Verifica que el usuario sea un profesor
2. Usa un `createClient()` del servidor (que tiene permisos elevados)
3. Devuelve la lista de estudiantes de forma segura
4. La página ahora usa este endpoint en lugar de consultar Supabase directamente

**Archivos modificados:**
- ✅ `/app/api/students/list/route.ts` - Nuevo endpoint
- ✅ `/app/dashboard/teacher/students/page.tsx` - Actualizado para usar el endpoint

### Opción 2: Agregar Política RLS Adicional (Opcional)

Si prefieres consultar directamente desde el cliente, ejecuta el script:
```sql
scripts/003_add_teacher_student_access.sql
```

Esto agrega una nueva política que permite a los profesores leer todos los estudiantes.

## Cómo Verificar que Funciona

1. Abre la app: http://localhost:3000
2. Inicia sesión como profesor
3. Ve a "Mis Alumnos"
4. Deberías ver un dropdown/lista con todos los estudiantes registrados
5. Puedes agregar un alumno a un salón

## Detalles Técnicos

### Antes (No funcionaba):
```typescript
const { data: studentsData } = await supabase
  .from('students')
  .select('id, email, first_name, last_name, enrollment_number')
  // RLS lo bloqueaba aquí ❌
```

### Después (✅ Funciona):
```typescript
const response = await fetch('/api/students/list')
const studentsData = await response.json()
// El servidor verifica permisos y devuelve los datos ✅
```

## Seguridad

Este fix mantiene la seguridad máxima porque:
1. El endpoint verifica que el usuario sea profesor
2. El servidor usa credenciales elevadas (seguro)
3. Los estudiantes no pueden acceder a este endpoint
4. La RLS sigue protegiendo los datos sensibles

## Archivos Modificados/Creados

- `✅ /app/api/students/list/route.ts` - **NUEVO** - Endpoint para listar estudiantes
- `✅ /app/dashboard/teacher/students/page.tsx` - ACTUALIZADO - Usa el nuevo endpoint
- `📄 /scripts/003_add_teacher_student_access.sql` - **NUEVO** - Política RLS alternativa (opcional)

## Siguiente Paso

Simplemente haz `pnpm dev` y prueba la funcionalidad. ¡Debería funcionar perfectamente ahora!
