"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { descargarExcel, getResumen } from "@/lib/api/admin";
import { useSesion } from "@/lib/auth";
import { ESTATUS_LISTA, ETIQUETAS_ESTATUS } from "@/lib/estatus";
import type { Resumen } from "@/types/admin";

export default function VistaGeneralPage() {
  const router = useRouter();
  const { sesion, listo } = useSesion();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const esAdmin = sesion?.usuario.rol === "administrador";

  useEffect(() => {
    if (!listo || !sesion) return;
    if (!esAdmin) {
      router.replace("/admin/solicitudes");
      return;
    }
    getResumen()
      .then(setResumen)
      .catch((e: Error) => setError(e.message));
  }, [listo, sesion, esAdmin, router]);

  async function exportar() {
    setExportando(true);
    try {
      await descargarExcel({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo exportar el reporte.");
    } finally {
      setExportando(false);
    }
  }

  const programas = resumen
    ? Object.entries(resumen.porPrograma).sort((a, b) => b[1] - a[1])
    : [];
  const maximo = programas.length ? Math.max(...programas.map(([, n]) => n)) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Vista general</h1>
          <p className="mt-1 text-[14px] text-muted">
            Estado de las solicitudes de todos los programas.
          </p>
        </div>
        <button
          onClick={exportar}
          disabled={exportando}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {exportando ? "Generando..." : "Exportar todo a Excel"}
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-danger/10 px-5 py-3 text-[14px] text-danger">
          {error}
        </p>
      )}

      {!resumen && !error && <p className="mt-8 text-[14px] text-muted">Cargando...</p>}

      {resumen && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2 rounded-[24px] bg-accent p-6 text-white md:col-span-3 lg:col-span-1">
              <p className="text-[13px] font-medium opacity-80">Total</p>
              <p className="mt-2 text-4xl font-bold">{resumen.totalSolicitudes}</p>
            </div>
            {ESTATUS_LISTA.map((estatus) => (
              <Link
                key={estatus}
                href={`/admin/solicitudes?estatus=${estatus}`}
                className="rounded-[24px] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
              >
                <p className="text-[13px] font-medium text-muted">
                  {ETIQUETAS_ESTATUS[estatus]}
                </p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {resumen.porEstatus[estatus] ?? 0}
                </p>
              </Link>
            ))}
          </div>

          <section className="mt-8 rounded-[28px] bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-ink">Solicitudes por programa</h2>
            {programas.length === 0 ? (
              <p className="mt-4 text-[14px] text-muted">Aún no hay solicitudes registradas.</p>
            ) : (
              <ul className="mt-5 flex flex-col gap-4">
                {programas.map(([nombre, cantidad]) => (
                  <li key={nombre}>
                    <div className="flex justify-between text-[14px]">
                      <span className="font-medium text-ink">{nombre}</span>
                      <span className="text-muted">{cantidad}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/8">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(cantidad / maximo) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
