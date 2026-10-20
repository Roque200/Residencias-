import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-ink">
          Apaseo el Grande
        </Link>
        <Link
          href="/solicitudes/consultar"
          className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
        >
          Consultar mi solicitud
        </Link>
      </div>
    </header>
  );
}
