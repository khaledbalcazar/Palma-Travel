import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { usuarioActual } from "@/lib/admin/sesion";
import { cerrarSesion } from "@/lib/admin/acciones-sesion";
import { NavPanel } from "@/components/admin/NavPanel";
import { Logo } from "@/components/site/Logo";
import { ETIQUETA_ROL } from "@/lib/schema";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel de Palma Travel" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function LayoutPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await usuarioActual();

  /* Login y pantalla de configuración: sin el marco del panel */
  if (!usuario) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-arena-100">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <aside className="md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0 md:border-r md:border-palma-900/10 md:bg-arena-50">
          <div className="flex items-center justify-between gap-3 px-5 py-4 md:block md:py-6">
            <Link href="/admin" className="text-palma-900">
              <Logo />
            </Link>
            <div className="flex items-center gap-3">
              <p className="text-right text-xs text-tinta-500 md:mt-3 md:text-left">
                {usuario.nombreVisible}
                <span className="block text-tinta-400">
                  {ETIQUETA_ROL[usuario.rol]}
                </span>
              </p>
              <form action={cerrarSesion} className="md:hidden">
                <button
                  type="submit"
                  aria-label="Cerrar sesión"
                  className="inline-flex size-9 items-center justify-center rounded-full text-tinta-500 transition-colors hover:bg-coral-500/10 hover:text-coral-700"
                >
                  <LogOut className="size-5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>

          <div className="px-3 md:mt-2">
            <NavPanel esAdmin={usuario.rol === "admin"} />
          </div>

          <div className="hidden gap-1 px-3 md:mt-8 md:flex md:flex-col">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.95rem] text-tinta-500 transition-colors hover:bg-palma-900/6 hover:text-palma-800"
            >
              <ExternalLink className="size-4.5" aria-hidden="true" />
              Ver el sitio
            </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[0.95rem] text-tinta-500 transition-colors hover:bg-coral-500/10 hover:text-coral-700"
              >
                <LogOut className="size-4.5" aria-hidden="true" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
