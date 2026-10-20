import Link from "next/link";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ folio?: string }>;
}) {
  const { folio } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">
        ¡Postulación enviada!
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Guarda este folio para dar seguimiento a tu solicitud:
      </p>
      <p className="mt-6 rounded-2xl bg-surface px-6 py-4 text-2xl font-bold tracking-tight text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        {folio ?? "—"}
      </p>
      <Link
        href="/solicitudes/consultar"
        className="mt-8 inline-block text-[14px] font-semibold text-accent hover:underline"
      >
        Consultar el estatus de mi solicitud
      </Link>
    </div>
  );
}
