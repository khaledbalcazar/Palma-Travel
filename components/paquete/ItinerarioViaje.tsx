"use client";

import { useRef } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import type { Viaje } from "@/lib/schema";

export function ItinerarioViaje({ dias }: { dias: Viaje["itinerario"] }) {
  const lista = useRef<HTMLOListElement>(null);
  const mostrar = (abierto: boolean) =>
    lista.current?.querySelectorAll("details").forEach((dia) => {
      dia.open = abierto;
    });
  return (
    <div>
      <div className="itinerario-herramientas" data-print="ocultar">
        <span>
          <MapPin size={15} aria-hidden="true" />
          El recorrido, paso a paso
        </span>
        <div>
          <button type="button" onClick={() => mostrar(true)}>
            Expandir todos
          </button>
          <button type="button" onClick={() => mostrar(false)}>
            Contraer todos
          </button>
        </div>
      </div>
      <ol ref={lista} className="detalle-itinerario">
        {dias.map((dia, i) => (
          <li key={`${dia.dia}-${i}`}>
            <details open={i === 0} data-print="abrir">
              <summary>
                <span className="itinerario-dia">
                  <small>DÍA</small>
                  {String(dia.dia).padStart(2, "0")}
                </span>
                <span>{dia.titulo}</span>
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{dia.descripcion}</p>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
