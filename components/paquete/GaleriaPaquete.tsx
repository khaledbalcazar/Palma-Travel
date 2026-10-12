"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { Imagen } from "@/lib/schema";
import { Foto } from "@/components/ui/Foto";

export function GaleriaPaquete({ fotos }: { fotos: Imagen[] }) {
  const [indice, setIndice] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const abierta = indice !== null;
  const visibles = fotos.slice(0, 3);
  useEffect(() => {
    const visor = dialogo.current;
    if (!abierta || !visor) return;
    const overflow = document.body.style.overflow;
    visor.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      visor.close();
      document.body.style.overflow = overflow;
    };
  }, [abierta]);
  const mover = (paso: number) =>
    setIndice((actual) => ((actual ?? 0) + paso + fotos.length) % fotos.length);
  if (!fotos.length) return null;
  const actual = fotos[indice ?? 0]!;
  return (
    <section
      className="detalle-galeria"
      data-print="galeria"
      aria-label="Fotografías del viaje"
    >
      <ul className={`detalle-mosaico detalle-mosaico-${visibles.length}`}>
        {visibles.map((foto, i) => (
          <li key={`${foto.src}-${i}`}>
            <button
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ampliar foto ${i + 1}: ${foto.alt}`}
            >
              <Foto
                src={foto.src}
                alt={foto.alt}
                fill
                priority={i === 0}
                sizes={
                  i === 0
                    ? "(max-width: 767px) 100vw, 800px"
                    : "(max-width: 767px) 50vw, 400px"
                }
              />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="detalle-ver-fotos"
        onClick={() => setIndice(0)}
        data-print="ocultar"
      >
        <Images size={16} aria-hidden="true" />
        Ver {fotos.length === 1 ? "foto" : `las ${fotos.length} fotos`}
      </button>
      <dialog
        ref={dialogo}
        className="detalle-visor"
        aria-label={`Foto ${(indice ?? 0) + 1} de ${fotos.length}`}
        onCancel={(e) => {
          e.preventDefault();
          setIndice(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            mover(-1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            mover(1);
          }
        }}
      >
        <div className="detalle-visor-barra">
          <span aria-live="polite">
            {(indice ?? 0) + 1} / {fotos.length}
          </span>
          <button
            type="button"
            onClick={() => setIndice(null)}
            aria-label="Cerrar galería"
            autoFocus
          >
            <X size={24} />
          </button>
        </div>
        <div
          className="detalle-visor-foto"
          onTouchStart={(e) => {
            const t = e.touches[0];
            toque.current = t ? { x: t.clientX, y: t.clientY } : null;
          }}
          onTouchEnd={(e) => {
            const t = e.changedTouches[0];
            if (t && toque.current) {
              const x = t.clientX - toque.current.x;
              const y = t.clientY - toque.current.y;
              if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y))
                mover(x > 0 ? -1 : 1);
            }
            toque.current = null;
          }}
        >
          {abierta && (
            <Foto
              src={actual.src}
              alt={actual.alt}
              fill
              sizes="100vw"
              className="object-contain bg-transparent"
            />
          )}
        </div>
        <div className="detalle-visor-pie">
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Foto anterior"
            disabled={fotos.length < 2}
          >
            <ChevronLeft />
          </button>
          <p>{actual.alt}</p>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Foto siguiente"
            disabled={fotos.length < 2}
          >
            <ChevronRight />
          </button>
        </div>
      </dialog>
    </section>
  );
}
