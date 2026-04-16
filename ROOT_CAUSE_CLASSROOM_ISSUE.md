# Root Cause Analysis: Classrooms Mostrando "Desconocido"

## Problema Identificado
Las calificaciones del estudiante mostraban "Desconocido" en lugar de la materia y nombre del salón. Las habilidades no se calculaban porque no había información de asignatura.

## Causa Raíz
**Row Level Security (RLS) en la tabla `classrooms`**

La política RLS en la línea 73 de `scripts/001_create_tables.sql`:
```sql
CREATE POLICY "classrooms_select_own_teacher" ON public.classrooms FOR SELECT USING (auth.uid() = teacher_id);
```

Esta política solo permite a los **profesores** ver sus propios salones. Los **estudiantes NO PUEDEN VER** las classrooms aunque estén inscritos en ellas.

## Logs que Confirmaron el Problema
```
[v0] classroomIds: [ '896cc409-3cdb-4f2d-a96b-81e825086fe1' ]
[v0] classrooms data: []  ← Array vacío!
[v0] classroom error: null ← Sin error RLS reportado
```

El query devuelve un array vacío porque la política RLS filtra implícitamente las filas.

## Solución Implementada
Agregar nueva política RLS que permite a estudiantes ver classrooms donde están inscritos:

```sql
CREATE POLICY "classrooms_select_enrolled_students" ON public.classrooms FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.classroom_id = classrooms.id
    AND e.student_id = auth.uid()
  )
);
```

## Pasos para Aplicar
1. Abre tu Supabase dashboard
2. Ve a SQL Editor
3. Ejecuta el contenido de: `scripts/004_fix_classroom_rls_for_students.sql`
4. Recarga la app (pnpm dev)

## Resultado Esperado Después del Fix
- ✅ "Mis Calificaciones" mostrará: "Matemática - Salón A" 
- ✅ "Análisis de Habilidades" calculará correctamente desde el subject
- ✅ El gráfico radar se actualizará con valores reales
- ✅ Las recomendaciones de carreras mostrarán porcentajes correctos
