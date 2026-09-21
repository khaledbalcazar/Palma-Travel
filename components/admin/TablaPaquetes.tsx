"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Loader2, Search, Star, Trash2 } from "lucide-react";
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  type Estado,
  type PaqueteRegistro,
} from "@/lib/schema";
import {
  alternarDestacado,
  borrarPaquete,
  cambiarEstadoPaquete,
  duplicarPaquete,
} from "@/lib/admin/acciones";
import { precioUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Confirmar } from "@/components/admin/Confirmar";

const COLOR_ESTADO: Record<Estado, string> = {
  activo: "bg-palma-100 text-palma-800",
  agotado: "bg-coral-100 text-coral-800",
  proximamente: "bg-arena-300 text-arena-900",
  oculto: "bg-tinta-100 text-tinta-600",
};

export function TablaPaquetes({ paquetes }: { paquetes: PaqueteRegistro[] }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Estado | "todos">("todos");
  const [aBorrar, setABorrar] = useState<PaqueteRegistro | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [trabajando, empezar] = useTransition();

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return paquetes.filter((p) => {
      if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
      if (!texto) return true;
      return [p.titulo, p.destino, p.pais, p.slug]
        .join(" ")
        .toLowerCase()
        .includes(texto);
    });
  }, [paquetes, busqueda, filtroEstado]);

  const ejecutar = (accion: () => Promise<{ ok: boolean; mensaje?: string }>) =>
    empezar(async () => {
      const r = await accion();
      setAviso(r.mensaje ?? null);
      router.refresh();
    });

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-tinta-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, destino o enlace"
            aria-label="Buscar paquetes"
            className="w-full rounded-full border border-palma-900/15 bg-arena-50 py-2.5 pr-4 pl-10 text-[0.95rem] placeholder:text-tinta-300"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as Estado | "todos")}
          aria-label="Filtrar por estado"
          className="rounded-full border border-palma-900/15 bg-arena-50 px-4 py-2.5 text-[0.95rem]"
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </select>
      </div>

      {aviso && (
        <p role="status" className="mb-4 rounded-xl bg-palma-100 px-4 py-3 text-sm text-palma-800">
          {aviso}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-palma-900/15 px-6 py-14 text-center text-tinta-500">
          {paquetes.length === 0
            ? "Todavía no hay paquetes cargados."
            : "Ningún paquete coincide con lo que buscaste."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl bg-arena-50 p-4 sm:flex-row sm:items-center"
            >
              <Link
                href={`/admin/paquetes/${p.id}`}
                className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl bg-arena-200 sm:w-32"
              >
                <Image
                  src={p.imagenPortada.src}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      COLOR_ESTADO[p.estado],
                    )}
                  >
                    {ETIQUETA_ESTADO[p.estado]}
                  </span>
                  {p.destacado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-arena-300 px-2.5 py-0.5 text-xs font-medium text-arena-900">
                      <Star className="size-3 fill-current" aria-hidden="true" />
                      Destacado
                    </span>
                  )}
                  {!p.incluyeVuelo && (
                    <span className="rounded-full bg-coral-100 px-2.5 py-0.5 text-xs font-medium text-coral-800">
                      Sin vuelo
                    </span>
                  )}
                </div>

                <Link
                  href={`/admin/paquetes/${p.id}`}
                  className="mt-1.5 block font-display text-lg text-palma-900 hover:underline"
                >
                  {p.titulo}
                </Link>
                <p className="text-sm text-tinta-500">
                  {p.destino} · {p.duracionDias} días · desde{" "}
                  {precioUSD(p.precioDesde)}
                </p>
                <p className="mt-1 text-xs text-tinta-400">
                  Última edición{" "}
                  {new Date(p.actualizadoEn).toLocaleDateString("es-PY", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {p.actualizadoPor ? ` por ${p.actualizadoPor}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                <select
                  value={p.estado}
                  disabled={trabajando}
                  onChange={(e) =>
                    ejecutar(() =>
                      cambiarEstadoPaquete(p.id, e.target.value as Estado),
                    )
                  }
                  aria-label={`Estado de ${p.titulo}`}
                  className="rounded-full border border-palma-900/15 bg-white px-3 py-1.5 text-sm"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {ETIQUETA_ESTADO[e]}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={trabajando}
                    onClick={() =>
                      ejecutar(() => alternarDestacado(p.id, !p.destacado))
                    }
                    aria-label={
                      p.destacado
                        ? `Quitar ${p.titulo} de destacados`
                        : `Destacar ${p.titulo}`
                    }
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full transition-colors",
                      p.destacado
                        ? "text-arena-700 hover:bg-arena-200"
                        : "text-tinta-400 hover:bg-palma-900/8",
                    )}
                  >
                    <Star
                      className={cn("size-4", p.destacado && "fill-current")}
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    disabled={trabajando}
                    onClick={() => ejecutar(() => duplicarPaquete(p.id))}
                    aria-label={`Duplicar ${p.titulo}`}
                    title="Duplicar"
                    className="inline-flex size-9 items-center justify-center rounded-full text-tinta-400 transition-colors hover:bg-palma-900/8"
                  >
                    <Copy className="size-4" aria-hidden="true" />
                  </button>

                  {p.estado !== "oculto" && (
                    <Link
                      href={`/paquetes/${p.slug}`}
                      target="_blank"
                      aria-label={`Ver ${p.titulo} en el sitio`}
                      title="Ver en el sitio"
                      className="inline-flex size-9 items-center justify-center rounded-full text-tinta-400 transition-colors hover:bg-palma-900/8"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={trabajando}
                    onClick={() => setABorrar(p)}
                    aria-label={`Eliminar ${p.titulo}`}
                    title="Eliminar"
                    className="inline-flex size-9 items-center justify-center rounded-full text-tinta-400 transition-colors hover:bg-coral-500/12 hover:text-coral-700"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {trabajando && (
        <p className="mt-4 flex items-center gap-2 text-sm text-tinta-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Guardando…
        </p>
      )}

      <Confirmar
        abierto={aBorrar !== null}
        titulo="¿Eliminar este paquete?"
        mensaje={`Se va a eliminar "${aBorrar?.titulo ?? ""}" para siempre. Si solo querés sacarlo del sitio, mejor cambiale el estado a «Oculto».`}
        alCancelar={() => setABorrar(null)}
        alConfirmar={() => {
          const p = aBorrar;
          setABorrar(null);
          if (p) ejecutar(() => borrarPaquete(p.id));
        }}
      />
    </>
  );
}
