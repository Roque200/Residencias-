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
      <section className="border-b border-line bg-surface px-6 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-[13px] font-semibold text-accent">
            Presidencia Municipal de Apaseo el Grande
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Apoyos para tu hogar y tu comunidad
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted">
            Consulta los programas vigentes de la Presidencia Municipal y
            postúlate en línea, sin filas ni papeleo de más.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {error && (
          <p className="mx-auto max-w-lg rounded-2xl bg-danger/10 px-6 py-4 text-center text-[15px] text-danger">
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
