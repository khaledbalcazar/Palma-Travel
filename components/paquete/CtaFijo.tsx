"use client";

import { registrarEvento } from "@/lib/analytics";
import { IconoWhatsApp } from "@/components/ui/IconosRedes";

/* Barra fija abajo, solo en el celular: el botón de consulta siempre a
   mano mientras se lee la página. */
export function CtaFijo({
  href,
  precio,
  base,
  paquete,
  deshabilitado,
}: {
  href: string | null;
  precio: string;
  base: string;
  paquete: string;
  deshabilitado?: boolean;
}) {
  if (!href) return null;

  return (
    <div
      data-print="ocultar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-palma-900/10 bg-arena-50/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-tinta-500">Desde</p>
          <p className="font-display text-xl leading-tight text-palma-900">
            {precio}
          </p>
          <p className="truncate text-[0.7rem] text-tinta-400">{base}</p>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            registrarEvento("click_whatsapp", { origen: "cta_fijo", paquete })
          }
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 font-semibold text-white transition-colors hover:bg-whatsapp-dark"
        >
          <IconoWhatsApp className="size-5" />
          {deshabilitado ? "Lista de espera" : "Consultar"}
        </a>
      </div>
    </div>
  );
}
