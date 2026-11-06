"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login } from "@/lib/api/admin";
import { guardarSesion, useSesion } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { sesion } = useSesion();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sesion) {
      router.replace(
        sesion.usuario.rol === "administrador" ? "/admin" : "/admin/solicitudes"
      );
    }
  }, [sesion, router]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const datos = await login(correo.trim(), password);
      guardarSesion(datos);
      router.replace(
        datos.usuario.rol === "administrador" ? "/admin" : "/admin/solicitudes"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-[28px] bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
      >
        <p className="text-[13px] font-semibold text-accent">Apaseo el Grande</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
          Acceso del personal
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Ingresa con tu correo institucional.
        </p>

        <label className="mt-6 block text-[13px] font-semibold text-ink">
          Correo
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-[15px] font-normal outline-none focus:border-accent"
          />
        </label>

        <label className="mt-4 block text-[13px] font-semibold text-ink">
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-[15px] font-normal outline-none focus:border-accent"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-accent/10 px-4 py-2.5 text-[13px] text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-full bg-accent px-4 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {enviando ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
