import { apiFetch, apiPost, ApiError } from './http';

export type MeResponse = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  rol: string | null;
  perfil?: any;
};

export async function fetchMe() {
  return apiFetch<MeResponse>('/me/');
}

export async function loginDni(dni: string, password: string) {
  return apiPost<{ ok: boolean; rol: string | null , must_change_password: boolean}>("/login/", { dni, password });
}

export async function changePassword(new_password1: string, new_password2: string) {
  return apiPost<{ ok: boolean }>("/me/change-password/", { new_password1, new_password2 });
}

export async function logout() {
  return apiPost<{ ok: boolean }>("/logout/", {});
}

export type RegistroPayload = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol_solicitado: 'ALUMNO' | 'PERSONAL';
  cargo_solicitado?: 'ADMIN' | 'DOCENTE' | 'PRECEPTOR' | '';
  carrera_solicitada?: number;
};

export async function registroUsuario(payload: RegistroPayload) {
  return apiPost<{ ok: boolean; estado: string }>("/usuarios/registro/", payload);
}
