import Link from "next/link";
import type { Programa } from "@/types/programa";

export function ProgramaCard({ programa }: { programa: Programa }) {
  const sinCupo = programa.cupoDisponible <= 0;

  return (
    <article className="flex flex-col gap-4 rounded-[28px] bg-surface p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
      <span
        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-semibold ${
          sinCupo ? "bg-black/5 text-muted" : "bg-accent text-white"
        }`}
      >
        {sinCupo
          ? "Convocatoria cerrada"
          : `${programa.cupoDisponible} de ${programa.cupoTotal} lugares`}
      </span>

      <h2 className="text-xl font-semibold tracking-tight text-ink">
        {programa.nombre}
      </h2>

      <p className="text-[15px] leading-relaxed text-muted">
        {programa.descripcion}
      </p>

      {sinCupo ? (
        <span className="mt-2 text-[14px] font-medium text-muted/70">
          Vuelve a consultar más adelante
        </span>
      ) : (
        <Link
          href={`/programas/${programa.id}`}
          className="mt-2 inline-flex w-fit items-center rounded-full border-2 border-accent px-4 py-2 text-[14px] font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
        >
          Ver programa
        </Link>
      )}
    </article>
  );
}
