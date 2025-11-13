# Solución de Conexión Frontend-Backend

## Problemas Identificados y Solucionados

### 1. ✅ ALLOWED_HOSTS vacío
**Problema:** Django tenía `ALLOWED_HOSTS = []`, lo que podía causar problemas con las peticiones.

**Solución:** Se configuró para incluir los hosts necesarios:
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.56.1', '192.168.1.40']
```

### 2. ✅ Configuración de Cookies CSRF y Sesión
**Problema:** Las cookies no estaban configuradas correctamente para desarrollo con cross-origin.

**Solución:** Se agregó configuración explícita de cookies:
- `SESSION_COOKIE_SAMESITE = 'Lax'`
- `CSRF_COOKIE_SAMESITE = 'Lax'`
- `CSRF_COOKIE_HTTPONLY = False` (para que JavaScript pueda leerlo)
- `CSRF_COOKIE_SECURE = False` (para desarrollo HTTP)

### 3. ✅ Endpoint CSRF mejorado
**Problema:** El endpoint `/api/csrf/` no estaba forzando la creación de la cookie CSRF.

**Solución:** Se agregó el decorador `@ensure_csrf_cookie` para forzar la creación de la cookie.

### 4. ✅ Proxy en Vite para Desarrollo
**Problema:** Las peticiones cross-origin (puerto 8080 → 8000) pueden tener problemas con cookies y CORS.

**Solución:** Se configuró un proxy en Vite que redirige `/api` al backend Django en `localhost:8000`. Esto hace que todas las peticiones parezcan venir del mismo origen, eliminando problemas de CORS y cookies.

### 5. ✅ Mejora en la función ensureCsrf del frontend
**Problema:** Si la cookie CSRF no estaba disponible, el frontend fallaba.

**Solución:** Se mejoró la función para:
- Intentar leer el token desde la cookie
- Si no está disponible, solicitarlo al endpoint `/api/csrf/`
- Si la cookie aún no está disponible, leer el token del JSON response
- Incluir un retry con delay si es necesario

## Configuración Actual

### Backend (Django)
- **Puerto:** 8000
- **URL Base API:** `http://localhost:8000/api`
- **CORS:** Configurado para permitir `localhost:8080` y otros puertos
- **Autenticación:** Session-based con CSRF tokens

### Frontend (Vite + React)
- **Puerto:** 8080
- **URL Base API:** En desarrollo usa `/api` (proxied a `localhost:8000/api`)
- **Proxy:** Configurado en `vite.config.ts` para redirigir `/api` al backend

## Cómo Usar

### 1. Iniciar el Backend Django
```bash
cd gestion_academica
python manage.py runserver
```
El backend estará disponible en `http://localhost:8000`

### 2. Iniciar el Frontend
```bash
cd Front
npm install  # Solo la primera vez
npm run dev
```
El frontend estará disponible en `http://localhost:8080`

### 3. Configuración Opcional: Archivo .env
Si necesitas cambiar la URL del backend, crea un archivo `.env` en la carpeta `Front/`:

```env
VITE_API_BASE=http://localhost:8000/api
```

**Nota:** Con el proxy configurado, esto no es necesario en desarrollo, pero puede ser útil en producción.

## Verificación

Para verificar que todo funciona correctamente:

1. **Abrir el frontend:** `http://localhost:8080`
2. **Verificar que las peticiones API funcionan:**
   - Abrir las herramientas de desarrollador (F12)
   - Ir a la pestaña "Network"
   - Intentar cargar una página que use la API (ej: `/carreras`)
   - Las peticiones a `/api/*` deberían aparecer y responder correctamente

3. **Verificar cookies:**
   - En las herramientas de desarrollador, pestaña "Application" → "Cookies"
   - Deberías ver cookies `csrftoken` y `sessionid` después de hacer login

## Endpoints Disponibles

### Públicos (sin autenticación)
- `GET /api/csrf/` - Obtener token CSRF
- `GET /api/carreras/` - Listar carreras
- `GET /api/carreras/<id>/materias/` - Materias por carrera
- `POST /api/login/` - Iniciar sesión
- `POST /api/usuarios/registro` - Registro de usuario

### Requieren Autenticación
- `GET /api/me/` - Información del usuario actual
- `POST /api/logout/` - Cerrar sesión
- `GET /api/alumnos/me/` - Información del alumno
- `GET /api/alumnos/me/notas/` - Notas del alumno
- Y más...

## Troubleshooting

### Error: "No se pudo obtener CSRF token"
- Verifica que el backend esté corriendo en el puerto 8000
- Verifica que el proxy de Vite esté configurado correctamente
- Limpia las cookies del navegador e intenta de nuevo

### Error: "CORS policy"
- Verifica que `CORS_ALLOWED_ORIGINS` en `settings.py` incluya `http://localhost:8080`
- Verifica que el proxy de Vite esté funcionando (las peticiones deberían ir a `/api`, no a `http://localhost:8000/api`)

### Error: "Forbidden (CSRF token missing or incorrect)"
- Verifica que las cookies estén habilitadas en el navegador
- Verifica que `CSRF_COOKIE_HTTPONLY = False` en `settings.py`
- Verifica que el endpoint `/api/csrf/` esté funcionando correctamente

## Notas Importantes

- **Desarrollo:** El proxy de Vite solo funciona en desarrollo (`npm run dev`). En producción, necesitarás configurar un servidor web (nginx, Apache, etc.) para hacer el proxy o configurar CORS correctamente.

- **Producción:** Para producción, deberás:
  1. Cambiar `DEBUG = False` en `settings.py`
  2. Configurar `ALLOWED_HOSTS` con tu dominio
  3. Configurar `CORS_ALLOWED_ORIGINS` con tu dominio frontend
  4. Configurar `CSRF_TRUSTED_ORIGINS` con tu dominio frontend
  5. Cambiar `SESSION_COOKIE_SECURE = True` y `CSRF_COOKIE_SECURE = True` (requiere HTTPS)
  6. Configurar el servidor web para servir el frontend y hacer proxy a Django

