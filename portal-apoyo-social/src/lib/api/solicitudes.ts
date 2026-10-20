import { apiFetch } from "./client";
import type {
  CrearSolicitudInput,
  SolicitudCreada,
  ConsultaFolio,
} from "@/types/solicitud";

export function crearSolicitud(
  datos: CrearSolicitudInput
): Promise<SolicitudCreada> {
  return apiFetch<SolicitudCreada>("/api/solicitudes", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function consultarPorFolio(folio: string): Promise<ConsultaFolio> {
  return apiFetch<ConsultaFolio>(`/api/solicitudes/folio/${folio}`);
}

export function subirDocumento(solicitudId: string, formData: FormData) {
  return apiFetch(`/api/solicitudes/${solicitudId}/documentos`, {
    method: "POST",
    body: formData,
  });
}
