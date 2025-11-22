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

// Nota completa para vistas de alumno (incluye la materia relacionada)
export type NotaAlumno = {
  id: number;
  alumno: number;
  materia: Materia;
  profesor: number | null;
  nota: number;
  fecha_creacion: string;
  fecha_modificacion: string;
  observaciones?: string;
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

export type AlumnoMateriaNota = {
  alumno: Alumno;
  materia: Materia;
  nota: NotaLite | null;
};

export async function fetchAdminAlumnosNotas() {
  return apiFetch<AlumnoMateriaNota[]>(`/admin/alumnos-notas/`);
}

// Alumno: obtener sus propias notas con detalle de materia
export async function fetchAlumnoNotas() {
  return apiFetch<NotaAlumno[]>(`/alumnos/me/notas/`);
}
