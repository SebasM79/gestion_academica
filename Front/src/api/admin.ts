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
// Obtener estadísticas generales para el dashboard admin
export async function fetchAdminStats() {
    return apiFetch<{ totalUsuarios: number; totalCarreras: number; totalMaterias: number; totalAlumnos: number }>('/admin/stats/');
}
// Obtener todas las materias
export async function fetchAllMaterias() {
    return apiFetch<Materia[]>('/admin/materias/');
}
//Obtener todos los alumnos
export async function fetchAllAlumnos() {
    return apiFetch<Alumno[]>('/admin/alumnos/');
}
//Obtener todas las inscripciones
export async function fetchAllInscripciones() {
    return apiFetch<any[]>('/admin/inscripciones/');
}
//Obtener todos los usuarios pendientes
export async function fetchPendingUsers() {
    return apiFetch<any[]>('/admin/usuarios/pendientes/');
}
//Aprobar usuario pendiente
export async function approvePendingUser(userId: number) {
    return apiPatch<any>(`/admin/usuarios/pendientes/${userId}/aprobar/`, {});
}