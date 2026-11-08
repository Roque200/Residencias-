"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  actualizarPrograma,
  cerrarPrograma,
  crearPrograma,
  getProgramasTodos,
} from "@/lib/api/admin";
import { useSesion } from "@/lib/auth";
import { formatearFecha } from "@/lib/estatus";
import type { ProgramaAdmin, ProgramaInput } from "@/types/admin";

const VACIO: ProgramaInput = {
  nombre: "",
  descripcion: "",
  requisitos: "",
  cupoTotal: 0,
  fechaInicio: "",
  fechaFin: "",
};

const ESTILO_PROGRAMA: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-800",
  cerrado: "bg-ink/8 text-ink/70",
  proximamente: "bg-amber-50 text-amber-800",
};

const ETIQUETA_PROGRAMA: Record<string, string> = {
  activo: "Activo",
  cerrado: "Cerrado",
  proximamente: "Próximamente",
};

export default function ProgramasAdminPage() {
  const router = useRouter();
  const { sesion, listo } = useSesion();
  const [programas, setProgramas] = useState<ProgramaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<ProgramaInput | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setProgramas(await getProgramasTodos());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los programas.");
    } finally {
      setCargando(false);
    }
  }, []);

  const esAdmin = sesion?.usuario.rol === "administrador";

  useEffect(() => {
    if (!listo || !sesion) return;
    if (!esAdmin) {
      router.replace("/admin/solicitudes");
      return;
    }
    getProgramasTodos()
      .then(setProgramas)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, [listo, sesion, esAdmin, router]);

  function nuevo() {
    setEditandoId(null);
    setErrorForm(null);
    setFormulario({ ...VACIO });
  }

  function editar(p: ProgramaAdmin) {
    setEditandoId(p.id);
    setErrorForm(null);
    setFormulario({
      nombre: p.nombre,
      descripcion: p.descripcion,
      requisitos: p.requisitos,
      cupoTotal: p.cupoTotal,
      fechaInicio: p.fechaInicio.slice(0, 10),
      fechaFin: p.fechaFin.slice(0, 10),
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!formulario) return;
    if (formulario.fechaFin < formulario.fechaInicio) {
      setErrorForm("La fecha de cierre no puede ser anterior a la de inicio.");
      return;
    }
    setGuardando(true);
    setErrorForm(null);
    try {
      if (editandoId) await actualizarPrograma(editandoId, formulario);
      else await crearPrograma(formulario);
      setFormulario(null);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar el programa.");
    } finally {
      setGuardando(false);
    }
  }

  async function cerrar(p: ProgramaAdmin) {
    if (!window.confirm(`¿Cerrar la convocatoria de "${p.nombre}"?`)) return;
    try {
      await cerrarPrograma(p.id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cerrar el programa.");
    }
  }

  function cambiar<K extends keyof ProgramaInput>(campo: K, valor: ProgramaInput[K]) {
    setFormulario((f) => (f ? { ...f, [campo]: valor } : f));
  }

  const campo =
    "mt-1 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-[14px] font-normal outline-none focus:border-accent";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Programas</h1>
          <p className="mt-1 text-[14px] text-muted">
            Crea, edita y cierra las convocatorias de apoyo.
          </p>
        </div>
        <button
          onClick={nuevo}
          className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
        >
          Nuevo programa
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-danger/10 px-5 py-3 text-[14px] text-danger">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-[24px] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <th className="px-5 py-4 font-semibold">Programa</th>
              <th className="px-5 py-4 font-semibold">Estatus</th>
              <th className="px-5 py-4 font-semibold">Cupo</th>
              <th className="px-5 py-4 font-semibold">Vigencia</th>
              <th className="px-5 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && programas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  Todavía no hay programas registrados.
                </td>
              </tr>
            )}
            {programas.map((p) => (
              <tr key={p.id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-4 font-semibold text-ink">{p.nombre}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${
                      ESTILO_PROGRAMA[p.estatus] ?? ""
                    }`}
                  >
                    {ETIQUETA_PROGRAMA[p.estatus] ?? p.estatus}
                  </span>
                </td>
                <td className="px-5 py-4 text-ink/80">
                  {p.cupoDisponible} / {p.cupoTotal}
                </td>
                <td className="px-5 py-4 text-ink/80">
                  {formatearFecha(p.fechaInicio)} – {formatearFecha(p.fechaFin)}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => editar(p)}
                    className="font-semibold text-accent hover:underline"
                  >
                    Editar
                  </button>
                  {p.estatus !== "cerrado" && (
                    <button
                      onClick={() => cerrar(p)}
                      className="ml-4 font-semibold text-muted hover:text-ink hover:underline"
                    >
                      Cerrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6">
          <form
            onSubmit={guardar}
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-[28px] bg-surface p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold text-ink">
              {editandoId ? "Editar programa" : "Nuevo programa"}
            </h2>

            <label className="mt-5 block text-[13px] font-semibold text-ink">
              Nombre
              <input
                required
                value={formulario.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
                className={campo}
              />
            </label>

            <label className="mt-4 block text-[13px] font-semibold text-ink">
              Descripción
              <textarea
                required
                rows={3}
                value={formulario.descripcion}
                onChange={(e) => cambiar("descripcion", e.target.value)}
                className={campo}
              />
            </label>

            <label className="mt-4 block text-[13px] font-semibold text-ink">
              Requisitos
              <textarea
                required
                rows={3}
                value={formulario.requisitos}
                onChange={(e) => cambiar("requisitos", e.target.value)}
                className={campo}
              />
            </label>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block text-[13px] font-semibold text-ink">
                Cupo total
                <input
                  type="number"
                  required
                  min={1}
                  value={formulario.cupoTotal || ""}
                  onChange={(e) => cambiar("cupoTotal", Number(e.target.value))}
                  className={campo}
                />
              </label>
              <label className="block text-[13px] font-semibold text-ink">
                Inicio
                <input
                  type="date"
                  required
                  value={formulario.fechaInicio}
                  onChange={(e) => cambiar("fechaInicio", e.target.value)}
                  className={campo}
                />
              </label>
              <label className="block text-[13px] font-semibold text-ink">
                Cierre
                <input
                  type="date"
                  required
                  value={formulario.fechaFin}
                  onChange={(e) => cambiar("fechaFin", e.target.value)}
                  className={campo}
                />
              </label>
            </div>

            {errorForm && (
              <p className="mt-4 rounded-xl bg-danger/10 px-4 py-2.5 text-[13px] text-danger">
                {errorForm}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormulario(null)}
                className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-ink/70 hover:bg-ink/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
