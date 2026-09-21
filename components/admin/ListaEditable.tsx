"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===================================================================
   LISTA EDITABLE
   Sirve para «incluye», itinerario, alojamiento, FAQ, documentación…
   Se puede agregar, borrar y reordenar: arrastrando en la computadora,
   o con las flechitas (que además funcionan en el celular y con teclado).
   =================================================================== */

export function ListaEditable<T>({
  titulo,
  ayuda,
  items,
  alCambiar,
  itemNuevo,
  textoAgregar = "Agregar",
  error,
  children,
}: {
  titulo: string;
  ayuda?: string;
  items: T[];
  alCambiar: (items: T[]) => void;
  itemNuevo: () => T;
  textoAgregar?: string;
  error?: string;
  children: (item: T, actualizar: (item: T) => void, indice: number) => ReactNode;
}) {
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  const mover = (desde: number, hasta: number) => {
    if (hasta < 0 || hasta >= items.length || desde === hasta) return;
    const copia = [...items];
    const [sacado] = copia.splice(desde, 1);
    copia.splice(hasta, 0, sacado!);
    alCambiar(copia);
  };

  const actualizarEn = (indice: number) => (item: T) => {
    const copia = [...items];
    copia[indice] = item;
    alCambiar(copia);
  };

  const quitar = (indice: number) =>
    alCambiar(items.filter((_, i) => i !== indice));

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-palma-900">{titulo}</h3>
          {ayuda && <p className="mt-0.5 text-xs text-tinta-500">{ayuda}</p>}
        </div>
        <span className="text-xs text-tinta-400">
          {items.length} {items.length === 1 ? "ítem" : "ítems"}
        </span>
      </div>

      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li
            key={i}
            draggable
            onDragStart={() => setArrastrando(i)}
            onDragEnd={() => setArrastrando(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (arrastrando !== null) mover(arrastrando, i);
              setArrastrando(null);
            }}
            className={cn(
              "flex items-start gap-2 rounded-xl bg-arena-100 p-3 transition-opacity",
              arrastrando === i && "opacity-40",
            )}
          >
            <span
              aria-hidden="true"
              title="Arrastrá para reordenar"
              className="mt-2 hidden cursor-grab text-tinta-400 active:cursor-grabbing md:block"
            >
              <GripVertical className="size-4" />
            </span>

            <div className="min-w-0 flex-1">{children(item, actualizarEn(i), i)}</div>

            <div className="flex shrink-0 flex-col gap-0.5">
              <button
                type="button"
                onClick={() => mover(i, i - 1)}
                disabled={i === 0}
                aria-label={`Subir el ítem ${i + 1}`}
                className="inline-flex size-7 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-palma-900/8 disabled:opacity-25"
              >
                <ChevronUp className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => mover(i, i + 1)}
                disabled={i === items.length - 1}
                aria-label={`Bajar el ítem ${i + 1}`}
                className="inline-flex size-7 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-palma-900/8 disabled:opacity-25"
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Quitar el ítem ${i + 1}`}
                className="inline-flex size-7 items-center justify-center rounded-md text-tinta-400 transition-colors hover:bg-coral-500/12 hover:text-coral-700"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="mt-3 rounded-xl border border-dashed border-palma-900/15 px-4 py-6 text-center text-sm text-tinta-400">
          Todavía no hay nada en esta lista.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-coral-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => alCambiar([...items, itemNuevo()])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-palma-900/8 px-4 py-2 text-sm font-medium text-palma-800 transition-colors hover:bg-palma-900/14"
      >
        <Plus className="size-4" aria-hidden="true" />
        {textoAgregar}
      </button>
    </section>
  );
}

/** Lista de textos sueltos (incluye, no incluye, highlights, coordinadores). */
export function ListaDeTextos({
  titulo,
  ayuda,
  items,
  alCambiar,
  placeholder,
  textoAgregar,
  error,
}: {
  titulo: string;
  ayuda?: string;
  items: string[];
  alCambiar: (items: string[]) => void;
  placeholder?: string;
  textoAgregar?: string;
  error?: string;
}) {
  return (
    <ListaEditable
      titulo={titulo}
      ayuda={ayuda}
      items={items}
      alCambiar={alCambiar}
      itemNuevo={() => ""}
      textoAgregar={textoAgregar}
      error={error}
    >
      {(item, actualizar, i) => (
        <>
          <label className="solo-lectores" htmlFor={`${titulo}-${i}`}>
            {titulo}, ítem {i + 1}
          </label>
          <textarea
            id={`${titulo}-${i}`}
            value={item}
            onChange={(e) => actualizar(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full resize-y rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-[0.95rem] placeholder:text-tinta-300"
          />
        </>
      )}
    </ListaEditable>
  );
}
