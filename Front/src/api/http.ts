// En desarrollo con proxy de Vite, usamos /api (mismo origen)
// En producción, usar la variable de entorno VITE_API_BASE
export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'http://localhost:8000/api');

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

export async function ensureCsrf(): Promise<string> {
  let token = getCookie('csrftoken');
  if (!token) {
    // Solicitar token CSRF y establecer cookie
    const response = await fetch(`${API_BASE}/csrf/`, { 
      credentials: 'include',
      method: 'GET',
    });
    // Intentar leer de la cookie primero
    token = getCookie('csrftoken');
    // Si aún no está en la cookie, intentar leer del JSON response
    if (!token) {
      try {
        const data = await response.json();
        token = data.csrfToken;
      } catch (e) {
        // Si falla, intentar una vez más desde la cookie después de un breve delay
        await new Promise(resolve => setTimeout(resolve, 100));
        token = getCookie('csrftoken');
      }
    }
  }
  if (!token) throw new Error('No se pudo obtener CSRF token');
  return token;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[] | string>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  // Método para obtener un mensaje formateado de todos los errores
  getFormattedMessage(): string {
    if (this.errors) {
      const errorMessages: string[] = [];
      for (const [field, messages] of Object.entries(this.errors)) {
        if (Array.isArray(messages)) {
          errorMessages.push(`${field}: ${messages.join(', ')}`);
        } else {
          errorMessages.push(`${field}: ${messages}`);
        }
      }
      return errorMessages.join('\n');
    }
    return this.message;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  
  if (!res.ok) {
    let errorData: any = null;
    const contentType = res.headers.get('content-type');
    
    // Intentar parsear como JSON si el content-type indica que es JSON
    if (contentType && contentType.includes('application/json')) {
      try { 
        errorData = await res.json(); 
      } catch (e) {
        // Si falla el parseo JSON, usar el status text
        throw new ApiError(res.statusText, res.status);
      }
    } else {
      // Si no es JSON, intentar leer como texto
      try {
        const text = await res.text();
        throw new ApiError(text || res.statusText, res.status);
      } catch (e) {
        throw new ApiError(res.statusText, res.status);
      }
    }
    
    // Django REST Framework devuelve errores en diferentes formatos:
    // 1. {"detail": "mensaje"} - error general
    // 2. {"field": ["error1", "error2"]} - errores de validación de campo
    // 3. {"field": "error"} - error de campo único
    if (errorData?.detail) {
      throw new ApiError(errorData.detail, res.status, errorData);
    } else if (errorData?.error) {
      throw new ApiError(errorData.error, res.status, errorData);
    } else if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
      // Errores de validación de campos específicos
      const errorMessage = Object.entries(errorData)
        .map(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .join('\n') || res.statusText;
      throw new ApiError(errorMessage, res.status, errorData);
    } else {
      throw new ApiError(res.statusText, res.status);
    }
  }
  
  // Leer la respuesta exitosa
  const contentType = res.headers.get('content-type');
  const text = await res.text();
  
  // Si no hay contenido, devolver undefined
  if (!text || text.trim() === '') {
    return undefined as unknown as T;
  }
  
  // Si el content-type indica JSON, intentar parsearlo
  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      // Si falla el parseo JSON pero el content-type dice que es JSON, 
      // puede ser un problema de encoding o formato
      console.warn('Error parsing JSON response:', e);
      return undefined as unknown as T;
    }
  }
  
  // Si no es JSON, devolver el texto como está
  return text as unknown as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const csrf = await ensureCsrf();
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 
      'X-CSRFToken': csrf,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const csrf = await ensureCsrf();
  return apiFetch<T>(path, {
    method: 'PATCH',
    headers: { 
      'X-CSRFToken': csrf,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  const csrf = await ensureCsrf();
  return apiFetch<T>(path, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrf },
  });
}
