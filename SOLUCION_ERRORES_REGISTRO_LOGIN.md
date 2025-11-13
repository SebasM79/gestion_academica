# Solución de Errores de Registro y Login

## Problemas Identificados y Solucionados

### 1. ✅ Manejo de Errores de Validación
**Problema:** Los errores de validación del backend (como contraseñas inválidas, campos duplicados, etc.) no se mostraban correctamente en el frontend.

**Solución:**
- Creada clase `ApiError` personalizada en `Front/src/api/http.ts` para manejar errores de API
- Mejorado el manejo de errores en `apiFetch` para detectar y formatear diferentes tipos de errores:
  - Errores generales: `{"detail": "mensaje"}`
  - Errores de validación de campos: `{"campo": ["error1", "error2"]}`
  - Errores de campo único: `{"campo": "error"}`
- Actualizado el frontend para usar `getFormattedMessage()` y mostrar errores formateados

### 2. ✅ Validación de Contraseñas
**Problema:** Las contraseñas no se validaban correctamente antes de crear el usuario, causando errores poco claros.

**Solución:**
- Agregada validación de longitud mínima (8 caracteres) en el serializer
- Agregada validación usando los validadores de Django (`validate_password`) en el método `validate_password1`
- Los errores de validación de contraseña ahora se muestran correctamente al usuario

### 3. ✅ Manejo de Errores al Crear Usuario
**Problema:** Cuando fallaba la creación del usuario (por contraseña inválida, usuario duplicado, etc.), los errores no se manejaban correctamente.

**Solución:**
- Mejorado el método `create` en `RegistroUsuarioSerializer` para:
  - Capturar `DjangoValidationError` específicamente
  - Convertir errores de Django a errores de DRF
  - Manejar errores de usuario duplicado con mensajes claros
  - Limpiar el usuario creado si falla la creación del registro

### 4. ✅ Validación de DNI Duplicado
**Problema:** No se validaba si el DNI ya estaba en uso o tenía un registro pendiente.

**Solución:**
- Agregada validación para verificar si el DNI ya existe en `User`
- Agregada validación para verificar si el DNI tiene un registro pendiente
- Mensajes de error claros para cada caso

### 5. ✅ Encoding UTF-8
**Problema:** Posibles problemas con caracteres especiales (tildes, ñ, etc.) en nombres y apellidos.

**Solución:**
- Django por defecto usa UTF-8, que está correctamente configurado
- El JSON se envía y recibe con `Content-Type: application/json; charset=utf-8`
- Los errores ahora se manejan correctamente sin problemas de encoding

## Cambios Realizados

### Backend (Django)

#### `api/serializers.py`
- Agregados imports para validación de contraseñas
- Agregada validación de longitud mínima en campos `password1` y `password2`
- Agregado método `validate_password1` que usa los validadores de Django
- Mejorado método `validate` para validar DNI duplicado y registros pendientes
- Mejorado método `create` para manejar errores correctamente

#### `api/views.py`
- El endpoint de registro ya estaba correcto, solo necesitaba mejoras en el serializer

### Frontend (React + TypeScript)

#### `Front/src/api/http.ts`
- Creada clase `ApiError` para manejar errores de API
- Mejorado `apiFetch` para manejar diferentes formatos de error
- Mejorado el manejo de respuestas JSON y texto

#### `Front/src/paginas/Registro.tsx`
- Actualizado para usar `getFormattedMessage()` en errores
- Los errores ahora se muestran correctamente al usuario

#### `Front/src/paginas/Login.tsx`
- Actualizado para usar `getFormattedMessage()` en errores
- Los errores ahora se muestran correctamente al usuario

## Cómo Funciona Ahora

### Registro de Usuario

1. **Validación en el Frontend:**
   - Verifica que las contraseñas coincidan
   - Envía los datos al backend

2. **Validación en el Backend:**
   - Valida longitud mínima de contraseña (8 caracteres)
   - Valida contraseña usando validadores de Django (complejidad, similitud con usuario, etc.)
   - Verifica que las contraseñas coincidan
   - Verifica que el DNI no esté en uso
   - Verifica que el DNI no tenga un registro pendiente

3. **Creación del Usuario:**
   - Crea el usuario con `create_user()` (que valida la contraseña)
   - Si falla, captura el error y lo convierte en un error de validación
   - Crea el registro de usuario
   - Si falla, elimina el usuario creado y muestra el error

4. **Manejo de Errores:**
   - Los errores se formatean correctamente
   - Se muestran al usuario con mensajes claros
   - Los errores de campo específico se muestran correctamente

### Login de Usuario

1. **Validación en el Frontend:**
   - Envía DNI y contraseña al backend

2. **Validación en el Backend:**
   - Autentica el usuario usando `authenticate()`
   - Si falla, devuelve error 401 con mensaje claro

3. **Manejo de Errores:**
   - Los errores se muestran correctamente al usuario
   - Los mensajes son claros y específicos

## Mensajes de Error Comunes

### Registro
- **Contraseñas no coinciden:** "Las contraseñas no coinciden"
- **Contraseña muy corta:** "Este campo no puede tener menos de 8 caracteres"
- **Contraseña común:** "Esta contraseña es muy común"
- **Contraseña similar al usuario:** "La contraseña es muy similar al nombre de usuario"
- **DNI duplicado:** "Ya existe un usuario con ese DNI" o "Ya existe una solicitud de registro pendiente para este DNI"

### Login
- **Credenciales inválidas:** "Credenciales inválidas"
- **Usuario inactivo:** El usuario no puede iniciar sesión si está inactivo (requiere aprobación del administrador)

## Pruebas

Para probar los cambios:

1. **Registro con contraseña corta:**
   - Intentar registrar con contraseña de menos de 8 caracteres
   - Debe mostrar error: "password1: Este campo no puede tener menos de 8 caracteres"

2. **Registro con contraseñas que no coinciden:**
   - Ingresar contraseñas diferentes
   - Debe mostrar error: "password2: Las contraseñas no coinciden"

3. **Registro con DNI duplicado:**
   - Intentar registrar con un DNI que ya existe
   - Debe mostrar error: "dni: Ya existe un usuario con ese DNI"

4. **Login con credenciales inválidas:**
   - Intentar iniciar sesión con DNI o contraseña incorrectos
   - Debe mostrar error: "Credenciales inválidas"

5. **Registro con caracteres especiales:**
   - Registrar con nombres que contengan tildes, ñ, etc.
   - Debe funcionar correctamente sin errores de encoding

## Notas Importantes

- Las contraseñas deben tener al menos 8 caracteres
- Las contraseñas son validadas por los validadores de Django (complejidad, similitud, etc.)
- Los usuarios creados están inactivos hasta que un administrador los apruebe
- El DNI se usa como nombre de usuario (`username`)
- Los errores ahora se muestran correctamente en español con mensajes claros

