"use client";

import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";
import type { Paquete, SiteConfig } from "@/lib/schema";
import {
  hayBuenMatch,
  recomendar,
  resumenDeRespuestas,
  type Respuestas,
} from "@/lib/match";
import { duracion, precioMostrable, resumenSalidas } from "@/lib/format";
import { linkWhatsApp, mensajeAMedida, mensajePaquete } from "@/lib/whatsapp";
import { Foto } from "@/components/ui/Foto";
import { Boton } from "@/components/ui/Boton";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";
import { InsigniasViaje } from "@/components/paquete/InsigniasViaje";

export function Resultados({
  paquetes,
  respuestas,
  config,
  alEmpezarDeNuevo,
}: {
  paquetes: Paquete[];
  respuestas: Respuestas;
  config: SiteConfig;
  alEmpezarDeNuevo: () => void;
}) {
  const resultados = recomendar(paquetes, respuestas, config.pesosMatch, 3);
  const buenos = hayBuenMatch(resultados);
  const resumen = resumenDeRespuestas(respuestas);
  const waAMedida = linkWhatsApp(config, mensajeAMedida(resumen));

  const tarjetaAMedida = (
    <section className="rounded-3xl bg-palma-800 p-7 text-arena-50 md:p-9">
      <Sparkles className="size-7 text-arena-300" aria-hidden="true" />
      <h2 className="mt-4 font-display text-2xl text-arena-50 md:text-3xl">
        {buenos
          ? "¿No es exactamente lo que buscás?"
          : "Esto pide un viaje hecho a tu medida"}
      </h2>
      <p className="mt-3 max-w-xl text-arena-200/90">
        {buenos
          ? "Armamos viajes a medida todo el tiempo: mismo destino con otras fechas, más noches, otro hotel, o algo completamente distinto. Contanos qué tenés en la cabeza."
          : "Ninguno de nuestros paquetes armados se acerca del todo a lo que buscás, y no te vamos a vender algo que no es. Lo bueno es que esto lo armamos desde cero, a tu gusto."}
      </p>

      {resumen.length > 0 && (
        <div className="mt-6 rounded-2xl bg-palma-900/40 p-5">
          <p className="text-sm font-medium text-arena-200">
            Esto es lo que nos contaste:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-arena-200/80">
            {resumen.map((linea, i) => (
              <li key={i}>· {linea}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-arena-200/60">
            Todo esto ya va escrito en el mensaje, no tenés que repetirlo.
          </p>
        </div>
      )}

      <div className="mt-7">
        <BotonWhatsApp href={waAMedida} origen="cuestionario_a_medida" tamano="lg">
          Armemos mi viaje a medida
        </BotonWhatsApp>
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <header className="text-center">
        <h2 className="font-display text-3xl md:text-4xl">
          {buenos ? "Esto es lo que te recomendamos" : "Mirá, te vamos a ser sinceros"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-tinta-600">
          {buenos
            ? "Ordenados según cuánto se parecen a lo que nos contaste."
            : "Ninguno de los paquetes que tenemos armados hoy da en el clavo con lo que buscás."}
        </p>
      </header>

      {/* Si nada se acerca, el viaje a medida va primero */}
      {!buenos && <div className="mt-10">{tarjetaAMedida}</div>}

      <ul className="mt-10 space-y-5">
        {resultados.map(({ paquete, porcentaje, razones }) => (
          <li key={paquete.slug}>
            <TarjetaResultado
              paquete={paquete}
              porcentaje={porcentaje}
              razones={razones}
              config={config}
            />
          </li>
        ))}
      </ul>

      {buenos && <div className="mt-10">{tarjetaAMedida}</div>}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Boton type="button" variante="secundario" onClick={alEmpezarDeNuevo}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Responder de nuevo
        </Boton>
        <Link
          href="/paquetes"
          className="rounded-full px-4 py-2 text-sm text-tinta-500 underline-offset-4 hover:text-palma-800 hover:underline"
        >
          Ver todos los viajes
        </Link>
      </div>
    </div>
  );
}

function TarjetaResultado({
  paquete,
  porcentaje,
  razones,
  config,
}: {
  paquete: Paquete;
  porcentaje: number;
  razones: string[];
  config: SiteConfig;
}) {
  const precio = precioMostrable(paquete.precioDesde, paquete.moneda, config);
  const wa = linkWhatsApp(config, mensajePaquete(paquete));

  return (
    <article className="overflow-hidden rounded-3xl bg-arena-50 shadow-suave sm:flex">
      <Link
        href={`/paquetes/${paquete.slug}`}
        className="relative block aspect-[4/3] shrink-0 sm:aspect-auto sm:w-64"
      >
        <Foto
          src={paquete.imagenPortada.src}
          alt={paquete.imagenPortada.alt}
          fill
          sizes="(max-width: 640px) 100vw, 256px"
        />
      </Link>

      <div className="flex-1 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Medidor porcentaje={porcentaje} />
          <div className="flex flex-wrap gap-1.5">
            <InsigniasViaje viaje={paquete} />
          </div>
        </div>

        <h3 className="mt-4 font-display text-2xl">
          <Link href={`/paquetes/${paquete.slug}`} className="hover:underline">
            {paquete.titulo}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-tinta-500">
          {paquete.destino} · {duracion(paquete.duracionDias, paquete.duracionNoches)}{" "}
          · {resumenSalidas(paquete)}
        </p>

        {razones.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {razones.map((razon, i) => (
              <li key={i} className="text-[0.95rem] text-tinta-700">
                <span aria-hidden="true" className="mr-1.5 text-palma-600">
                  ✓
                </span>
                {razon}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-tinta-500">Desde</p>
            <p className="font-display text-2xl text-palma-900">{precio.principal}</p>
            <p className="text-xs text-tinta-400">{paquete.basePrecio}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/paquetes/${paquete.slug}`}
              className="inline-flex h-11 items-center rounded-full bg-palma-900/8 px-5 text-[0.95rem] font-medium text-palma-800 transition-colors hover:bg-palma-900/14"
            >
              Ver el viaje
            </Link>
            <BotonWhatsApp
              href={wa}
              origen="cuestionario_resultado"
              paquete={paquete.titulo}
            >
              Consultar
            </BotonWhatsApp>
          </div>
        </div>
      </div>
    </article>
  );
}

/** El porcentaje de coincidencia, como anillo. */
function Medidor({ porcentaje }: { porcentaje: number }) {
  const tono =
    porcentaje >= 75
      ? "text-palma-600"
      : porcentaje >= 50
        ? "text-arena-600"
        : "text-coral-500";

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative size-12">
        <svg viewBox="0 0 36 36" className="size-12 -rotate-90" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            strokeWidth="3.5"
            className="stroke-arena-200"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${(porcentaje / 100) * 97.4} 97.4`}
            className={`stroke-current ${tono}`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-palma-900">
          {porcentaje}
        </span>
      </div>
      <p className="text-sm text-tinta-600">
        <span className="block font-medium text-palma-900">
          {porcentaje}% de coincidencia
        </span>
        <span className="text-xs text-tinta-500">con lo que nos contaste</span>
      </p>
    </div>
  );
}
