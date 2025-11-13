# Cambios en Validación de Contraseña y Registro

## Problema Identificado

El problema estaba en cómo se validaba la contraseña. Los validadores de Django, especialmente `UserAttributeSimilarityValidator`, necesitan un usuario para validar correctamente si la contraseña es similar al username, nombre, apellido, etc.

## Soluciones Implementadas

### 1. Validación de Contraseña Mejorada

**Antes:**
- La contraseña se validaba en `validate_password1` sin información del usuario
- `UserAttributeSimilarityValidator` no podía validar correctamente

**Ahora:**
- La validación se hace en el método `validate` después de tener todos los datos
- Se crea un usuario temporal con los datos disponibles (nombre, apellido, email, dni) para la validación
- Esto permite que todos los validadores de Django funcionen correctamente

### 2. Creación de Usuario Mejorada

**Antes:**
- Solo se creaba el usuario con username y password
- No se guardaban nombre, apellido, email en el usuario

**Ahora:**
- Se crea el usuario con todos los datos disponibles (username, password, email, first_name, last_name)
- Esto mejora la experiencia del usuario y permite mejor validación

### 3. Manejo de Errores Mejorado

**Mejoras:**
- Todos los mensajes de error están en formato de lista para consistencia con DRF
- Se agregó logging para debugging
- Mejor manejo de errores de duplicados
- Normalización de `cargo_solicitado` (cadena vacía para ALUMNO, valor por defecto para PERSONAL)

### 4. Frontend Mejorado

**Mejoras:**
- Se asegura que los datos se envíen correctamente
- Se manejan campos opcionales (telefono, direccion) correctamente
- Se normaliza `cargo_solicitado` antes de enviar
- Se agregó logging de errores en consola para debugging
- Los errores se muestran por más tiempo (5 segundos)

## Cambios en el Código

### Backend (`api/serializers.py`)

1. **Método `validate`:**
   - Valida contraseñas con usuario temporal
   - Valida DNI duplicado
   - Valida registros pendientes
   - Todos los errores en formato de lista

2. **Método `create`:**
   - Crea usuario con todos los datos (nombre, apellido, email)
   - Normaliza `cargo_solicitado`
   - Mejor manejo de errores con logging
   - Limpieza de usuario si falla el registro

### Backend (`api/views.py`)

1. **RegistroUsuarioView:**
   - Manejo de errores no manejados
   - Logging para debugging

### Frontend (`Front/src/paginas/Registro.tsx`)

1. **handleRegistro:**
   - Normalización de datos antes de enviar
   - Manejo de campos opcionales
   - Mejor logging de errores
   - Errores visibles por más tiempo

## Validadores de Contraseña de Django

Los siguientes validadores están configurados en `settings.py`:

1. **UserAttributeSimilarityValidator**: Verifica que la contraseña no sea similar al username, nombre, apellido, etc.
2. **MinimumLengthValidator**: Verifica que la contraseña tenga al menos 8 caracteres
3. **CommonPasswordValidator**: Verifica que la contraseña no sea una contraseña común
4. **NumericPasswordValidator**: Verifica que la contraseña no sea completamente numérica

## Pruebas Recomendadas

1. **Contraseña similar al DNI:**
   - DNI: "12345678"
   - Contraseña: "12345678"
   - Debe fallar: "La contraseña es muy similar al nombre de usuario"

2. **Contraseña similar al nombre:**
   - Nombre: "Juan"
   - Contraseña: "juan1234"
   - Debe fallar: "La contraseña es muy similar a la información personal"

3. **Contraseña muy corta:**
   - Contraseña: "1234"
   - Debe fallar: "Este campo no puede tener menos de 8 caracteres"

4. **Contraseña común:**
   - Contraseña: "password123"
   - Puede fallar dependiendo de la lista de contraseñas comunes

5. **DNI duplicado:**
   - Intentar registrar con un DNI que ya existe
   - Debe fallar: "Ya existe un usuario con ese DNI"

6. **Registro exitoso:**
   - Contraseña válida (mínimo 8 caracteres, no similar a datos personales)
   - DNI único
   - Todos los campos requeridos completos
   - Debe funcionar correctamente

## Notas Importantes

- La validación de contraseña ahora usa un usuario temporal con todos los datos disponibles
- Esto permite que `UserAttributeSimilarityValidator` funcione correctamente
- Los errores ahora se muestran correctamente en el frontend
- Se agregó logging para facilitar el debugging
- El usuario se crea con todos los datos disponibles (nombre, apellido, email)

