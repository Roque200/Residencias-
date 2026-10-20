import { getProgramasVigentes } from "@/lib/api/programas";
import { ProgramaCard } from "@/components/ProgramaCard";

export default async function Home() {
  let programas: Awaited<ReturnType<typeof getProgramasVigentes>> = [];
  let error: string | null = null;

  try {
    programas = await getProgramasVigentes();
  } catch {
    error =
      "No pudimos cargar los programas en este momento. Intenta de nuevo en unos minutos.";
  }

  return (
    <div>
      <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-140px] h-[460px] w-[680px] -translate-x-1/2 rounded-full bg-accent/45 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-100px] top-[20px] h-[340px] w-[340px] rounded-full bg-accent-soft/60 blur-[90px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-80px] bottom-[-60px] h-[260px] w-[260px] rounded-full bg-accent/30 blur-[90px]"
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white">
            Presidencia Municipal de Apaseo el Grande
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            Apoyos para tu hogar y tu comunidad
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted">
            Consulta los programas vigentes de la Presidencia Municipal y
            postúlate en línea, sin filas ni papeleo de más.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {error && (
          <p className="mx-auto max-w-lg rounded-2xl bg-accent-soft/20 px-6 py-4 text-center text-[15px] text-ink/80">
            {error}
          </p>
        )}

        {!error && programas.length === 0 && (
          <p className="mx-auto max-w-lg rounded-2xl bg-black/[0.03] px-6 py-10 text-center text-muted">
            Por el momento no hay programas de apoyo social abiertos. Vuelve a
            consultar más adelante.
          </p>
        )}

        {!error && programas.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programas.map((programa) => (
              <ProgramaCard key={programa.id} programa={programa} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
