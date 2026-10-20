export interface Programa {
  id: string;
  nombre: string;
  descripcion: string;
  requisitos: string;
  cupoTotal: number;
  cupoDisponible: number;
  fechaInicio: string;
  fechaFin: string;
  estatus: "activo" | "cerrado" | "proximamente";
}
