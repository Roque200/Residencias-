"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EstatusBadge } from "@/components/EstatusBadge";
import { cambiarEstatus, getDocumentos, getSolicitudDetalle } from "@/lib/api/admin";
import { useSesion } from "@/lib/auth";
import { ETIQUETAS_ESTATUS, TRANSICIONES, formatearFechaHora } from "@/lib/estatus";
import type { DocumentoAdmin, SolicitudDetalle } from "@/types/admin";

export default function DetalleSolicitudPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [detalle, setDetalle] = useState<SolicitudDetalle | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sesion } = useSesion();
  const rol = sesion?.usuario.rol;
  const puedeRevisar = rol === "revisor" || rol === "administrador";
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [d, docs] = await Promise.all([getSolicitudDetalle(id), getDocumentos(id)]);
      setDetalle(d);
      setDocumentos(docs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la solicitud.");
    }
  }, [id]);

  useEffect(() => {
    Promise.all([getSolicitudDetalle(id), getDocumentos(id)])
      .then(([d, docs]) => {
        setDetalle(d);
        setDocumentos(docs);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function cambiar(estatusNuevo: string) {
    if (estatusNuevo === "rechazada" && !comentario.trim()) {
      setError("Escribe el motivo del rechazo en el comentario.");
      return;
    }
    setEnviando(true);
    setError(null);
    setMensaje(null);
    try {
      await cambiarEstatus(id, estatusNuevo, comentario.trim());
      setComentario("");
      setMensaje(`La solicitud pasó a "${ETIQUETAS_ESTATUS[estatusNuevo]}".`);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar el estatus.");
    } finally {
      setEnviando(false);
    }
  }

  if (!detalle) {
    return (
      <div>
        <Link href="/admin/solicitudes" className="text-[13px] font-semibold text-accent">
          ← Volver a solicitudes
        </Link>
        <p className="mt-6 text-[14px] text-muted">{error ?? "Cargando..."}</p>
      </div>
    );
  }

  const siguientes = TRANSICIONES[detalle.estatus] ?? [];
  const tarjeta =
    "rounded-[24px] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]";

  const datos: [string, string][] = [
    ["Solicitante", detalle.nombreSolicitante],
    ["CURP", detalle.curp],
    ["Domicilio", detalle.domicilio],
    ["Comunidad", detalle.comunidad],
    ["Teléfono", detalle.telefono],
    ["Programa", detalle.programaNombre],
    ["Fecha de registro", formatearFechaHora(detalle.fechaRegistro)],
  ];

  return (
    <div>
      <Link href="/admin/solicitudes" className="text-[13px] font-semibold text-accent">
        ← Volver a solicitudes
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-ink">{detalle.folio}</h1>
        <EstatusBadge estatus={detalle.estatus} />
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-accent/10 px-5 py-3 text-[14px] text-accent">{error}</p>
      )}
      {mensaje && (
        <p className="mt-6 rounded-2xl bg-emerald-100 px-5 py-3 text-[14px] text-emerald-800">
          {mensaje}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold text-ink">Datos del solicitante</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                    {etiqueta}
                  </dt>
                  <dd className="mt-0.5 text-[14px] text-ink">{valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={tarjeta}>
            <h2 className="text-lg font-semibold text-ink">Documentos</h2>
            {documentos.length === 0 ? (
              <p className="mt-3 text-[14px] text-muted">No hay documentos adjuntos.</p>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-line/60">
                {documentos.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{d.tipoDocumento}</p>
                      <p className="text-[12px] text-muted">
                        Subido el {formatearFechaHora(d.fechaCarga)}
                      </p>
                    </div>
                    <a
                      href={d.urlArchivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-bg hover:opacity-80"
                    >
                      Ver archivo
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          {puedeRevisar && (
            <section className={tarjeta}>
              <h2 className="text-lg font-semibold text-ink">Cambiar estatus</h2>
              {siguientes.length === 0 ? (
                <p className="mt-3 text-[14px] text-muted">
                  Esta solicitud ya está en un estatus final.
                </p>
              ) : (
                <>
                  <label className="mt-3 block text-[12px] font-semibold text-ink">
                    Comentario
                    <textarea
                      rows={3}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Obligatorio al rechazar"
                      className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[14px] font-normal outline-none focus:border-accent"
                    />
                  </label>
                  <div className="mt-4 flex flex-col gap-2">
                    {siguientes.map((estatus) => (
                      <button
                        key={estatus}
                        disabled={enviando}
                        onClick={() => cambiar(estatus)}
                        className={`rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-85 disabled:opacity-50 ${
                          estatus === "rechazada"
                            ? "border border-accent text-accent"
                            : "bg-accent text-white"
                        }`}
                      >
                        Marcar como {ETIQUETAS_ESTATUS[estatus].toLowerCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          <section className={tarjeta}>
            <h2 className="text-lg font-semibold text-ink">Historial</h2>
            <ol className="mt-4 flex flex-col gap-4">
              {detalle.historial.map((h, i) => (
                <li key={i} className="border-l-2 border-accent/40 pl-4">
                  <p className="text-[14px] font-semibold text-ink">
                    {h.estatusAnterior
                      ? `${ETIQUETAS_ESTATUS[h.estatusAnterior] ?? h.estatusAnterior} → `
                      : ""}
                    {ETIQUETAS_ESTATUS[h.estatusNuevo] ?? h.estatusNuevo}
                  </p>
                  <p className="text-[12px] text-muted">{formatearFechaHora(h.fecha)}</p>
                  {h.comentario && (
                    <p className="mt-1 text-[13px] text-ink/80">{h.comentario}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
