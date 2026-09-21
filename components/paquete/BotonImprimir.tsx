"use client";

import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

/* Abre el diálogo de impresión del navegador, donde se puede elegir
   «Guardar como PDF». La hoja de estilos de impresión deja la página
   prolija: sin menú, sin botones y con los acordeones abiertos. */
export function BotonImprimir({ className }: { className?: string }) {
  return (
    <button
      type="button"
      data-print="ocultar"
      onClick={() => window.print()}
      className={cn(
        "hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors md:inline-flex",
        className,
      )}
    >
      <Printer className="size-4" aria-hidden="true" />
      Guardar en PDF
    </button>
  );
}
