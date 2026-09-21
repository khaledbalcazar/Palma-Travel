import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { esPropuesta, type SiteConfig, type Viaje } from "@/lib/schema";
import { duracion, precioMostrable } from "@/lib/format";
import { SITIO } from "@/config/site";
import { Foto } from "@/components/ui/Foto";
import { Insignia } from "@/components/ui/Insignia";
import { InsigniasViaje } from "@/components/paquete/InsigniasViaje";
import { Galeria } from "@/components/paquete/Galeria";
import { BotonCompartir } from "@/components/paquete/BotonCompartir";
import { CtaFijo } from "@/components/paquete/CtaFijo";
import { BotonImprimir } from "@/components/paquete/BotonImprimir";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";
import {
  Alojamientos,
  BasesYCondiciones,
  Documentacion,
  Faq,
  FechasYPrecio,
  Highlights,
  IncluyeNoIncluye,
  Itinerario,
  ResumenIconos,
  Seccion,
} from "@/components/paquete/Secciones";

/* ===================================================================
   LA PÁGINA DE UN VIAJE
   Es lo que antes iba en el PDF. Se usa igual para los paquetes del
   catálogo, para las propuestas personalizadas y para la vista previa
   del panel, así lo que ve el equipo antes de publicar es exactamente
   lo que va a ver el cliente.
   =================================================================== */

export function CuerpoViaje({
  viaje,
  config,
  whatsapp,
  avisoArriba,
  saludo,
  similares,
}: {
  viaje: Viaje;
  config: SiteConfig;
  whatsapp: string | null;
  avisoArriba?: ReactNode;
  saludo?: string;
  similares?: ReactNode;
}) {
  const precio = precioMostrable(viaje.precioDesde, viaje.moneda, config);
  const agotado = "estado" in viaje && viaje.estado === "agotado";
  const fotos = [viaje.imagenPortada, ...viaje.galeria];

  return (
    <>
      {avisoArriba}

      {/* Portada */}
      <header className="relative">
        <div className="relative h-[58vh] min-h-[22rem] w-full md:h-[64vh]">
          <Foto
            src={viaje.imagenPortada.src}
            alt={viaje.imagenPortada.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 velo-foto" />
        </div>

        <div className="contenedor relative -mt-40 pb-8 md:-mt-44">
          <div className="max-w-3xl text-arena-50">
            {saludo && (
              <p className="mb-3 font-display text-lg text-arena-200 italic">
                {saludo}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <InsigniasViaje viaje={viaje} sobreFoto />
              {viaje.esEjemplo && (
                <Insignia tono="oscuro">Viaje de ejemplo</Insignia>
              )}
            </div>

            <h1 className="mt-4 font-display text-4xl text-arena-50 md:text-5xl">
              {viaje.titulo}
            </h1>

            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-arena-200">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                {viaje.destino}, {viaje.pais}
              </span>
              <span aria-hidden="true">·</span>
              <span>{duracion(viaje.duracionDias, viaje.duracionNoches)}</span>
              <span aria-hidden="true">·</span>
              <span>
                Desde <strong className="font-semibold">{precio.principal}</strong>
              </span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3" data-print="ocultar">
              <BotonWhatsApp
                href={whatsapp}
                origen="hero_paquete"
                paquete={viaje.titulo}
                tamano="lg"
              >
                {agotado ? "Anotarme en la lista de espera" : "Consultar por WhatsApp"}
              </BotonWhatsApp>

              <BotonCompartir
                titulo={viaje.titulo}
                texto={`${viaje.destino} · ${duracion(viaje.duracionDias, viaje.duracionNoches)} · desde ${precio.principal}`}
                className="bg-arena-50/15 text-arena-50 hover:bg-arena-50/25"
              />

              <BotonImprimir className="bg-arena-50/15 text-arena-50 hover:bg-arena-50/25" />
            </div>
          </div>
        </div>
      </header>

      <div className="contenedor space-y-16 pb-24 md:space-y-20">
        {/* Resumen en íconos */}
        <ResumenIconos viaje={viaje} />

        {/* Frases destacadas */}
        {viaje.highlights.length > 0 && (
          <Seccion titulo="Lo mejor de este viaje">
            <Highlights frases={viaje.highlights} />
          </Seccion>
        )}

        {/* Galería */}
        {fotos.length > 1 && <Galeria fotos={fotos} />}

        {/* Itinerario */}
        {viaje.itinerario.length > 0 && (
          <Seccion
            titulo="Día por día"
            descripcion="Tocá cada día para ver qué se hace."
          >
            <Itinerario dias={viaje.itinerario} />
          </Seccion>
        )}

        {/* Incluye / no incluye */}
        <Seccion titulo="Qué incluye y qué no">
          <IncluyeNoIncluye viaje={viaje} />
        </Seccion>

        {/* Alojamiento */}
        {viaje.alojamiento.length > 0 && (
          <Seccion titulo="Dónde te vas a alojar">
            <Alojamientos hoteles={viaje.alojamiento} />
          </Seccion>
        )}

        {/* Fechas y precio */}
        <Seccion titulo="Fechas y precio">
          <FechasYPrecio viaje={viaje} config={config} />
        </Seccion>

        {/* Documentación */}
        {viaje.documentacion.length > 0 && (
          <Seccion
            titulo="Qué documentación necesitás"
            descripcion="Revisalo con tiempo: algunos trámites tardan."
          >
            <Documentacion requisitos={viaje.documentacion} />
          </Seccion>
        )}

        {/* Preguntas frecuentes */}
        {viaje.faq.length > 0 && (
          <Seccion titulo="Preguntas frecuentes">
            <Faq preguntas={viaje.faq} />
          </Seccion>
        )}

        {/* Cierre con CTA */}
        <section className="rounded-3xl bg-palma-800 px-6 py-12 text-center text-arena-50 md:px-12 md:py-16">
          <h2 className="font-display text-3xl text-arena-50 md:text-4xl">
            {agotado
              ? "Esta salida está completa"
              : esPropuesta(viaje)
                ? "¿Lo ajustamos?"
                : "¿Te gusta este viaje?"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-arena-200/90">
            {agotado
              ? "Escribinos y te anotamos en la lista de espera. También te avisamos apenas abrimos la próxima fecha."
              : esPropuesta(viaje)
                ? "Si querés cambiar fechas, hoteles o sacar alguna excursión, escribinos y lo acomodamos."
                : "Escribinos por WhatsApp y te contestamos con todo lo que necesites saber. Sin compromiso."}
          </p>
          <div className="mt-8 flex justify-center" data-print="ocultar">
            <BotonWhatsApp
              href={whatsapp}
              origen="cierre_paquete"
              paquete={viaje.titulo}
              tamano="lg"
            >
              {agotado ? "Anotarme en la lista de espera" : "Escribinos por WhatsApp"}
            </BotonWhatsApp>
          </div>
        </section>

        {/* Bases y condiciones */}
        <BasesYCondiciones texto={viaje.basesYCondiciones} />

        {viaje.esEjemplo && (
          <p className="rounded-xl bg-arena-200 px-5 py-4 text-sm text-tinta-600">
            Este es un viaje de ejemplo, cargado para mostrar cómo se ve la
            página. Los precios y las fechas no son una oferta real.
          </p>
        )}

        {/* Viajes parecidos */}
        {similares}
      </div>

      {/* Pie que solo aparece al imprimir */}
      <div data-print="pie" className="contenedor pb-8 text-xs text-tinta-500">
        <p>
          {SITIO.nombreLegal}
          {config.registroSenatur && ` · Registro SENATUR n.º ${config.registroSenatur}`}
          {config.whatsapp && ` · WhatsApp +${config.whatsapp}`}
          {config.email && ` · ${config.email}`}
        </p>
        <p className="mt-1">
          Documento generado desde {SITIO.url}. Los precios y la disponibilidad
          están sujetos a confirmación.
        </p>
      </div>

      <CtaFijo
        href={whatsapp}
        precio={precio.principal}
        base={viaje.basePrecio}
        paquete={viaje.titulo}
        deshabilitado={agotado}
      />
      {/* Espacio para que la barra fija del celular no tape el pie */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
