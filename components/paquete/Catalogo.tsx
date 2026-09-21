"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  ETIQUETA_REGION,
  ETIQUETA_TIPO_VIAJE,
  REGIONES,
  TIPOS_VIAJE,
  type Paquete,
  type Region,
  type SiteConfig,
  type TipoViaje,
} from "@/lib/schema";
import {
  aplicarFiltros,
  cantidadDeFiltros,
  ETIQUETA_ORDEN,
  filtrosDesdeParams,
  FILTROS_VACIOS,
  ordenar,
  ORDENES,
  paramsDesdeFiltros,
  RANGOS_DURACION,
  RANGOS_PRECIO,
  type Filtros,
  type Orden,
} from "@/lib/filtros";
import { MESES_OPCIONES } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PaqueteCard } from "@/components/paquete/PaqueteCard";
import { Boton } from "@/components/ui/Boton";

export function Catalogo({
  paquetes,
  config,
  hoy,
}: {
  paquetes: Paquete[];
  config: SiteConfig;
  hoy: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [panelAbierto, setPanelAbierto] = useState(false);

  const filtros = useMemo(
    () => filtrosDesdeParams(new URLSearchParams(params.toString())),
    [params],
  );

  const aplicar = useCallback(
    (nuevos: Filtros) => {
      const query = paramsDesdeFiltros(nuevos).toString();
      router.replace(query ? `/paquetes?${query}` : "/paquetes", {
        scroll: false,
      });
    },
    [router],
  );

  const alternarEnLista = <T extends string | number>(
    clave: keyof Filtros,
    valor: T,
  ) => {
    const actual = filtros[clave] as T[];
    const nueva = actual.includes(valor)
      ? actual.filter((v) => v !== valor)
      : [...actual, valor];
    aplicar({ ...filtros, [clave]: nueva });
  };

  const resultados = useMemo(
    () => ordenar(aplicarFiltros(paquetes, filtros), filtros.orden, hoy),
    [paquetes, filtros, hoy],
  );

  const cantidad = cantidadDeFiltros(filtros);

  const panel = (
    <div className="space-y-7">
      <GrupoFiltro titulo="Región">
        {REGIONES.map((r) => (
          <Pastilla
            key={r}
            activa={filtros.region.includes(r)}
            onClick={() => alternarEnLista<Region>("region", r)}
          >
            {ETIQUETA_REGION[r]}
          </Pastilla>
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Tipo de viaje">
        {TIPOS_VIAJE.map((t) => (
          <Pastilla
            key={t}
            activa={filtros.tipo.includes(t)}
            onClick={() => alternarEnLista<TipoViaje>("tipo", t)}
          >
            {ETIQUETA_TIPO_VIAJE[t]}
          </Pastilla>
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Precio por persona">
        {RANGOS_PRECIO.map((r) => (
          <Pastilla
            key={r.valor}
            activa={filtros.precio.includes(r.valor)}
            onClick={() => alternarEnLista<string>("precio", r.valor)}
          >
            {r.etiqueta}
          </Pastilla>
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Duración">
        {RANGOS_DURACION.map((r) => (
          <Pastilla
            key={r.valor}
            activa={filtros.duracion.includes(r.valor)}
            onClick={() => alternarEnLista<string>("duracion", r.valor)}
          >
            {r.etiqueta}
          </Pastilla>
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Mes de salida">
        {MESES_OPCIONES.map((m) => (
          <Pastilla
            key={m.valor}
            activa={filtros.mes.includes(m.valor)}
            onClick={() => alternarEnLista<number>("mes", m.valor)}
          >
            {m.etiqueta}
          </Pastilla>
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Vuelo">
        <Pastilla
          activa={filtros.vuelo === "si"}
          onClick={() =>
            aplicar({ ...filtros, vuelo: filtros.vuelo === "si" ? null : "si" })
          }
        >
          Con vuelo incluido
        </Pastilla>
        <Pastilla
          activa={filtros.vuelo === "no"}
          onClick={() =>
            aplicar({ ...filtros, vuelo: filtros.vuelo === "no" ? null : "no" })
          }
        >
          Sin vuelo
        </Pastilla>
      </GrupoFiltro>

      {cantidad > 0 && (
        <Boton
          type="button"
          variante="fantasma"
          tamano="sm"
          onClick={() => aplicar({ ...FILTROS_VACIOS, orden: filtros.orden })}
        >
          <X className="size-4" aria-hidden="true" />
          Borrar los filtros
        </Boton>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
      {/* Filtros: columna fija en pantallas grandes */}
      <aside className="hidden lg:block">
        <h2 className="font-display text-xl text-palma-900">Filtrar</h2>
        <div className="mt-5">{panel}</div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.95rem] text-tinta-600" role="status">
            {resultados.length === 0
              ? "Ningún viaje coincide"
              : `${resultados.length} ${resultados.length === 1 ? "viaje" : "viajes"}`}
            {cantidad > 0 && " con los filtros elegidos"}
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="orden" className="solo-lectores">
              Ordenar por
            </label>
            <select
              id="orden"
              value={filtros.orden}
              onChange={(e) =>
                aplicar({ ...filtros, orden: e.target.value as Orden })
              }
              className="rounded-full border border-palma-900/15 bg-arena-50 px-4 py-2 text-sm"
            >
              {ORDENES.map((o) => (
                <option key={o} value={o}>
                  {ETIQUETA_ORDEN[o]}
                </option>
              ))}
            </select>

            <Boton
              type="button"
              variante="secundario"
              tamano="sm"
              className="lg:hidden"
              onClick={() => setPanelAbierto(true)}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filtrar
              {cantidad > 0 && (
                <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-palma-800 text-[0.7rem] text-arena-50">
                  {cantidad}
                </span>
              )}
            </Boton>
          </div>
        </div>

        {resultados.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-palma-900/15 px-6 py-16 text-center">
            <p className="font-display text-xl text-palma-900">
              No encontramos ningún viaje así
            </p>
            <p className="mx-auto mt-2 max-w-md text-tinta-600">
              Probá sacando algún filtro. Y si lo que buscás no está en la lista,
              igual lo podemos armar: escribinos y lo vemos juntos.
            </p>
            <Boton
              type="button"
              variante="secundario"
              className="mt-6"
              onClick={() => aplicar(FILTROS_VACIOS)}
            >
              Ver todos los viajes
            </Boton>
          </div>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {resultados.map((p, i) => (
              <li key={p.slug}>
                <PaqueteCard paquete={p} config={config} prioridad={i < 3} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filtros en el celular: panel que sube desde abajo */}
      {panelAbierto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-arena-50 lg:hidden">
          <div className="flex items-center justify-between border-b border-palma-900/10 px-5 py-4">
            <h2 className="font-display text-xl text-palma-900">Filtrar</h2>
            <button
              type="button"
              onClick={() => setPanelAbierto(false)}
              aria-label="Cerrar los filtros"
              autoFocus
              className="inline-flex size-10 items-center justify-center rounded-full text-palma-900 hover:bg-palma-900/6"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>

          <div className="border-t border-palma-900/10 px-5 py-4">
            <Boton
              type="button"
              tamano="lg"
              className="w-full"
              onClick={() => setPanelAbierto(false)}
            >
              Ver {resultados.length}{" "}
              {resultados.length === 1 ? "viaje" : "viajes"}
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}

function GrupoFiltro({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold tracking-wide text-tinta-500 uppercase">
        {titulo}
      </legend>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Pastilla({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        activa
          ? "bg-palma-800 text-arena-50"
          : "bg-arena-100 text-tinta-600 ring-1 ring-inset ring-palma-900/10 hover:bg-arena-200",
      )}
    >
      {children}
    </button>
  );
}
