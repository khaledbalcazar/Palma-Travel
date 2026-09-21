"use client";

import { useEffect } from "react";

/* ===================================================================
   Antes de imprimir (o de guardar como PDF), abre todos los acordeones
   marcados: el itinerario, las bases y condiciones y las preguntas
   frecuentes. Si no, el PDF sale con casi todo el contenido escondido.
   Al terminar, los deja como estaban.
   =================================================================== */
export function AbrirAlImprimir() {
  useEffect(() => {
    const marcados = () =>
      Array.from(
        document.querySelectorAll<HTMLDetailsElement>('details[data-print="abrir"]'),
      );

    let estabanCerrados: HTMLDetailsElement[] = [];

    const abrir = () => {
      estabanCerrados = marcados().filter((d) => !d.open);
      for (const d of estabanCerrados) d.open = true;
    };

    const restaurar = () => {
      for (const d of estabanCerrados) d.open = false;
      estabanCerrados = [];
    };

    window.addEventListener("beforeprint", abrir);
    window.addEventListener("afterprint", restaurar);

    /* Safari en iOS no dispara beforeprint: se escucha el cambio de medio. */
    const medio = window.matchMedia?.("print");
    const alCambiarMedio = (e: MediaQueryListEvent) =>
      e.matches ? abrir() : restaurar();
    medio?.addEventListener?.("change", alCambiarMedio);

    return () => {
      window.removeEventListener("beforeprint", abrir);
      window.removeEventListener("afterprint", restaurar);
      medio?.removeEventListener?.("change", alCambiarMedio);
    };
  }, []);

  return null;
}
