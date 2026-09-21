import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITIO } from "@/config/site";
import {
  getConfig,
  getPaquete,
  getPaquetes,
  getPaquetesSimilares,
} from "@/lib/data";
import { linkWhatsApp, mensajePaquete } from "@/lib/whatsapp";
import { duracion, precioUSD } from "@/lib/format";
import { CuerpoViaje } from "@/components/paquete/CuerpoViaje";
import { Similares } from "@/components/paquete/Similares";
import { RegistrarVista } from "@/components/paquete/RegistrarVista";
import { datosEstructuradosViaje } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const paquetes = await getPaquetes();
  return paquetes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paquete = await getPaquete(slug);
  if (!paquete) return { title: "Viaje no encontrado" };

  const descripcion = `${paquete.destino}, ${paquete.pais}. ${duracion(
    paquete.duracionDias,
    paquete.duracionNoches,
  )}. Desde ${precioUSD(paquete.precioDesde)} ${paquete.basePrecio}. ${
    paquete.incluyeVuelo ? "Vuelo incluido" : "Sin vuelo"
  }, con salida desde Asunción.`;

  return {
    title: paquete.titulo,
    description: descripcion,
    alternates: { canonical: `/paquetes/${paquete.slug}` },
    openGraph: {
      type: "article",
      title: paquete.titulo,
      description: descripcion,
      url: `/paquetes/${paquete.slug}`,
      siteName: SITIO.nombre,
      locale: SITIO.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: paquete.titulo,
      description: descripcion,
    },
  };
}

export default async function PaginaPaquete({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [paquete, config] = await Promise.all([getPaquete(slug), getConfig()]);
  if (!paquete) notFound();

  const similares = await getPaquetesSimilares(slug);
  const whatsapp = linkWhatsApp(config, mensajePaquete(paquete));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datosEstructuradosViaje(paquete, config)),
        }}
      />
      <RegistrarVista
        paquete={paquete.titulo}
        destino={paquete.destino}
        precio={paquete.precioDesde}
      />
      <CuerpoViaje
        viaje={paquete}
        config={config}
        whatsapp={whatsapp}
        similares={<Similares paquetes={similares} config={config} />}
      />
    </>
  );
}
