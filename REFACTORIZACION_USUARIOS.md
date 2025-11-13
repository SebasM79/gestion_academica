# Refactorización: Frontend usa lógica de usuarios/

## Problema Identificado

El frontend estaba duplicando la lógica de registro en lugar de usar la que ya existe en la app `usuarios/`. Esto causaba:
- Duplicación de código
- Inconsistencias entre el registro web y el registro API
- Mantenimiento más difícil

## Solución Implementada

### 1. API ahora usa `RegistroForm` de `usuarios/`

**Antes:**
- `api/views.py` tenía `RegistroUsuarioView` que usaba `RegistroUsuarioSerializer`
- El serializer duplicaba toda la lógica de creación de usuario y validación

**Ahora:**
- `RegistroUsuarioView` usa directamente `RegistroForm` de `usuarios/forms.py`
- Toda la lógica de registro está centralizada en `usuarios/`
- El frontend y el backend web usan la misma lógica

### 2. `RegistroForm` mejorado

**Mejoras en `usuarios/forms.py`:**
- Validación de contraseña usando `validate_password` con usuario temporal
- Validación de DNI duplicado
- Validación de registros pendientes
- Creación de usuario con todos los datos (nombre, apellido, email)

### 3. Login usa `DNIBackend`

**Configuración:**
- `DNIBackend` ya está configurado en `settings.py` como primer backend de autenticación
- El login en `api/views.py` usa `authenticate()` que automáticamente usa `DNIBackend`
- El backend busca usuarios por DNI (username) o por relación con Alumno/Personal

## Cambios Realizados

### Backend

#### `api/views.py`
- `RegistroUsuarioView` ahora usa `RegistroForm` de `usuarios/forms.py`
- Eliminado el import de `RegistroUsuarioSerializer`
- Los errores del formulario se convierten a formato DRF para el frontend

#### `usuarios/forms.py`
- Agregada validación de contraseña con `validate_password` y usuario temporal
- Agregada validación de DNI duplicado
- Agregada validación de registros pendientes
- Mejorada creación de usuario con todos los datos

#### `api/serializers.py`
- `RegistroUsuarioSerializer` ya no se usa en la API (pero se mantiene por si se necesita en el futuro)
- Toda la lógica de registro está en `usuarios/forms.py`

### Frontend

**Sin cambios necesarios:**
- El frontend sigue usando el mismo endpoint `/api/usuarios/registro`
- Los datos se envían en el mismo formato
- Los errores se reciben en el mismo formato

## Flujo de Registro

1. **Frontend envía datos** → `/api/usuarios/registro`
2. **API recibe datos** → `RegistroUsuarioView.post()`
3. **API crea formulario** → `RegistroForm(data=request.data)`
4. **Formulario valida** → `form.is_valid()`
   - Valida contraseñas
   - Valida DNI duplicado
   - Valida registros pendientes
   - Valida contraseña con validadores de Django
5. **Formulario crea registro** → `form.save()`
   - Crea usuario inactivo con DNI como username
   - Crea registro de usuario con estado PENDIENTE
6. **API responde** → `{"ok": True, "estado": "PENDIENTE"}`

## Flujo de Login

1. **Frontend envía DNI y contraseña** → `/api/login/`
2. **API autentica** → `authenticate(username=dni, password=password)`
3. **DNIBackend busca usuario**:
   - Primero por `User.username == dni`
   - Si no encuentra, busca por `Alumno.dni == dni` o `Personal.dni == dni`
4. **Si encuentra y contraseña es correcta** → `login(request, user)`
5. **API responde** → `{"ok": True, "rol": "ALUMNO" o "PERSONAL:..."}`

## Ventajas de esta Refactorización

1. **Código único**: Una sola fuente de verdad para el registro
2. **Consistencia**: El registro web y API funcionan igual
3. **Mantenimiento**: Cambios en un solo lugar
4. **Validación consistente**: Mismas validaciones en web y API
5. **Uso correcto de usuarios/**: El frontend ahora usa correctamente la app `usuarios/`

## Notas Importantes

- El `DNIBackend` está configurado como primer backend de autenticación
- Los usuarios se crean con `username = DNI` (como está en `RegistroForm`)
- Los usuarios se crean inactivos y requieren aprobación del administrador
- El login funciona con DNI (username) o contraseña
- El frontend no necesita cambios, solo usa la misma API

## Próximos Pasos (Opcional)

Si se quiere eliminar completamente `RegistroUsuarioSerializer`:
1. Verificar que no se use en ningún otro lugar
2. Eliminar el serializer de `api/serializers.py`
3. Actualizar cualquier documentación que lo mencione

Pero por ahora se mantiene por si se necesita en el futuro.

