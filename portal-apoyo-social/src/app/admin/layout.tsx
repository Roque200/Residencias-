"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cerrarSesion, useSesion } from "@/lib/auth";

interface Enlace {
  href: string;
  etiqueta: string;
  soloAdmin?: boolean;
}

const ENLACES: Enlace[] = [
  { href: "/admin", etiqueta: "Vista general", soloAdmin: true },
  { href: "/admin/programas", etiqueta: "Programas", soloAdmin: true },
  { href: "/admin/solicitudes", etiqueta: "Solicitudes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sesion, listo } = useSesion();

  const esLogin = pathname === "/admin/login";

  useEffect(() => {
    if (listo && !sesion && !esLogin) router.replace("/admin/login");
  }, [listo, sesion, esLogin, router]);

  if (esLogin) return <>{children}</>;
  if (!listo || !sesion) return null;

  const esAdmin = sesion.usuario.rol === "administrador";
  const enlaces = ENLACES.filter((e) => !e.soloAdmin || esAdmin);

  function salir() {
    cerrarSesion();
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <aside className="border-b border-line bg-surface md:w-64 md:border-b-0 md:border-r">
        <div className="px-6 py-6">
          <p className="text-[15px] font-bold tracking-tight text-ink">Apoyo Social</p>
          <p className="text-[12px] text-muted">Apaseo el Grande</p>
        </div>

        <nav className="flex gap-1 px-3 pb-3 md:flex-col">
          {enlaces.map((enlace) => {
            const activo =
              enlace.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(enlace.href);
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={`rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                  activo ? "bg-accent text-white" : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                {enlace.etiqueta}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-line px-6 py-5 md:block">
          <p className="text-[13px] font-semibold text-ink">{sesion.usuario.nombre}</p>
          <p className="text-[12px] capitalize text-muted">{sesion.usuario.rol}</p>
          <button
            onClick={salir}
            className="mt-3 text-[13px] font-semibold text-accent hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-3 md:hidden">
          <span className="text-[13px] text-muted">
            {sesion.usuario.nombre} · {sesion.usuario.rol}
          </span>
          <button onClick={salir} className="text-[13px] font-semibold text-accent">
            Salir
          </button>
        </div>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
