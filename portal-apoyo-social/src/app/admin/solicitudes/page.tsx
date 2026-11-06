"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { EstatusBadge } from "@/components/EstatusBadge";
import {
  descargarExcel,
  getProgramasTodos,
  getProgramasVigentes,
  getSolicitudes,
} from "@/lib/api/admin";
import { useSesion } from "@/lib/auth";
import { ESTATUS_LISTA, ETIQUETAS_ESTATUS, formatearFecha } from "@/lib/estatus";
import type { FiltrosSolicitudes, SolicitudItem } from "@/types/admin";

const FILTROS_VACIOS: FiltrosSolicitudes = {
  programaId: "",
  comunidad: "",
  estatus: "",
  fechaDesde: "",
  fechaHasta: "",
};

export default function SolicitudesPage() {
  return (
    <Suspense fallback={<p className="text-[14px] text-muted">Cargando...</p>}>
      <SolicitudesContenido />
    </Suspense>
  );
}

function SolicitudesContenido() {
  const parametros = useSearchParams();
  const { sesion, listo } = useSesion();
  const esAdmin = sesion?.usuario.rol === "administrador";
  // El filtro de estatus puede llegar desde las tarjetas de la vista general.
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>(() => ({
    ...FILTROS_VACIOS,
    estatus: parametros.get("estatus") ?? "",
  }));
  const filtrosIniciales = useRef(filtros);
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [programas, setProgramas] = useState<{ id: string; nombre: string }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const buscar = useCallback(async (f: FiltrosSolicitudes) => {
    try {
      setSolicitudes(await getSolicitudes(f));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!listo || !sesion) return;
    buscar(filtrosIniciales.current);
    (esAdmin ? getProgramasTodos() : getProgramasVigentes())
      .then((lista) => setProgramas(lista.map((p) => ({ id: p.id, nombre: p.nombre }))))
      .catch(() => setProgramas([]));
  }, [listo, sesion, esAdmin, buscar]);

  function cambiar(campo: keyof FiltrosSolicitudes, valor: string) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }

  function limpiar() {
    setFiltros(FILTROS_VACIOS);
    buscar(FILTROS_VACIOS);
  }

  async function exportar() {
    setExportando(true);
    try {
      await descargarExcel(filtros);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo exportar el reporte.");
    } finally {
      setExportando(false);
    }
  }

  const campo =
    "mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[14px] font-normal outline-none focus:border-accent";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Solicitudes</h1>
          <p className="mt-1 text-[14px] text-muted">
            Revisa, filtra y da seguimiento a las postulaciones.
          </p>
        </div>
        {esAdmin && (
          <button
            onClick={exportar}
            disabled={exportando}
            className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {exportando ? "Generando..." : "Exportar a Excel"}
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          buscar(filtros);
        }}
        className="mt-6 grid grid-cols-1 gap-4 rounded-[24px] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="text-[12px] font-semibold text-ink lg:col-span-2">
          Programa
          <select
            value={filtros.programaId}
            onChange={(e) => cambiar("programaId", e.target.value)}
            className={campo}
          >
            <option value="">Todos</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[12px] font-semibold text-ink">
          Estatus
          <select
            value={filtros.estatus}
            onChange={(e) => cambiar("estatus", e.target.value)}
            className={campo}
          >
            <option value="">Todos</option>
            {ESTATUS_LISTA.map((e) => (
              <option key={e} value={e}>
                {ETIQUETAS_ESTATUS[e]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[12px] font-semibold text-ink">
          Comunidad
          <input
            value={filtros.comunidad}
            onChange={(e) => cambiar("comunidad", e.target.value)}
            className={campo}
          />
        </label>

        <label className="text-[12px] font-semibold text-ink">
          Desde
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) => cambiar("fechaDesde", e.target.value)}
            className={campo}
          />
        </label>

        <label className="text-[12px] font-semibold text-ink">
          Hasta
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) => cambiar("fechaHasta", e.target.value)}
            className={campo}
          />
        </label>

        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={limpiar}
            className="rounded-full px-4 py-2.5 text-[13px] font-semibold text-ink/70 hover:bg-ink/5"
          >
            Limpiar
          </button>
          <span className="ml-auto text-[13px] text-muted">
            {solicitudes.length} resultado{solicitudes.length === 1 ? "" : "s"}
          </span>
        </div>
      </form>

      {error && (
        <p className="mt-6 rounded-2xl bg-accent/10 px-5 py-3 text-[14px] text-accent">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-[24px] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <th className="px-5 py-4 font-semibold">Folio</th>
              <th className="px-5 py-4 font-semibold">Solicitante</th>
              <th className="px-5 py-4 font-semibold">Programa</th>
              <th className="px-5 py-4 font-semibold">Comunidad</th>
              <th className="px-5 py-4 font-semibold">Estatus</th>
              <th className="px-5 py-4 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && solicitudes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  No hay solicitudes con esos filtros.
                </td>
              </tr>
            )}
            {solicitudes.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/solicitudes/${s.id}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    {s.folio}
                  </Link>
                </td>
                <td className="px-5 py-4 text-ink">{s.nombreSolicitante}</td>
                <td className="px-5 py-4 text-ink/80">{s.programaNombre}</td>
                <td className="px-5 py-4 text-ink/80">{s.comunidad}</td>
                <td className="px-5 py-4">
                  <EstatusBadge estatus={s.estatus} />
                </td>
                <td className="px-5 py-4 text-ink/80">{formatearFecha(s.fechaRegistro)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
