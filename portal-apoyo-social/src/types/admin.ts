import type { Programa } from "@/types/programa";

export type Rol = "capturista" | "revisor" | "administrador";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export interface LoginRespuesta {
  token: string;
  usuario: Usuario;
}

export interface Resumen {
  totalSolicitudes: number;
  porEstatus: Record<string, number>;
  porPrograma: Record<string, number>;
}

export type ProgramaAdmin = Programa;

export interface ProgramaInput {
  nombre: string;
  descripcion: string;
  requisitos: string;
  cupoTotal: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface SolicitudItem {
  id: string;
  folio: string;
  programaNombre: string;
  nombreSolicitante: string;
  comunidad: string;
  estatus: string;
  fechaRegistro: string;
}

export interface DocumentoAdmin {
  id: string;
  tipoDocumento: string;
  urlArchivo: string;
  fechaCarga: string;
}

export interface HistorialDetalle {
  estatusAnterior: string | null;
  estatusNuevo: string;
  comentario: string | null;
  fecha: string;
}

export interface SolicitudDetalle {
  id: string;
  folio: string;
  programaId: string;
  programaNombre: string;
  nombreSolicitante: string;
  curp: string;
  domicilio: string;
  comunidad: string;
  telefono: string;
  estatus: string;
  fechaRegistro: string;
  documentos: DocumentoAdmin[];
  historial: HistorialDetalle[];
}

export interface FiltrosSolicitudes {
  programaId?: string;
  comunidad?: string;
  estatus?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}
