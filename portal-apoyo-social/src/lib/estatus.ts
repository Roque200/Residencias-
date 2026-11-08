export const ETIQUETAS_ESTATUS: Record<string, string> = {
  recibida: "Recibida",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  entregada: "Entregada",
};

export const ESTATUS_LISTA = [
  "recibida",
  "en_revision",
  "aprobada",
  "rechazada",
  "entregada",
] as const;

// Mismo flujo que valida el backend en SolicitudService.
export const TRANSICIONES: Record<string, string[]> = {
  recibida: ["en_revision"],
  en_revision: ["aprobada", "rechazada"],
  aprobada: ["entregada"],
  rechazada: [],
  entregada: [],
};

export const ESTILO_ESTATUS: Record<string, string> = {
  recibida: "bg-slate-100 text-slate-700",
  en_revision: "bg-amber-50 text-amber-800",
  aprobada: "bg-emerald-50 text-emerald-800",
  rechazada: "bg-red-50 text-red-700",
  entregada: "bg-blue-50 text-blue-800",
};

export function formatearFecha(valor: string): string {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatearFechaHora(valor: string): string {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
