//Aca ira las funcionalidades/endpoints del admin

/*
Puede crear, modificar y eliminar: carreras,
materias, alumnos y usuarios. Puede ver
todas las inscripciones.
Alumno Puede ver la oferta acadé
*/
import { Carrera } from './catalogo';
import { apiFetch , apiPost, apiPatch, apiDelete } from './http';

export type Materia = {
  id: number;
  nombre: string;
  horario: string;
  cupo: number;
  carrera: Carrera;
};
export type Alumno = {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono: string | null;
    direccion: string | null;
    fecha_nacimiento: Date | null;
    carrera_principal: Carrera | null;
}
export type Docente = {
    id: number;
    nombre: string;
    apellido: string;
    cargo: string;
}
//ENDPOINTS STATS ADMIN
// Obtener estadísticas generales para el dashboard admin
export async function fetchAdminStats() {
    return apiFetch<{ totalUsuarios: number; totalCarreras: number; totalMaterias: number; totalAlumnos: number }>('/admin/stats/');
}
// Obtener todas las materias
export async function fetchAllMaterias() {
    return apiFetch<Materia[]>('/admin/materias/');
}
//Obtener todas las materias de una carrera
export async function fetchMateriasByCarrera(carreraId: number) {
    return apiFetch<Materia[]>(`carreras/${carreraId}/materias/`);
}

//Obtener todos los alumnos
export async function fetchAllAlumnos() {
    return apiFetch<Alumno[]>('/admin/alumnos/');
}

// Actualizar alumno 
export async function updateAlumno(alumnoId: number, data: Partial<Alumno>) {
    return apiPatch<Alumno>(`/admin/alumnos/${alumnoId}`, data);
}

// Eliminar alumno
export async function deleteAlumno(alumnoId: number) {
    return apiDelete<void>(`/admin/alumnos/${alumnoId}`);
}

//Obtener materias y notas de un alumno
export async function fetchAlumnoMateriasNotas(alumnoId: number) {
    return apiFetch<any[]>(`/preceptor/alumnos/${alumnoId}/materias-notas/`);
}

//ENDPOINTS INSCRIPCIONES
//Obtener todas las inscripciones
export async function fetchAllInscripciones() {
    return apiFetch<any[]>('/admin/inscripciones/');
}

//ENDPOINTS USUARIOS
//Obtener todos los usuarios pendientes
export async function fetchPendingUsers() {
    return apiFetch<any[]>('/admin/usuarios/pendientes/');
}
//Aprobar usuario pendiente
export async function approvePendingUser(userId: number) {
    return apiPatch<any>(`/admin/usuarios/pendientes/${userId}/aprobar/`, {});
}

//Rechazar usuario pendiente
export async function rejectPendingUser(userId: number) {
    return apiPatch<any>(`/admin/usuarios/pendientes/${userId}/rechazar/`, {});
}

//ENDPOINTS CARRERAS
/**Crear nueva carrera*/
export async function createCarrera(data: { nombre: string; duracion_anios: number; descripcion: string }) {
  return apiPost<Carrera>('/admin/carreras', data);
}

/**Actualizar carrera existente*/
export async function updateCarrera(carreraId: number, data: Partial<Carrera>) {
  return apiPatch<Carrera>(`/admin/carreras/${carreraId}`, data);
}

/**Eliminar carrera*/
export async function deleteCarrera(carreraId: number) {
  return apiDelete<{ ok: boolean }>(`/admin/carreras/${carreraId}`);
}

//ENDPOINTS MATERIAS
// Crear materia (Admin)
export async function createMateria(data: { nombre: string; horario?: string; cupo?: number; carrera: number }) {
    return apiPost<Materia>('/admin/materia', data);
}

// Actualizar materia (Admin)
export async function updateMateria(materiaId: number, data: Partial<{ nombre: string; horario: string; cupo: number; carrera: number }>) {
    return apiPatch<Materia>(`/admin/materia/${materiaId}`, data);
}

// Eliminar materia (Admin)
export async function deleteMateria(materiaId: number) {
    return apiDelete<{ ok: boolean }>(`/admin/materia/${materiaId}`);
}

//ENDPOINTS DOCENTES
export async function fetchAllDocentes() {
    return apiFetch<Docente[]>('/admin/docentes');
}