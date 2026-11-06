import { ESTILO_ESTATUS, ETIQUETAS_ESTATUS } from "@/lib/estatus";

export function EstatusBadge({ estatus }: { estatus: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${
        ESTILO_ESTATUS[estatus] ?? "bg-ink/8 text-ink/70"
      }`}
    >
      {ETIQUETAS_ESTATUS[estatus] ?? estatus}
    </span>
  );
}
