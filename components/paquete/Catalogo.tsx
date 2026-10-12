"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  Landmark,
  Mountain,
  Palmtree,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trees,
  X,
} from "lucide-react";
import {
  ETIQUETA_REGION,
  ETIQUETA_TIPO_VIAJE,
  REGIONES,
  TIPOS_VIAJE,
  type Paquete,
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
import { PaqueteCard } from "@/components/paquete/PaqueteCard";
import { Boton } from "@/components/ui/Boton";

type ListaFiltro = "region" | "tipo" | "precio" | "duracion" | "mes";
const CATEGORIAS: {
  valor: TipoViaje | "";
  etiqueta: string;
  icono: typeof Compass;
}[] = [
  { valor: "", etiqueta: "Todos los viajes", icono: Compass },
  { valor: "playa", etiqueta: "Sol y playa", icono: Palmtree },
  { valor: "aventura", etiqueta: "Aventura", icono: Mountain },
  { valor: "cultura", etiqueta: "Cultura", icono: Landmark },
  { valor: "naturaleza", etiqueta: "Naturaleza", icono: Trees },
];

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
  const dialogo = useRef<HTMLDialogElement>(null);
  const filtrosUrl = useMemo(
    () => filtrosDesdeParams(new URLSearchParams(params.toString())),
    [params],
  );
  const [filtros, mostrarFiltros] = useOptimistic(filtrosUrl);
  const [pendiente, iniciarTransicion] = useTransition();
  const aplicar = useCallback(
    (nuevos: Filtros) => {
      const query = paramsDesdeFiltros(nuevos).toString();
      iniciarTransicion(() => {
        mostrarFiltros(nuevos);
        router.replace(query ? `/paquetes?${query}` : "/paquetes", {
          scroll: false,
        });
      });
    },
    [router, mostrarFiltros],
  );

  useEffect(() => {
    const panel = dialogo.current;
    if (!panelAbierto || !panel) return;
    const overflow = document.body.style.overflow;
    panel.showModal();
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 1024px)");
    const alCambiar = () => {
      if (media.matches) setPanelAbierto(false);
    };
    media.addEventListener("change", alCambiar);
    return () => {
      panel.close();
      document.body.style.overflow = overflow;
      media.removeEventListener("change", alCambiar);
    };
  }, [panelAbierto]);

  const alternar = (clave: ListaFiltro, valor: string | number) => {
    const actual = filtros[clave] as (string | number)[];
    aplicar({
      ...filtros,
      [clave]: actual.includes(valor)
        ? actual.filter((v) => v !== valor)
        : [...actual, valor],
    });
  };
  const limpiar = () => aplicar({ ...FILTROS_VACIOS, orden: filtros.orden });
  const resultados = useMemo(
    () => ordenar(aplicarFiltros(paquetes, filtros), filtros.orden, hoy),
    [paquetes, filtros, hoy],
  );
  const cantidad = cantidadDeFiltros(filtros);
  const grupos: {
    clave: ListaFiltro;
    titulo: string;
    opciones: { valor: string | number; etiqueta: string }[];
  }[] = [
    {
      clave: "region",
      titulo: "Destino",
      opciones: REGIONES.map((valor) => ({
        valor,
        etiqueta: ETIQUETA_REGION[valor],
      })),
    },
    {
      clave: "precio",
      titulo: "Presupuesto por persona",
      opciones: [...RANGOS_PRECIO],
    },
    {
      clave: "duracion",
      titulo: "Duración del viaje",
      opciones: [...RANGOS_DURACION],
    },
    {
      clave: "mes",
      titulo: "Mes de salida",
      opciones: MESES_OPCIONES.map((m) => ({
        valor: m.valor,
        etiqueta: m.etiqueta,
      })),
    },
    {
      clave: "tipo",
      titulo: "Tipo de experiencia",
      opciones: TIPOS_VIAJE.map((valor) => ({
        valor,
        etiqueta: ETIQUETA_TIPO_VIAJE[valor],
      })),
    },
  ];
  const activos = grupos.flatMap(({ clave, opciones }) =>
    (filtros[clave] as (string | number)[]).map((valor) => ({
      id: `${clave}-${valor}`,
      etiqueta:
        opciones.find((o) => o.valor === valor)?.etiqueta ?? String(valor),
      quitar: () => alternar(clave, valor),
    })),
  );
  if (filtros.busqueda)
    activos.unshift({
      id: "busqueda",
      etiqueta: `“${filtros.busqueda}”`,
      quitar: () => aplicar({ ...filtros, busqueda: "" }),
    });
  if (filtros.vuelo)
    activos.push({
      id: "vuelo",
      etiqueta: filtros.vuelo === "si" ? "Vuelo incluido" : "Sin vuelo",
      quitar: () => aplicar({ ...filtros, vuelo: null }),
    });

  const panel = (
    <>
      {grupos.map(({ clave, titulo, opciones }, i) => (
        <details
          className="catalogo-grupo"
          key={clave}
          open={i < 2 || filtros[clave].length > 0}
        >
          <summary>
            {titulo}
            <span>
              {filtros[clave].length > 0 && <b>{filtros[clave].length}</b>}
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </summary>
          <fieldset>
            <legend className="solo-lectores">{titulo}</legend>
            {opciones.map(({ valor, etiqueta }) => {
              const seleccionada = (
                filtros[clave] as (string | number)[]
              ).includes(valor);
              return (
                <label className="catalogo-opcion" key={valor}>
                  <input
                    type="checkbox"
                    checked={seleccionada}
                    onChange={() => alternar(clave, valor)}
                  />
                  <span className="catalogo-check" aria-hidden="true">
                    {seleccionada && <Check size={12} />}
                  </span>
                  <span>{etiqueta}</span>
                </label>
              );
            })}
          </fieldset>
        </details>
      ))}
      <details className="catalogo-grupo" open={!!filtros.vuelo}>
        <summary>
          Pasaje aéreo
          <span>
            {filtros.vuelo && <b>1</b>}
            <ChevronDown size={16} aria-hidden="true" />
          </span>
        </summary>
        <fieldset>
          <legend className="solo-lectores">Pasaje aéreo</legend>
          {(["si", "no"] as const).map((valor) => (
            <label className="catalogo-opcion" key={valor}>
              <input
                type="checkbox"
                checked={filtros.vuelo === valor}
                onChange={() =>
                  aplicar({
                    ...filtros,
                    vuelo: filtros.vuelo === valor ? null : valor,
                  })
                }
              />
              <span className="catalogo-check" aria-hidden="true">
                {filtros.vuelo === valor && <Check size={12} />}
              </span>
              <span>{valor === "si" ? "Con vuelo incluido" : "Sin vuelo"}</span>
            </label>
          ))}
        </fieldset>
      </details>
    </>
  );

  return (
    <div className="catalogo">
      <div
        className="catalogo-categorias"
        aria-label="Explorar por experiencia"
      >
        {CATEGORIAS.map(({ valor, etiqueta, icono: Icono }) => (
          <button
            key={valor}
            type="button"
            aria-pressed={
              valor
                ? filtros.tipo.length === 1 && filtros.tipo[0] === valor
                : filtros.tipo.length === 0
            }
            onClick={() => aplicar({ ...filtros, tipo: valor ? [valor] : [] })}
          >
            <Icono size={19} aria-hidden="true" />
            {etiqueta}
          </button>
        ))}
      </div>
      <div className="catalogo-distribucion">
        <aside className="catalogo-lateral" aria-label="Filtros de viajes">
          <div className="catalogo-panel">
            <div className="catalogo-panel-titulo">
              <h2>
                <SlidersHorizontal size={17} aria-hidden="true" />
                Filtrá tu viaje
              </h2>
              {cantidad > 0 && (
                <button type="button" onClick={limpiar}>
                  Limpiar
                </button>
              )}
            </div>
            {panel}
          </div>
          <div className="catalogo-ayuda">
            <Sparkles size={22} aria-hidden="true" />
            <h3>¿No sabés por dónde empezar?</h3>
            <p>
              Contanos cómo te gusta viajar y encontrá una propuesta para vos.
            </p>
            <Link href="/encontra-tu-viaje">
              Encontrá tu viaje ideal{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </aside>
        <section
          className="catalogo-resultados"
          aria-label="Paquetes disponibles"
          aria-busy={pendiente}
        >
          <form
            className="catalogo-busqueda"
            role="search"
            aria-label="Buscar en el catálogo"
            onSubmit={(e) => {
              e.preventDefault();
              aplicar({
                ...filtros,
                busqueda: String(
                  new FormData(e.currentTarget).get("q") ?? "",
                ).trim(),
              });
            }}
          >
            <Search size={19} aria-hidden="true" />
            <label htmlFor="buscar-destino" className="solo-lectores">
              Buscar destino o país
            </label>
            <input
              key={filtros.busqueda}
              id="buscar-destino"
              name="q"
              type="search"
              defaultValue={filtros.busqueda}
              placeholder="¿Qué destino tenés en mente?"
            />
            <button type="submit">Buscar</button>
          </form>
          <div className="catalogo-herramientas">
            <p role="status" aria-live="polite">
              <strong>
                {resultados.length}{" "}
                {resultados.length === 1 ? "viaje" : "viajes"}
              </strong>
              <span>{cantidad ? " para tu búsqueda" : " para descubrir"}</span>
            </p>
            <div className="catalogo-controles">
              <button
                type="button"
                className="catalogo-abrir"
                onClick={() => setPanelAbierto(true)}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filtros{cantidad > 0 && <b>{cantidad}</b>}
              </button>
              <label className="catalogo-orden">
                <span className="solo-lectores">Ordenar por</span>
                <select
                  aria-label="Ordenar por"
                  value={filtros.orden}
                  onChange={(e) =>
                    aplicar({ ...filtros, orden: e.target.value as Orden })
                  }
                >
                  {ORDENES.map((o) => (
                    <option key={o} value={o}>
                      {ETIQUETA_ORDEN[o]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {activos.length > 0 && (
            <div className="catalogo-activos" aria-label="Filtros activos">
              {activos.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={a.quitar}
                  aria-label={`Quitar filtro ${a.etiqueta}`}
                >
                  {a.etiqueta}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                className="catalogo-limpiar"
                onClick={limpiar}
              >
                Limpiar todo
              </button>
            </div>
          )}
          {resultados.length ? (
            <ul className="catalogo-tarjetas">
              {resultados.map((p, i) => (
                <li key={p.slug}>
                  <PaqueteCard paquete={p} config={config} prioridad={i < 2} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="catalogo-vacio">
              <Compass size={38} aria-hidden="true" />
              <h2>Tu viaje puede estar un poco más allá.</h2>
              <p>
                No encontramos paquetes con esta combinación. Probá con otro
                destino o quitá algún filtro.
              </p>
              <Boton type="button" onClick={limpiar}>
                Ver todos los viajes
              </Boton>
              <Link href="/contacto">
                O armemos un viaje a tu medida{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
          {resultados.length > 0 && (
            <p className="catalogo-nota">
              Precios desde, según la base indicada en cada paquete. Consultá
              disponibilidad y condiciones antes de reservar.
            </p>
          )}
        </section>
      </div>
      <dialog
        ref={dialogo}
        className="catalogo-dialogo"
        aria-labelledby="titulo-filtros"
        onCancel={(e) => {
          e.preventDefault();
          setPanelAbierto(false);
        }}
      >
        <div className="catalogo-dialogo-encabezado">
          <h2 id="titulo-filtros">Tu viaje, tus preferencias</h2>
          <button
            type="button"
            onClick={() => setPanelAbierto(false)}
            aria-label="Cerrar filtros"
            autoFocus
          >
            <X size={22} />
          </button>
        </div>
        <div className="catalogo-dialogo-cuerpo">{panel}</div>
        <div className="catalogo-dialogo-pie">
          <button type="button" onClick={limpiar}>
            Limpiar filtros
          </button>
          <Boton type="button" onClick={() => setPanelAbierto(false)}>
            Ver {resultados.length}{" "}
            {resultados.length === 1 ? "viaje" : "viajes"}
            <ArrowRight size={16} aria-hidden="true" />
          </Boton>
        </div>
      </dialog>
    </div>
  );
}
