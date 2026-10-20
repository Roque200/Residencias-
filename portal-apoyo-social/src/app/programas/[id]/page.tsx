import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgramaPorId } from "@/lib/api/programas";

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProgramaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let programa;
  try {
    programa = await getProgramaPorId(id);
  } catch {
    notFound();
  }

  const sinCupo = programa.cupoDisponible <= 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-[14px] font-medium text-muted hover:text-ink">
        ← Regresar al catálogo
      </Link>

      <div className="mt-6 rounded-[28px] bg-surface p-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-medium ${
            sinCupo ? "bg-black/5 text-muted" : "bg-accent/10 text-accent"
          }`}
        >
          {sinCupo
            ? "Convocatoria cerrada"
            : `${programa.cupoDisponible} de ${programa.cupoTotal} lugares disponibles`}
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
          {programa.nombre}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          {programa.descripcion}
        </p>

        <h2 className="mt-8 text-[15px] font-semibold text-ink">Requisitos</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {programa.requisitos}
        </p>

        <p className="mt-6 text-[13px] text-muted">
          Vigencia: {formatFecha(programa.fechaInicio)} – {formatFecha(programa.fechaFin)}
        </p>

        {sinCupo ? (
          <p className="mt-8 text-[14px] font-medium text-muted">
            Esta convocatoria ya no acepta postulaciones.
          </p>
        ) : (
          <Link
            href={`/programas/${programa.id}/postular`}
            className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-bg transition-opacity hover:opacity-80"
          >
            Postularme a este programa
          </Link>
        )}
      </div>
    </div>
  );
}
