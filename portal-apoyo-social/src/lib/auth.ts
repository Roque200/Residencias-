import { useMemo, useSyncExternalStore } from "react";
import type { LoginRespuesta, Usuario } from "@/types/admin";

const CLAVE = "sas_sesion";
const EVENTO = "sas-sesion-cambio";

export interface Sesion {
  token: string;
  usuario: Usuario;
}

function avisarCambio(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO));
}

export function guardarSesion(datos: LoginRespuesta): void {
  try {
    localStorage.setItem(
      CLAVE,
      JSON.stringify({ token: datos.token, usuario: datos.usuario })
    );
  } catch {
    // Si el navegador bloquea el almacenamiento, la sesión no se conserva.
  }
  avisarCambio();
}

function leerTexto(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function convertir(texto: string | null): Sesion | null {
  if (!texto) return null;
  try {
    return JSON.parse(texto) as Sesion;
  } catch {
    return null;
  }
}

export function obtenerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  return convertir(leerTexto());
}

export function cerrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Sin acción.
  }
  avisarCambio();
}

function suscribir(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO, callback);
  };
}

// "listo" es falso mientras el navegador todavía no puede leer la sesión (render del servidor).
export function useSesion(): { sesion: Sesion | null; listo: boolean } {
  const texto = useSyncExternalStore<string | null | undefined>(
    suscribir,
    leerTexto,
    () => undefined
  );
  return useMemo(
    () => ({ sesion: convertir(texto ?? null), listo: texto !== undefined }),
    [texto]
  );
}
