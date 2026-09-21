import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, TriangleAlert } from "lucide-react";
import { getConfig, getPropuesta, propuestaVigente } from "@/lib/data";
import { linkWhatsApp, mensajePropuesta } from "@/lib/whatsapp";
import { fechaLarga } from "@/lib/format";
import { CuerpoViaje } from "@/components/paquete/CuerpoViaje";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";

/* Las propuestas NO se generan de antemano ni se listan en ningún lado:
   se llega solo con el enlace exacto. Tampoco van al sitemap y llevan
   noindex, así no aparecen nunca en Google. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const propuesta = await getPropuesta(slug);

  return {
    title: propuesta
      ? `Propuesta de viaje para ${propuesta.clienteNombre}`
      : "Propuesta no encontrada",
    description: propuesta
      ? `${propuesta.titulo}. Propuesta preparada especialmente para ${propuesta.clienteNombre}.`
      : undefined,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PaginaPropuesta({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [propuesta, config] = await Promise.all([getPropuesta(slug), getConfig()]);
  if (!propuesta) notFound();

  const vigente = propuestaVigente(propuesta);
  const whatsapp = linkWhatsApp(config, mensajePropuesta(propuesta));

  const aviso = vigente ? (
    <div className="bg-palma-800 px-5 py-3 text-center text-sm text-arena-100">
      <span className="inline-flex flex-wrap items-center justify-center gap-2">
        <CalendarClock className="size-4" aria-hidden="true" />
        Propuesta preparada para {propuesta.clienteNombre}. Precios válidos hasta
        el {fechaLarga(propuesta.validaHasta)}.
      </span>
    </div>
  ) : (
    <div className="bg-coral-600 px-5 py-5 text-center text-arena-50">
      <p className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <TriangleAlert className="size-6" aria-hidden="true" />
        <span className="font-display text-xl text-arena-50">
          Esta propuesta venció el {fechaLarga(propuesta.validaHasta)}
        </span>
        <span className="text-sm text-arena-100/90">
          Los precios y la disponibilidad que ves más abajo ya no están
          garantizados. Escribinos y te la actualizamos: en general el viaje se
          puede volver a armar casi igual.
        </span>
      </p>
      <div className="mt-5 flex justify-center">
        <BotonWhatsApp
          href={whatsapp}
          origen="propuesta_vencida"
          paquete={propuesta.titulo}
        >
          Pedir la propuesta actualizada
        </BotonWhatsApp>
      </div>
    </div>
  );

  return (
    <CuerpoViaje
      viaje={propuesta}
      config={config}
      whatsapp={whatsapp}
      avisoArriba={aviso}
      saludo={`Propuesta de viaje para ${propuesta.clienteNombre}`}
    />
  );
}
