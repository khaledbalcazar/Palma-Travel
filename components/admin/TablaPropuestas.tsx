"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, Loader2, Search, Trash2 } from "lucide-react";
import type { PropuestaRegistro } from "@/lib/schema";
import { borrarPropuesta, duplicarPropuesta } from "@/lib/admin/acciones";
import { fechaCorta, hoyISO } from "@/lib/format";
import { mensajePropuesta } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Confirmar } from "@/components/admin/Confirmar";
import { IconoWhatsApp } from "@/components/ui/IconosRedes";

export function TablaPropuestas({
  propuestas,
  urlSitio,
  whatsapp,
}: {
  propuestas: PropuestaRegistro[];
  urlSitio: string;
  whatsapp: string;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "vigentes" | "vencidas">("todas");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [aBorrar, setABorrar] = useState<PropuestaRegistro | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [trabajando, empezar] = useTransition();
  const hoy = hoyISO();

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return propuestas.filter((p) => {
      const vigente = p.validaHasta >= hoy;
      if (filtro === "vigentes" && !vigente) return false;
      if (filtro === "vencidas" && vigente) return false;
      if (!texto) return true;
      return [p.clienteNombre, p.titulo, p.destino, p.slug]
        .join(" ")
        .toLowerCase()
        .includes(texto);
    });
  }, [propuestas, busqueda, filtro, hoy]);

  const enlaceDe = (p: PropuestaRegistro) =>
    `${urlSitio.replace(/\/$/, "")}/propuesta/${p.slug}`;

  async function copiar(p: PropuestaRegistro) {
    try {
      await navigator.clipboard.writeText(enlaceDe(p));
      setCopiado(p.id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      setAviso("No se pudo copiar. Copiá el enlace a mano desde la barra del navegador.");
    }
  }

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
            placeholder="Buscar por cliente, título o destino"
            aria-label="Buscar propuestas"
            className="w-full rounded-full border border-palma-900/15 bg-arena-50 py-2.5 pr-4 pl-10 text-[0.95rem] placeholder:text-tinta-300"
          />
        </div>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as typeof filtro)}
          aria-label="Filtrar propuestas"
          className="rounded-full border border-palma-900/15 bg-arena-50 px-4 py-2.5 text-[0.95rem]"
        >
          <option value="todas">Todas</option>
          <option value="vigentes">Vigentes</option>
          <option value="vencidas">Vencidas</option>
        </select>
      </div>

      {aviso && (
        <p role="status" className="mb-4 rounded-xl bg-palma-100 px-4 py-3 text-sm text-palma-800">
          {aviso}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-palma-900/15 px-6 py-14 text-center text-tinta-500">
          {propuestas.length === 0
            ? "Todavía no armaste ninguna propuesta personalizada."
            : "Ninguna propuesta coincide con lo que buscaste."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((p) => {
            const vigente = p.validaHasta >= hoy;
            const wa = whatsapp
              ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  mensajePropuesta(p),
                )}`
              : null;

            return (
              <li key={p.id} className="rounded-2xl bg-arena-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      vigente
                        ? "bg-palma-100 text-palma-800"
                        : "bg-coral-100 text-coral-800",
                    )}
                  >
                    {vigente
                      ? `Vigente hasta el ${fechaCorta(p.validaHasta)}`
                      : `Vencida el ${fechaCorta(p.validaHasta)}`}
                  </span>
                </div>

                <Link
                  href={`/admin/propuestas/${p.id}`}
                  className="mt-1.5 block font-display text-lg text-palma-900 hover:underline"
                >
                  {p.clienteNombre} — {p.titulo}
                </Link>
                <p className="text-sm text-tinta-500">
                  {p.destino} · {p.duracionDias} días
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

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copiar(p)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-palma-900/8 px-3.5 py-1.5 text-sm font-medium text-palma-800 transition-colors hover:bg-palma-900/14"
                  >
                    {copiado === p.id ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      <Link2 className="size-4" aria-hidden="true" />
                    )}
                    {copiado === p.id ? "¡Copiado!" : "Copiar link"}
                  </button>

                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark"
                    >
                      <IconoWhatsApp className="size-4" />
                      Enviar por WhatsApp
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={trabajando}
                    onClick={() => ejecutar(() => duplicarPropuesta(p.id))}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-tinta-500 transition-colors hover:bg-palma-900/8"
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    Duplicar
                  </button>

                  <button
                    type="button"
                    disabled={trabajando}
                    onClick={() => setABorrar(p)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-tinta-500 transition-colors hover:bg-coral-500/12 hover:text-coral-700"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
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
        titulo="¿Eliminar esta propuesta?"
        mensaje={`Se va a eliminar la propuesta de ${aBorrar?.clienteNombre ?? ""} para siempre, y el enlace que le mandaste al cliente va a dejar de funcionar.`}
        alCancelar={() => setABorrar(null)}
        alConfirmar={() => {
          const p = aBorrar;
          setABorrar(null);
          if (p) ejecutar(() => borrarPropuesta(p.id));
        }}
      />
    </>
  );
}
