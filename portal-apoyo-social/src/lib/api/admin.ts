import { cerrarSesion, obtenerSesion } from "@/lib/auth";
import type {
  DocumentoAdmin,
  FiltrosSolicitudes,
  LoginRespuesta,
  ProgramaAdmin,
  ProgramaInput,
  Resumen,
  SolicitudDetalle,
  SolicitudItem,
} from "@/types/admin";
import type { Programa } from "@/types/programa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function peticion(
  endpoint: string,
  options: RequestInit = {},
  conToken = true
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (conToken) {
    const sesion = obtenerSesion();
    if (sesion) headers.Authorization = `Bearer ${sesion.token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (respuesta.status === 401 && conToken) {
    cerrarSesion();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Tu sesión expiró. Inicia sesión de nuevo.");
  }

  if (respuesta.status === 403) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(
      error?.mensaje ?? "Ocurrió un error al comunicarse con el servidor."
    );
  }

  return respuesta;
}

async function json<T>(endpoint: string, options: RequestInit = {}, conToken = true): Promise<T> {
  const respuesta = await peticion(endpoint, options, conToken);
  if (respuesta.status === 204) return null as T;
  return respuesta.json();
}

function armarQuery(filtros: FiltrosSolicitudes): string {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

export function login(correo: string, password: string): Promise<LoginRespuesta> {
  return json<LoginRespuesta>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ correo, password }) },
    false
  );
}

export function getResumen(): Promise<Resumen> {
  return json<Resumen>("/api/reportes/resumen");
}

export function getProgramasTodos(): Promise<ProgramaAdmin[]> {
  return json<ProgramaAdmin[]>("/api/programas/todos");
}

export function getProgramasVigentes(): Promise<Programa[]> {
  return json<Programa[]>("/api/programas", {}, false);
}

export function crearPrograma(datos: ProgramaInput): Promise<ProgramaAdmin> {
  return json<ProgramaAdmin>("/api/programas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarPrograma(id: string, datos: ProgramaInput): Promise<ProgramaAdmin> {
  return json<ProgramaAdmin>(`/api/programas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function cerrarPrograma(id: string): Promise<null> {
  return json<null>(`/api/programas/${id}/cerrar`, { method: "PATCH" });
}

export function getSolicitudes(filtros: FiltrosSolicitudes): Promise<SolicitudItem[]> {
  return json<SolicitudItem[]>(`/api/solicitudes${armarQuery(filtros)}`);
}

export function getSolicitudDetalle(id: string): Promise<SolicitudDetalle> {
  return json<SolicitudDetalle>(`/api/solicitudes/${id}`);
}

export function getDocumentos(id: string): Promise<DocumentoAdmin[]> {
  return json<DocumentoAdmin[]>(`/api/solicitudes/${id}/documentos`);
}

export function cambiarEstatus(
  id: string,
  estatusNuevo: string,
  comentario: string
): Promise<null> {
  return json<null>(`/api/solicitudes/${id}/estatus`, {
    method: "PATCH",
    body: JSON.stringify({ estatusNuevo, comentario: comentario || null }),
  });
}

export async function descargarExcel(filtros: FiltrosSolicitudes): Promise<void> {
  const respuesta = await peticion(`/api/reportes/solicitudes${armarQuery(filtros)}`);
  const blob = await respuesta.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const marca = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  enlace.href = url;
  enlace.download = `solicitudes_${marca}.xlsx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
