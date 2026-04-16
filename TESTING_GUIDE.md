# Guía de Testing - Cambios Implementados

## Setup Inicial

1. Asegúrate de tener la app corriendo: `pnpm dev`
2. Accede a `http://localhost:3000`
3. Tendrás acceso a las páginas de login y signup

## Test 1: Sistema de Recuperación de Contraseña

### Paso 1: Solicitar Recuperación
1. Ve a la página de login
2. Haz clic en **"¿Olvidaste?"** (junto al campo de contraseña)
3. Deberías ver una página con un campo de email
4. **Esperado**: Página de "Recuperar Contraseña" cargada correctamente

### Paso 2: Solicitar Enlace
1. Ingresa el email de una cuenta existente
2. Haz clic en **"Enviar Enlace de Recuperación"**
3. Deberías ver un mensaje verde de éxito
4. **Esperado**: "Se ha enviado un enlace de recuperación a tu correo..."

### Paso 3: Probar Validaciones
1. Intenta enviar un email inválido
2. **Esperado**: Mensaje de error claro

## Test 2: Corrección de Error en Signup

### Paso 1: Crear Nuevo Usuario
1. Ve a la página de signup
2. Rellena:
   - Rol: Profesor o Estudiante (selecciona Profesor para probar los otros cambios)
   - Nombre: Juan
   - Apellido: Pérez
   - Email: profesor-test-1@ejemplo.com (cambia el número cada vez)
   - Contraseña: MinKey123
   - Repetir Contraseña: MinKey123
3. Haz clic en **"Registrarse"**
4. **Esperado**: 
   - Mensaje verde de éxito: "¡Cuenta creada exitosamente!"
   - Redirección automática después de 2 segundos
   - No debería mostrar error de RLS

### Paso 2: Probar Validaciones
1. Intenta crear cuenta con:
   - Contraseñas que no coincidan → Mensaje de error
   - Email ya existente → Mensaje de error

## Test 3: Selector de Materia

### Paso 1: Crear Salón
1. Inicia sesión como profesor
2. Ve a **"Mis Salones"**
3. Haz clic en **"Nuevo Salón"**
4. Rellena:
   - Nombre del Salón: 5to A
   - Materia: **Haz clic en el dropdown**
5. **Esperado**: Deberías ver exactamente 6 opciones:
   - Matemática
   - Comunicación
   - Ciencias Sociales
   - Inglés
   - Arte
   - Educación Física

### Paso 2: Probar Múltiples Materias
1. Crea 3 salones diferentes:
   - Salón 1: Matemática
   - Salón 2: Comunicación
   - Salón 3: Inglés
2. **Esperado**: Los salones muestran correctamente la materia

## Test 4: Sin Campo de Semestre

### Paso 1: Verificar Ausencia
1. En el formulario de "Nuevo Salón"
2. **Esperado**: NO debe haber ningún campo "Semestre" o "Semestre 1/2"
3. Solo debe haber: Nombre, Materia, Año y Descripción

### Paso 2: Verificar Visualización
1. En la tarjeta de cada salón
2. **Esperado**: Muestra "Año: 2024" pero NO muestra "Semestre"

## Test 5: Selector de Alumnos Mejorado

### Preparación
1. Crea 2-3 cuentas de estudiantes primero:
   - Email: estudiante1@ejemplo.com (Nombre: Carlos)
   - Email: estudiante2@ejemplo.com (Nombre: María)
   - Email: estudiante3@ejemplo.com (Nombre: Diego)

### Paso 1: Agregar Estudiante
1. Inicia sesión como profesor
2. Ve a **"Alumnos"**
3. Haz clic en **"Agregar Estudiante"**
4. **Esperado**: 
   - Modal con dos campos
   - Dropdown de "Seleccionar Salón"
   - Caja de búsqueda con ícono de lupa

### Paso 2: Seleccionar Salón
1. Haz clic en "Seleccionar Salón"
2. Elige un salón que creaste anteriormente
3. **Esperado**: Salón seleccionado correctamente

### Paso 3: Buscar Estudiante
1. En el campo de búsqueda, escribe "Car"
2. **Esperado**: Aparece una lista con Carlos (filtrado)
3. Escribe "estudiante1@"
4. **Esperado**: Filtra por email también
5. Borra el texto
6. **Esperado**: Muestra todos los estudiantes disponibles

### Paso 4: Seleccionar Estudiante
1. Haz clic en "Carlos..." de la lista
2. **Esperado**: 
   - Aparece un box verde con el nombre y email de Carlos
   - Se puede cerrar con la X si cambias de idea
   - El campo de búsqueda se limpia

### Paso 5: Completar Inscripción
1. Haz clic en **"Agregar Estudiante"**
2. **Esperado**: 
   - Modal se cierra
   - Estudiante aparece en la tabla
   - Mensaje de éxito (si es necesario)

### Paso 6: Prevención de Duplicados
1. Intenta agregar el MISMO estudiante al MISMO salón
2. **Esperado**: Mensaje de error: "Este estudiante ya está inscrito en este salón"

## Test 6: Editar Salón

### Paso 1: Abrir Edición
1. Ve a **"Mis Salones"**
2. Haz clic en **"Editar"** en cualquier salón
3. **Esperado**: 
   - Modal que dice "Editar Salón"
   - Campos llenos con datos actuales del salón
   - Botón de cierre (X)

### Paso 2: Cambiar Datos
1. Cambia el nombre a: "6to B"
2. Cambia la materia a: "Arte"
3. Haz clic en **"Guardar Cambios"**
4. **Esperado**: 
   - Modal se cierra
   - Salón muestra "6to B" con materia "Arte"

### Paso 3: Editar con Cambios Múltiples
1. Abre edición de otro salón
2. Cambia: Nombre, Materia, Año y Descripción
3. Haz clic **"Guardar Cambios"**
4. **Esperado**: Todos los cambios se reflejan

### Paso 4: Cancelar Edición
1. Abre edición de un salón
2. Haz cambios
3. Haz clic en **"Cancelar"** o **"X"**
4. **Esperado**: Modal se cierra SIN guardar cambios

## Test 7: Errores y Validaciones

### Test de Validaciones en Salones
1. Intenta crear un salón sin nombre
2. **Esperado**: No permite guardar (campo requerido)
3. Intenta editar con año inválido
4. **Esperado**: Valida correctamente

### Test de Errores en Alumnos
1. Intenta agregar estudiante sin seleccionar salón
2. **Esperado**: Botón deshabilitado o mensaje de error
3. Intenta agregar sin seleccionar estudiante
4. **Esperado**: Botón deshabilitado

## Resumen de Checklist

- [ ] Recuperación de contraseña funciona
- [ ] Signup no muestra error de RLS
- [ ] Dropdown de materia tiene 6 opciones
- [ ] No hay campo de semestre
- [ ] Selector de alumnos muestra lista completa
- [ ] Búsqueda de alumnos funciona
- [ ] Editar salón carga datos correctamente
- [ ] Editar salón guarda cambios
- [ ] No permite duplicados
- [ ] Mensajes de error claros
- [ ] Todas las transiciones son suaves

## Notas Importantes

- **Emails de reset**: En localhost, Supabase usa un panel de prueba. Los emails no se envían realmente, pero el flujo debería funcionar.
- **RLS**: Todos los datos están protegidos por Row Level Security
- **Búsqueda**: Es case-insensitive (busca "carlos" y "CARLOS")
- **Validaciones**: Se validan tanto en cliente como en servidor

## Si Hay Problemas

1. **Error al cargar estudiantes**: Verifica que existan cuentas de estudiantes creadas
2. **Editar no funciona**: Revisa que el profesor propietario intente editar
3. **Búsqueda lenta**: Normal en localhost, mejora en producción
4. **RLS errors**: Asegúrate de que la BD se inicializó correctamente
