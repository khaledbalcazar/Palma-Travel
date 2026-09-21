"use client";

import { useEffect, useRef } from "react";
import { Boton } from "@/components/ui/Boton";

/* Diálogo de confirmación para las acciones que no se pueden deshacer. */
export function Confirmar({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Sí, eliminar",
  alConfirmar,
  alCancelar,
}: {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  alConfirmar: () => void;
  alCancelar: () => void;
}) {
  const dialogo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCancelar();
    };
    document.addEventListener("keydown", alTeclear);
    dialogo.current?.focus();
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto, alCancelar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta-900/40 p-4 sm:items-center">
      <div
        ref={dialogo}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-arena-50 p-6 shadow-alta"
      >
        <h2 id="confirmar-titulo" className="font-display text-xl text-palma-900">
          {titulo}
        </h2>
        <p className="mt-2 text-[0.95rem] text-tinta-600">{mensaje}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Boton type="button" variante="secundario" onClick={alCancelar}>
            Cancelar
          </Boton>
          <Boton
            type="button"
            onClick={alConfirmar}
            className="bg-coral-600 hover:bg-coral-700"
          >
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
}
