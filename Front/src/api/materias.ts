import { apiFetch, apiPost } from './http';

export type Carrera = {
  id: number;
  nombre: string;
  duracion_anios: number;
  descripcion: string;
};

export type Materia = {
  id: number;
  nombre: string;
  horario: string;
  cupo: number;
  carrera: Carrera;
};

export type MateriaWithCount = Materia & { total_alumnos: number };

export async function fetchDocenteMaterias() {
  return apiFetch<Materia[]>('/docente/materias/');
}

export async function fetchAdminMateriasWithCount() {
  return apiFetch<MateriaWithCount[]>('/admin/materias/');
}

export async function fetchAlumnoMaterias() {
  return apiFetch<Materia[]>('/alumnos/me/materias/');
}

export type Alumno = {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
};

export type NotaLite = {
  id: number;
  nota: number;
  observaciones?: string;
  fecha_modificacion: string;
};

export type AlumnoConNota = {
  alumno: Alumno;
  nota: NotaLite | null;
};

export async function fetchDocenteAlumnosNotas(materiaId: number) {
  return apiFetch<AlumnoConNota[]>(`/docente/materias/${materiaId}/alumnos/`);
}

export async function upsertNota(payload: { alumno: number; materia: number; nota: number; observaciones?: string }) {
  return apiPost('/docente/notas/', payload);
}
