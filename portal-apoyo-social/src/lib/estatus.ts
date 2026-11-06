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
  recibida: "bg-ink/8 text-ink/70",
  en_revision: "bg-accent-soft/25 text-ink",
  aprobada: "bg-emerald-100 text-emerald-800",
  rechazada: "bg-accent/12 text-accent",
  entregada: "bg-sky-100 text-sky-800",
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
