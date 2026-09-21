"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { Imagen } from "@/lib/schema";
import { Foto } from "@/components/ui/Foto";
import { cn } from "@/lib/utils";

/* ===================================================================
   GALERÍA CON VISOR
   En el celular se pasa con el dedo; en la computadora, con las flechas
   del teclado o los botones. Se cierra con Escape.
   =================================================================== */

export function Galeria({ fotos }: { fotos: Imagen[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  if (fotos.length === 0) return null;

  return (
    <section data-print="galeria" aria-labelledby="galeria-titulo">
      <h2 id="galeria-titulo" className="solo-lectores">
        Galería de fotos
      </h2>

      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {fotos.map((foto, i) => (
          <li
            key={`${foto.src}-${i}`}
            className={cn(
              "relative",
              i === 0 && "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
            )}
          >
            <button
              type="button"
              onClick={() => setAbierta(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl"
            >
              <Foto
                src={foto.src}
                alt={foto.alt}
                fill
                sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-palma-900/0 transition-colors group-hover:bg-palma-900/25">
                <ZoomIn
                  className="size-7 text-arena-50 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
              <span className="solo-lectores">Ampliar: {foto.alt}</span>
            </button>
          </li>
        ))}
      </ul>

      {abierta !== null && (
        <Visor
          fotos={fotos}
          indice={abierta}
          alCambiar={setAbierta}
          alCerrar={() => setAbierta(null)}
        />
      )}
    </section>
  );
}

function Visor({
  fotos,
  indice,
  alCambiar,
  alCerrar,
}: {
  fotos: Imagen[];
  indice: number;
  alCambiar: (i: number) => void;
  alCerrar: () => void;
}) {
  const inicioTactil = useRef<number | null>(null);

  const anterior = useCallback(
    () => alCambiar((indice - 1 + fotos.length) % fotos.length),
    [indice, fotos.length, alCambiar],
  );
  const siguiente = useCallback(
    () => alCambiar((indice + 1) % fotos.length),
    [indice, fotos.length, alCambiar],
  );

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [alCerrar, anterior, siguiente]);

  const foto = fotos[indice]!;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${indice + 1} de ${fotos.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-palma-900/96"
      onTouchStart={(e) => {
        inicioTactil.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (inicioTactil.current === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - inicioTactil.current;
        if (Math.abs(delta) > 50) (delta > 0 ? anterior : siguiente)();
        inicioTactil.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 text-arena-100">
        <p className="text-sm tabular-nums">
          {indice + 1} / {fotos.length}
        </p>
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar la galería"
          autoFocus
          className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-arena-100/12"
        >
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex-1">
        <Foto
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="100vw"
          className="bg-transparent object-contain"
          priority
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <button
          type="button"
          onClick={anterior}
          aria-label="Foto anterior"
          className="inline-flex size-12 items-center justify-center rounded-full bg-arena-100/12 text-arena-50 transition-colors hover:bg-arena-100/22"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>

        <p className="min-w-0 flex-1 text-center text-sm text-arena-200/90">
          {foto.alt}
        </p>

        <button
          type="button"
          onClick={siguiente}
          aria-label="Foto siguiente"
          className="inline-flex size-12 items-center justify-center rounded-full bg-arena-100/12 text-arena-50 transition-colors hover:bg-arena-100/22"
        >
          <ChevronRight className="size-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
