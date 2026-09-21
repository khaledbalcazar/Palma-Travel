import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  MessageCircleMore,
  Quote,
  Sparkles,
} from "lucide-react";
import { SITIO } from "@/config/site";
import { getConfig, getPaquetesDestacados } from "@/lib/data";
import { linkWhatsApp, mensajeAMedida } from "@/lib/whatsapp";
import { agenciaDeViajes } from "@/lib/seo";
import { Foto } from "@/components/ui/Foto";
import { estiloBoton } from "@/components/ui/Boton";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";
import { PaqueteCard } from "@/components/paquete/PaqueteCard";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function Home() {
  const [destacados, config] = await Promise.all([
    getPaquetesDestacados(3),
    getConfig(),
  ]);

  const waAMedida = linkWhatsApp(config, mensajeAMedida());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(agenciaDeViajes(config)),
        }}
      />

      {/* ---------- Portada ---------- */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[32rem] w-full">
          <Foto
            src={config.heroImagen || "/muestra/hero-home.svg"}
            alt="Una costa tropical al atardecer, con el sol bajo sobre el mar"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 velo-foto" />
        </div>

        <div className="contenedor absolute inset-x-0 bottom-0 pb-14 md:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-arena-300 uppercase">
              Agencia de viajes paraguaya
            </p>
            <h1 className="mt-3 font-display text-5xl text-arena-50 md:text-7xl">
              {config.heroTitulo}
            </h1>
            {config.heroSubtitulo && (
              <p className="mt-5 max-w-xl text-lg text-arena-200">
                {config.heroSubtitulo}
              </p>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/paquetes"
                className={estiloBoton({
                  tamano: "lg",
                  className: "bg-arena-50 text-palma-900 hover:bg-arena-200",
                })}
              >
                Ver paquetes
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/encontra-tu-viaje"
                className={estiloBoton({
                  tamano: "lg",
                  className:
                    "bg-coral-500 text-white hover:bg-coral-600 shadow-suave",
                })}
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Encontrá tu viaje ideal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Paquetes destacados ---------- */}
      <section className="contenedor py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl">
              Los viajes del momento
            </h2>
            <p className="mt-3 text-tinta-600">
              Una selección de lo que tenemos armado ahora, con salida desde
              Asunción.
            </p>
          </div>
          <Link
            href="/paquetes"
            className="inline-flex items-center gap-1.5 font-medium text-palma-800 underline-offset-4 hover:underline"
          >
            Ver todos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {destacados.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((p, i) => (
              <li key={p.slug}>
                <PaqueteCard paquete={p} config={config} prioridad={i === 0} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-palma-900/15 px-6 py-14 text-center text-tinta-500">
            Todavía no hay paquetes publicados.
          </p>
        )}
      </section>

      {/* ---------- Viajes a medida ---------- */}
      <section className="bg-palma-800 py-20 text-arena-50 md:py-24">
        <div className="contenedor grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wide text-arena-300 uppercase">
              Viajes a medida
            </p>
            <h2 className="mt-3 font-display text-3xl text-arena-50 md:text-4xl">
              Si no está en la lista, igual lo armamos
            </h2>
            <p className="mt-5 text-arena-200/90">
              La mitad de los viajes que vendemos no son un paquete de catálogo:
              son viajes que alguien nos pidió y armamos desde cero. Vos nos
              contás a dónde querés ir, con quién, cuántos días y cuánto pensás
              gastar, y nosotros nos ocupamos de los vuelos, los hoteles, los
              traslados y las excursiones.
            </p>
            <p className="mt-4 text-arena-200/90">
              No cobramos nada por cotizarte. Si después no viajás con nosotros,
              no pasa nada.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <BotonWhatsApp href={waAMedida} origen="home_a_medida" tamano="lg">
                Contanos qué viaje querés
              </BotonWhatsApp>
              <Link
                href="/encontra-tu-viaje"
                className={estiloBoton({
                  tamano: "lg",
                  className:
                    "bg-arena-50/12 text-arena-50 hover:bg-arena-50/22",
                })}
              >
                Responder el cuestionario
              </Link>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                titulo: "Luna de miel",
                texto: "Dos semanas entre playa y ciudad, sin apuro.",
              },
              {
                titulo: "Viaje en familia",
                texto: "Con los chicos, con hoteles que tengan pileta y buen desayuno.",
              },
              {
                titulo: "Aniversario",
                texto: "Un fin de semana largo cerca, sin gastar de más.",
              },
              {
                titulo: "Viaje de egresados",
                texto: "Grupo grande, presupuesto ajustado y todo organizado.",
              },
            ].map((item) => (
              <li key={item.titulo} className="rounded-2xl bg-palma-900/40 p-5">
                <p className="font-display text-lg text-arena-50">{item.titulo}</p>
                <p className="mt-1.5 text-sm text-arena-200/80">{item.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Por qué Palma Travel ---------- */}
      <section className="contenedor py-20 md:py-24">
        <h2 className="max-w-2xl font-display text-3xl md:text-4xl">
          Por qué viajar con nosotros
        </h2>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icono: BadgeCheck,
              titulo: "Agencia registrada en SENATUR",
              texto: config.registroSenatur
                ? `Estamos habilitados por la Secretaría Nacional de Turismo con el registro n.º ${config.registroSenatur}. No somos una cuenta de Instagram que vende paquetes.`
                : "Estamos habilitados por la Secretaría Nacional de Turismo. No somos una cuenta de Instagram que vende paquetes.",
            },
            {
              icono: MessageCircleMore,
              titulo: "Te atiende una persona",
              texto:
                "Nada de formularios que nadie contesta. Escribís por WhatsApp y te responde alguien del equipo, con nombre y apellido.",
            },
            {
              icono: HeartHandshake,
              titulo: "Te acompañamos todo el viaje",
              texto:
                "Desde que cotizamos hasta que volvés. Si algo se complica allá, tenés a quién escribirle a cualquier hora.",
            },
          ].map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="rounded-2xl bg-arena-100 p-7">
              <Icono className="size-7 text-palma-600" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl">{titulo}</h3>
              <p className="mt-2 text-[0.95rem] text-tinta-600">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Testimonios ---------- */}
      <section className="contenedor pb-20 md:pb-24">
        <h2 className="font-display text-3xl md:text-4xl">Lo que dicen</h2>
        <p className="mt-2 text-sm text-tinta-500">
          Testimonios de ejemplo. Reemplazalos por comentarios reales de
          clientes antes de publicar el sitio.
        </p>

        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              texto:
                "Nos armaron la luna de miel en dos días y nos resolvieron un cambio de vuelo a último momento. Volveríamos a viajar con ellos sin dudarlo.",
              quien: "Nombre del cliente",
              viaje: "Viaje realizado",
            },
            {
              texto:
                "Fuimos con los chicos y estaba todo pensado: los traslados, el hotel, hasta dónde comer. No tuvimos que preocuparnos por nada.",
              quien: "Nombre del cliente",
              viaje: "Viaje realizado",
            },
            {
              texto:
                "Es la tercera vez que viajo con Palma. Lo que más valoro es que te dicen la verdad, aunque signifique venderte algo más barato.",
              quien: "Nombre del cliente",
              viaje: "Viaje realizado",
            },
          ].map((t, i) => (
            <li key={i} className="rounded-2xl bg-arena-50 p-7 shadow-suave">
              <Quote className="size-6 text-arena-400" aria-hidden="true" />
              <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-tinta-700">
                {t.texto}
              </blockquote>
              <p className="mt-5 text-sm font-medium text-palma-900">{t.quien}</p>
              <p className="text-xs text-tinta-500">{t.viaje}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Cierre ---------- */}
      <section className="contenedor pb-24">
        <div className="rounded-3xl bg-arena-200 px-6 py-14 text-center md:px-12">
          <h2 className="font-display text-3xl md:text-4xl">{SITIO.eslogan}</h2>
          <p className="mx-auto mt-3 max-w-xl text-tinta-600">
            Escribinos y empezamos a armarlo hoy. Sin compromiso y sin costo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BotonWhatsApp href={waAMedida} origen="home_cierre" tamano="lg" />
            <Link
              href="/contacto"
              className={estiloBoton({ variante: "fantasma", tamano: "lg" })}
            >
              Ver todos los datos de contacto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
