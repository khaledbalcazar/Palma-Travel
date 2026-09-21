"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { registrarEvento } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/* Usa el menú de compartir del celular; si no existe, copia el enlace. */
export function BotonCompartir({
  titulo,
  texto,
  className,
}: {
  titulo: string;
  texto?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.href;
    registrarEvento("compartir", { titulo });

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
        return;
      } catch {
        /* la persona canceló: no hace falta avisar nada */
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.prompt("Copiá el enlace:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      data-print="ocultar"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        copiado
          ? "bg-palma-100 text-palma-800"
          : "bg-palma-900/8 text-palma-800 hover:bg-palma-900/14",
        className,
      )}
    >
      {copiado ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Share2 className="size-4" aria-hidden="true" />
      )}
      {copiado ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
