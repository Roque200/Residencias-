export interface CrearSolicitudInput {
  programaId: string;
  nombreSolicitante: string;
  curp: string;
  domicilio: string;
  comunidad: string;
  telefono: string;
}

export interface SolicitudCreada {
  id: string;
  folio: string;
  estatus: string;
  fechaRegistro: string;
}

export interface HistorialItem {
  estatus: string;
  fecha: string;
}

export interface ConsultaFolio {
  folio: string;
  programa: string;
  estatus: string;
  historial: HistorialItem[];
}
