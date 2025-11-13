import { apiFetch } from './http';

export type Carrera = {
  id: number;
  nombre: string;
  duracion_anios: number;
  descripcion: string;
};

export async function fetchCarreras() {
  return apiFetch<Carrera[]>('/carreras/');
}
