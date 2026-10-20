"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { crearSolicitud, subirDocumento } from "@/lib/api/solicitudes";
import { CapturaArchivo } from "@/components/CapturaArchivo";
import {
  validarNombre,
  validarCurp,
  validarDomicilio,
  validarComunidad,
  validarTelefono,
} from "@/lib/validaciones";

type CampoTexto = "nombreSolicitante" | "curp" | "domicilio" | "comunidad" | "telefono";

const VALIDADORES: Record<CampoTexto, (v: string) => string | null> = {
  nombreSolicitante: validarNombre,
  curp: validarCurp,
  domicilio: validarDomicilio,
  comunidad: validarComunidad,
  telefono: validarTelefono,
};

export default function FormularioPostulacionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Record<CampoTexto, string>>({
    nombreSolicitante: "",
    curp: "",
    domicilio: "",
    comunidad: "",
    telefono: "",
  });
  const [errores, setErrores] = useState<Partial<Record<CampoTexto, string>>>({});
  const [ine, setIne] = useState<File | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  function actualizar(campo: CampoTexto, valorCrudo: string) {
    let valor = valorCrudo;
    if (campo === "curp") valor = valorCrudo.toUpperCase().slice(0, 18);
    if (campo === "telefono") valor = valorCrudo.replace(/\D/g, "").slice(0, 10);

    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validarCampo(campo: CampoTexto) {
    const mensaje = VALIDADORES[campo](form[campo]);
    setErrores((prev) => ({ ...prev, [campo]: mensaje ?? undefined }));
  }

  function formularioValido() {
    const nuevosErrores: Partial<Record<CampoTexto, string>> = {};
    (Object.keys(VALIDADORES) as CampoTexto[]).forEach((campo) => {
      const mensaje = VALIDADORES[campo](form[campo]);
      if (mensaje) nuevosErrores[campo] = mensaje;
    });
    setErrores(nuevosErrores);

    const archivosOk = !!ine && !!comprobante;
    setErrorArchivos(archivosOk ? null : "Adjunta o toma foto de tu INE y tu comprobante de domicilio.");

    return Object.keys(nuevosErrores).length === 0 && archivosOk;
  }

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setErrorEnvio(null);

    if (!formularioValido()) return;

    setEnviando(true);
    try {
      const solicitud = await crearSolicitud({ programaId: id, ...form });

      const subir = async (archivo: File, tipo: string) => {
        const data = new FormData();
        data.append("tipoDocumento", tipo);
        data.append("archivo", archivo);
        await subirDocumento(solicitud.id, data);
      };

      if (ine) await subir(ine, "ine");
      if (comprobante) await subir(comprobante, "comprobante_domicilio");

      router.push(`/solicitudes/confirmacion?folio=${solicitud.folio}`);
    } catch (err) {
      setErrorEnvio(
        err instanceof Error ? err.message : "No pudimos enviar tu postulación. Intenta de nuevo."
      );
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Formulario de postulación</h1>
      <p className="mt-2 text-[15px] text-muted">
        Completa tus datos, es rápido y no necesitas crear una cuenta.
      </p>

      <form onSubmit={manejarEnvio} noValidate className="mt-8 flex flex-col gap-5">
        <Campo
          label="Nombre completo"
          value={form.nombreSolicitante}
          error={errores.nombreSolicitante}
          onChange={(v) => actualizar("nombreSolicitante", v)}
          onBlur={() => validarCampo("nombreSolicitante")}
        />
        <Campo
          label="CURP"
          value={form.curp}
          error={errores.curp}
          onChange={(v) => actualizar("curp", v)}
          onBlur={() => validarCampo("curp")}
          maxLength={18}
          placeholder="TOIM800512MGTRRR05"
        />
        <Campo
          label="Domicilio"
          value={form.domicilio}
          error={errores.domicilio}
          onChange={(v) => actualizar("domicilio", v)}
          onBlur={() => validarCampo("domicilio")}
        />
        <Campo
          label="Comunidad"
          value={form.comunidad}
          error={errores.comunidad}
          onChange={(v) => actualizar("comunidad", v)}
          onBlur={() => validarCampo("comunidad")}
        />
        <Campo
          label="Teléfono"
          value={form.telefono}
          error={errores.telefono}
          onChange={(v) => actualizar("telefono", v)}
          onBlur={() => validarCampo("telefono")}
          inputMode="numeric"
          maxLength={10}
          placeholder="10 dígitos"
        />

        <CapturaArchivo label="INE" value={ine} onChange={setIne} />
        <CapturaArchivo
          label="Comprobante de domicilio"
          value={comprobante}
          onChange={setComprobante}
        />
        {errorArchivos && <p className="text-[14px] text-accent">{errorArchivos}</p>}

        {errorEnvio && (
          <p className="rounded-2xl bg-accent-soft/15 px-5 py-3 text-[14px] text-ink/80">
            {errorEnvio}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-2 rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}

function Campo({
  label,
  value,
  error,
  onChange,
  onBlur,
  inputMode,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-[14px] font-medium text-ink">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`rounded-2xl border bg-surface px-4 py-3 text-[15px] font-normal text-ink outline-none focus:border-accent ${
          error ? "border-accent" : "border-line"
        }`}
      />
      {error && <span className="text-[13px] font-normal text-accent">{error}</span>}
    </label>
  );
}
