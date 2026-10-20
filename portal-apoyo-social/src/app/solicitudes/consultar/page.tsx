"use client";

import { useState } from "react";
import { consultarPorFolio } from "@/lib/api/solicitudes";
import type { ConsultaFolio } from "@/types/solicitud";

const ETIQUETAS: Record<string, string> = {
  recibida: "Recibida",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  entregada: "Entregada",
};

export default function ConsultarSolicitudPage() {
  const [folio, setFolio] = useState("");
  const [resultado, setResultado] = useState<ConsultaFolio | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultado(null);
    setBuscando(true);
    try {
      const datos = await consultarPorFolio(folio.trim());
      setResultado(datos);
    } catch {
      setError(
        "No encontramos ninguna solicitud con ese folio. Verifica que esté escrito correctamente."
      );
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Consultar mi solicitud
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Escribe el folio que recibiste al postularte.
      </p>

      <form onSubmit={buscar} className="mt-8 flex gap-3">
        <input
          required
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          placeholder="AEG-2026-000001"
          className="flex-1 rounded-full border border-line bg-surface px-5 py-3 text-[15px] outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={buscando}
          className="rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-2xl bg-accent-soft/15 px-5 py-3 text-[14px] text-ink/80">
          {error}
        </p>
      )}

      {resultado && (
        <div className="mt-8 rounded-[28px] bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <p className="text-[13px] font-medium text-muted">Folio {resultado.folio}</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{resultado.programa}</h2>
          <p className="mt-3 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[13px] font-medium text-accent">
            {ETIQUETAS[resultado.estatus] ?? resultado.estatus}
          </p>

          <h3 className="mt-6 text-[14px] font-semibold text-ink">Historial</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {resultado.historial.map((item, i) => (
              <li key={i} className="text-[14px] text-muted">
                {ETIQUETAS[item.estatus] ?? item.estatus} —{" "}
                {new Date(item.fecha).toLocaleString("es-MX")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
