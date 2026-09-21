"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { MESES_OPCIONES } from "@/lib/format";
import type {
  IdealPara,
  Paquete,
  Region,
  Ritmo,
  SiteConfig,
  TipoViaje,
} from "@/lib/schema";
import { RESPUESTAS_VACIAS, type Respuestas } from "@/lib/match";
import { registrarEvento } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";
import {
  OPCIONES_COMPANIA,
  OPCIONES_DIAS,
  OPCIONES_PRESUPUESTO,
  OPCIONES_REGION,
  OPCIONES_RITMO,
  OPCIONES_TIPO,
  type Opcion,
} from "@/components/cuestionario/preguntas";
import { Resultados } from "@/components/cuestionario/Resultados";

const TOTAL_PASOS = 8;

export function Cuestionario({
  paquetes,
  config,
}: {
  paquetes: Paquete[];
  config: SiteConfig;
}) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>(RESPUESTAS_VACIAS);
  const [empezado, setEmpezado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);

  const terminado = paso >= TOTAL_PASOS;

  /* Al cambiar de pregunta, llevamos el foco al título: así quien usa
     lector de pantalla o teclado no se pierde. */
  useEffect(() => {
    titulo.current?.focus();
  }, [paso]);

  useEffect(() => {
    if (terminado) {
      registrarEvento("fin_cuestionario", {
        tipos: respuestas.tipoViaje.join(","),
        presupuesto: respuestas.presupuesto?.max,
      });
    }
  }, [terminado, respuestas]);

  const responder = <C extends keyof Respuestas>(
    campo: C,
    valor: Respuestas[C],
    avanzar = true,
  ) => {
    if (!empezado) {
      setEmpezado(true);
      registrarEvento("inicio_cuestionario");
    }
    setRespuestas((a) => ({ ...a, [campo]: valor }));
    if (avanzar) setPaso((p) => p + 1);
  };

  const alternarTipo = (valor: TipoViaje) => {
    if (!empezado) {
      setEmpezado(true);
      registrarEvento("inicio_cuestionario");
    }
    setRespuestas((a) => ({
      ...a,
      tipoViaje: a.tipoViaje.includes(valor)
        ? a.tipoViaje.filter((v) => v !== valor)
        : [...a.tipoViaje, valor],
    }));
  };

  if (terminado) {
    return (
      <Resultados
        paquetes={paquetes}
        respuestas={respuestas}
        config={config}
        alEmpezarDeNuevo={() => {
          setRespuestas(RESPUESTAS_VACIAS);
          setPaso(0);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-tinta-500">
          <span>
            Pregunta {paso + 1} de {TOTAL_PASOS}
          </span>
          <span>{Math.round((paso / TOTAL_PASOS) * 100)}%</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-arena-200"
          role="progressbar"
          aria-valuenow={paso + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_PASOS}
          aria-label="Avance del cuestionario"
        >
          <div
            className="h-full rounded-full bg-palma-700 transition-all duration-300"
            style={{ width: `${((paso + 1) / TOTAL_PASOS) * 100}%` }}
          />
        </div>
      </div>

      {paso === 0 && (
        <Pregunta
          refTitulo={titulo}
          titulo="¿Qué tipo de experiencia buscás?"
          ayuda="Podés elegir varias. Es la pregunta que más pesa en el resultado."
        >
          <Tarjetas
            opciones={OPCIONES_TIPO}
            seleccionadas={respuestas.tipoViaje}
            alElegir={alternarTipo}
            multiple
          />
        </Pregunta>
      )}

      {paso === 1 && (
        <Pregunta refTitulo={titulo} titulo="¿Con quién viajás?">
          <Tarjetas
            opciones={OPCIONES_COMPANIA}
            seleccionadas={respuestas.companiaViaje ? [respuestas.companiaViaje] : []}
            alElegir={(v: IdealPara) => responder("companiaViaje", v)}
          />
        </Pregunta>
      )}

      {paso === 2 && (
        <Pregunta
          refTitulo={titulo}
          titulo="¿Cuánto pensás gastar por persona?"
          ayuda="Es solo para orientarnos. Si algo te gusta y se pasa un poco, lo vemos."
        >
          <Lista
            opciones={OPCIONES_PRESUPUESTO.map((o) => ({
              valor: o.valor,
              etiqueta: o.etiqueta,
            }))}
            seleccionado={
              OPCIONES_PRESUPUESTO.find(
                (o) => o.max === respuestas.presupuesto?.max,
              )?.valor ?? null
            }
            alElegir={(valor) => {
              const o = OPCIONES_PRESUPUESTO.find((x) => x.valor === valor)!;
              responder("presupuesto", { min: o.min, max: o.max });
            }}
          />
        </Pregunta>
      )}

      {paso === 3 && (
        <Pregunta refTitulo={titulo} titulo="¿Cuántos días tenés?">
          <Lista
            opciones={OPCIONES_DIAS.map((o) => ({
              valor: o.valor,
              etiqueta: o.etiqueta,
              detalle: o.detalle,
            }))}
            seleccionado={
              OPCIONES_DIAS.find((o) => o.max === respuestas.dias?.max)?.valor ?? null
            }
            alElegir={(valor) => {
              const o = OPCIONES_DIAS.find((x) => x.valor === valor)!;
              responder("dias", { min: o.min, max: o.max });
            }}
          />
        </Pregunta>
      )}

      {paso === 4 && (
        <Pregunta refTitulo={titulo} titulo="¿Cuándo querés viajar?">
          <div className="flex flex-wrap gap-2">
            <Pastilla
              activa={respuestas.mes === "flexible"}
              onClick={() => responder("mes", "flexible")}
            >
              Todavía no sé / soy flexible
            </Pastilla>
            {MESES_OPCIONES.map((m) => (
              <Pastilla
                key={m.valor}
                activa={respuestas.mes === m.valor}
                onClick={() => responder("mes", m.valor)}
              >
                {m.etiqueta}
              </Pastilla>
            ))}
          </div>
        </Pregunta>
      )}

      {paso === 5 && (
        <Pregunta refTitulo={titulo} titulo="¿Qué ritmo preferís?">
          <Tarjetas
            opciones={OPCIONES_RITMO}
            seleccionadas={respuestas.ritmo ? [respuestas.ritmo] : []}
            alElegir={(v: Ritmo) => responder("ritmo", v)}
          />
        </Pregunta>
      )}

      {paso === 6 && (
        <Pregunta refTitulo={titulo} titulo="¿Tenés alguna región en mente?">
          <Tarjetas
            opciones={OPCIONES_REGION}
            seleccionadas={respuestas.region ? [respuestas.region] : []}
            alElegir={(v: Region | "sorprendeme") => responder("region", v)}
          />
        </Pregunta>
      )}

      {paso === 7 && (
        <Pregunta
          refTitulo={titulo}
          titulo="¿Necesitás que incluya el vuelo desde Asunción?"
          ayuda="Algunos de nuestros viajes son terrestres y por eso salen bastante menos."
        >
          <Lista
            opciones={[
              {
                valor: "si",
                etiqueta: "Sí, que incluya el vuelo",
                detalle: "Prefiero que esté todo cerrado",
              },
              {
                valor: "no",
                etiqueta: "No hace falta",
                detalle: "Me da igual, o el vuelo lo veo por mi cuenta",
              },
            ]}
            seleccionado={
              respuestas.necesitaVuelo === null
                ? null
                : respuestas.necesitaVuelo
                  ? "si"
                  : "no"
            }
            alElegir={(valor) => responder("necesitaVuelo", valor === "si")}
          />
        </Pregunta>
      )}

      {/* Navegación */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <Boton
          type="button"
          variante="fantasma"
          onClick={() => setPaso((p) => Math.max(0, p - 1))}
          disabled={paso === 0}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Boton>

        <div className="flex items-center gap-2">
          {paso !== 0 && (
            <button
              type="button"
              onClick={() => setPaso((p) => p + 1)}
              className="rounded-full px-4 py-2 text-sm text-tinta-500 underline-offset-4 hover:text-palma-800 hover:underline"
            >
              Saltear
            </button>
          )}
          <Boton
            type="button"
            onClick={() => setPaso((p) => p + 1)}
            disabled={paso === 0 && respuestas.tipoViaje.length === 0}
          >
            {paso === TOTAL_PASOS - 1 ? "Ver mis viajes" : "Siguiente"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Boton>
        </div>
      </div>

      {paso > 0 && (
        <button
          type="button"
          onClick={() => {
            setRespuestas(RESPUESTAS_VACIAS);
            setPaso(0);
          }}
          className="mx-auto mt-8 flex items-center gap-1.5 text-sm text-tinta-400 underline-offset-4 hover:text-tinta-600 hover:underline"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Empezar de nuevo
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Piezas
   ------------------------------------------------------------------ */

function Pregunta({
  titulo,
  ayuda,
  children,
  refTitulo,
}: {
  titulo: string;
  ayuda?: string;
  children: React.ReactNode;
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div>
      <h2
        ref={refTitulo}
        tabIndex={-1}
        className="font-display text-3xl outline-none md:text-4xl"
      >
        {titulo}
      </h2>
      {ayuda && <p className="mt-3 text-tinta-600">{ayuda}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Tarjetas<T extends string>({
  opciones,
  seleccionadas,
  alElegir,
  multiple,
}: {
  opciones: Opcion<T>[];
  seleccionadas: T[];
  alElegir: (valor: T) => void;
  multiple?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {opciones.map((o) => {
        const activa = seleccionadas.includes(o.valor);
        const Icono = o.icono;
        return (
          <li key={o.valor}>
            <button
              type="button"
              aria-pressed={multiple ? activa : undefined}
              onClick={() => alElegir(o.valor)}
              className={cn(
                "flex h-full w-full flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all duration-150",
                activa
                  ? "bg-palma-800 text-arena-50 ring-2 ring-palma-800 ring-offset-2 ring-offset-arena-50"
                  : "bg-arena-50 text-tinta-800 ring-1 ring-palma-900/10 ring-inset hover:bg-arena-100 hover:ring-palma-900/20",
              )}
            >
              <Icono
                className={cn("size-6", activa ? "text-arena-200" : "text-palma-600")}
                aria-hidden="true"
              />
              <span className="font-medium">{o.etiqueta}</span>
              {o.detalle && (
                <span
                  className={cn(
                    "text-sm",
                    activa ? "text-arena-200/80" : "text-tinta-500",
                  )}
                >
                  {o.detalle}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Lista({
  opciones,
  seleccionado,
  alElegir,
}: {
  opciones: { valor: string; etiqueta: string; detalle?: string }[];
  seleccionado: string | null;
  alElegir: (valor: string) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {opciones.map((o) => {
        const activa = seleccionado === o.valor;
        return (
          <li key={o.valor}>
            <button
              type="button"
              onClick={() => alElegir(o.valor)}
              className={cn(
                "w-full rounded-2xl p-4 text-left transition-colors",
                activa
                  ? "bg-palma-800 text-arena-50"
                  : "bg-arena-50 text-tinta-800 ring-1 ring-palma-900/10 ring-inset hover:bg-arena-100",
              )}
            >
              <span className="block font-medium">{o.etiqueta}</span>
              {o.detalle && (
                <span
                  className={cn(
                    "mt-0.5 block text-sm",
                    activa ? "text-arena-200/80" : "text-tinta-500",
                  )}
                >
                  {o.detalle}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
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
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2.5 font-medium transition-colors",
        activa
          ? "bg-palma-800 text-arena-50"
          : "bg-arena-50 text-tinta-700 ring-1 ring-palma-900/10 ring-inset hover:bg-arena-100",
      )}
    >
      {children}
    </button>
  );
}
