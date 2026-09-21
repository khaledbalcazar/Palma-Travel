import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/site/Logo";
import { FormularioLogin } from "@/components/admin/FormularioLogin";

export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

export default function Login() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-arena-100 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center text-palma-900">
          <Logo />
        </div>
        <div className="rounded-2xl bg-arena-50 p-7 shadow-suave">
          <h1 className="font-display text-2xl">Entrar al panel</h1>
          <p className="mt-1.5 text-sm text-tinta-500">
            Panel de carga de paquetes y propuestas.
          </p>
          <Suspense>
            <FormularioLogin />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-tinta-500">
          ¿No tenés usuario? Pedile a alguien del equipo con permisos de
          administrador que te invite.
        </p>
      </div>
    </div>
  );
}
