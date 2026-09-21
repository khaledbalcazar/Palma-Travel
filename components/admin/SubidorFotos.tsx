"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { comprimirFoto, nombreDeArchivo, pesoLegible } from "@/lib/imagen";
import type { Imagen } from "@/lib/schema";
import { cn } from "@/lib/utils";

/* ===================================================================
   FOTOS DEL PAQUETE
   Arrastrá y soltá varias fotos a la vez. Antes de subirlas se achican
   y se convierten a WebP. Cada foto necesita su texto alternativo, que
   es lo que leen las personas ciegas y lo que ve Google.
   =================================================================== */

const BUCKET = "paquetes";

export function SubidorFotos({
  slug,
  portada,
  galeria,
  alCambiarPortada,
  alCambiarGaleria,
  error,
}: {
  slug: string;
  portada: Imagen | null;
  galeria: Imagen[];
  alCambiarPortada: (imagen: Imagen | null) => void;
  alCambiarGaleria: (imagenes: Imagen[]) => void;
  error?: string;
}) {
  const [subiendo, setSubiendo] = useState(0);
  const [sobreZona, setSobreZona] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  const todas = portada ? [portada, ...galeria] : galeria;

  /** Rearma portada + galería a partir de la lista completa. */
  const guardarTodas = (lista: Imagen[]) => {
    alCambiarPortada(lista[0] ?? null);
    alCambiarGaleria(lista.slice(1));
  };

  async function subir(archivos: FileList | File[]) {
    const lista = Array.from(archivos);
    if (lista.length === 0) return;

    setErrorSubida(null);
    setSubiendo(lista.length);

    const supabase = clienteNavegador();
    const nuevas: Imagen[] = [];

    for (const archivo of lista) {
      try {
        const foto = await comprimirFoto(archivo);
        const ruta = nombreDeArchivo(slug || "sin-slug", foto.extension);

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(ruta, foto.blob, {
            contentType: foto.blob.type || "image/webp",
            upsert: false,
          });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
        nuevas.push({ src: data.publicUrl, alt: "" });
      } catch (e) {
        setErrorSubida(
          `No se pudo subir "${archivo.name}": ${
            e instanceof Error ? e.message : "error desconocido"
          }`,
        );
      } finally {
        setSubiendo((n) => n - 1);
      }
    }

    if (nuevas.length) guardarTodas([...todas, ...nuevas]);
  }

  const mover = (desde: number, hasta: number) => {
    if (hasta < 0 || hasta >= todas.length) return;
    const copia = [...todas];
    const [sacada] = copia.splice(desde, 1);
    copia.splice(hasta, 0, sacada!);
    guardarTodas(copia);
  };

  const sinTextoAlternativo = todas.filter((f) => !f.alt.trim()).length;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-palma-900">Fotos</h3>
          <p className="mt-0.5 text-xs text-tinta-500">
            La primera foto es la portada. Arrastrá para cambiar el orden con las
            flechas. Se achican solas antes de subir.
          </p>
        </div>
      </div>

      {/* Zona para soltar archivos */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSobreZona(true);
        }}
        onDragLeave={() => setSobreZona(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSobreZona(false);
          void subir(e.dataTransfer.files);
        }}
        className={cn(
          "mt-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          sobreZona
            ? "border-palma-600 bg-palma-50"
            : "border-palma-900/15 bg-arena-100",
        )}
      >
        <ImagePlus className="mx-auto size-7 text-tinta-400" aria-hidden="true" />
        <p className="mt-2 text-sm text-tinta-600">
          Arrastrá las fotos acá, o
        </p>
        <button
          type="button"
          onClick={() => campo.current?.click()}
          className="mt-2 rounded-full bg-palma-900/8 px-4 py-2 text-sm font-medium text-palma-800 transition-colors hover:bg-palma-900/14"
        >
          Elegir del dispositivo
        </button>
        <input
          ref={campo}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void subir(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-2 text-xs text-tinta-400">
          Se guardan en WebP, con un máximo de 2000 px de lado.
        </p>
      </div>

      {subiendo > 0 && (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm text-tinta-600">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Subiendo {subiendo} {subiendo === 1 ? "foto" : "fotos"}…
        </p>
      )}

      {errorSubida && (
        <p role="alert" className="mt-3 rounded-lg bg-coral-100 px-4 py-3 text-sm text-coral-800">
          {errorSubida}
        </p>
      )}

      {sinTextoAlternativo > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-arena-200 px-4 py-3 text-sm text-tinta-700">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-coral-600" aria-hidden="true" />
          <span>
            Falta el texto alternativo en {sinTextoAlternativo}{" "}
            {sinTextoAlternativo === 1 ? "foto" : "fotos"}. Describí en pocas
            palabras qué se ve; es obligatorio para poder publicar.
          </span>
        </p>
      )}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {todas.map((foto, i) => (
          <li
            key={`${foto.src}-${i}`}
            className="overflow-hidden rounded-xl bg-arena-100 ring-1 ring-inset ring-palma-900/10"
          >
            <div className="relative aspect-[3/2] bg-arena-200">
              <Image
                src={foto.src}
                alt={foto.alt || "Foto sin texto alternativo"}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
              {i === 0 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-palma-900/85 px-2.5 py-1 text-xs font-medium text-arena-50">
                  <Star className="size-3 fill-current" aria-hidden="true" />
                  Portada
                </span>
              )}
            </div>

            <div className="p-3">
              <label
                htmlFor={`alt-${i}`}
                className="block text-xs font-medium text-tinta-600"
              >
                Texto alternativo (obligatorio)
              </label>
              <input
                id={`alt-${i}`}
                value={foto.alt}
                onChange={(e) => {
                  const copia = [...todas];
                  copia[i] = { ...foto, alt: e.target.value };
                  guardarTodas(copia);
                }}
                placeholder="Por ejemplo: pareja caminando por la playa al atardecer"
                className={cn(
                  "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-tinta-300",
                  foto.alt.trim() ? "border-palma-900/15" : "border-coral-400",
                )}
              />

              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => mover(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Mover la foto ${i + 1} hacia atrás`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-palma-900/8 disabled:opacity-25"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, i + 1)}
                    disabled={i === todas.length - 1}
                    aria-label={`Mover la foto ${i + 1} hacia adelante`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-palma-900/8 disabled:opacity-25"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => mover(i, 0)}
                      className="rounded-md px-2.5 text-xs font-medium text-palma-700 transition-colors hover:bg-palma-900/8"
                    >
                      Usar de portada
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => guardarTodas(todas.filter((_, j) => j !== i))}
                  aria-label={`Quitar la foto ${i + 1}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-tinta-400 transition-colors hover:bg-coral-500/12 hover:text-coral-700"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-3 text-sm text-coral-700">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-tinta-400">
        Peso máximo recomendado por foto antes de subir: 10 MB
        {` (${pesoLegible(10 * 1024 * 1024)}).`} Si una foto no sube, probá con
        una más chica.
      </p>
    </section>
  );
}
