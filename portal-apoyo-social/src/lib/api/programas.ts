import { apiFetch } from "./client";
import type { Programa } from "@/types/programa";

export function getProgramasVigentes(): Promise<Programa[]> {
  return apiFetch<Programa[]>("/api/programas");
}

export function getProgramaPorId(id: string): Promise<Programa> {
  return apiFetch<Programa>(`/api/programas/${id}`);
}
