import { SITIO } from "@/config/site";
import { esPropuesta, type SiteConfig, type Viaje } from "@/lib/schema";

/* ===================================================================
   DATOS ESTRUCTURADOS (schema.org)
   Lo que leen Google y las redes para entender de qué habla la página.
   =================================================================== */

const absoluta = (ruta: string) => `${SITIO.url.replace(/\/$/, "")}${ruta}`;

export function agenciaDeViajes(config: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITIO.url}#agencia`,
    name: SITIO.nombre,
    legalName: SITIO.nombreLegal,
    slogan: SITIO.eslogan,
    description: SITIO.descripcion,
    url: SITIO.url,
    areaServed: { "@type": "Country", name: "Paraguay" },
    ...(config.email ? { email: config.email } : {}),
    ...(config.whatsapp ? { telephone: `+${config.whatsapp}` } : {}),
    ...(config.direccion
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: config.direccion,
            addressLocality: config.ciudad,
            addressCountry: "PY",
          },
        }
      : {}),
    ...(config.instagram || config.facebook
      ? {
          sameAs: [
            config.instagram && `https://instagram.com/${config.instagram}`,
            config.facebook && `https://facebook.com/${config.facebook}`,
          ].filter(Boolean),
        }
      : {}),
  };
}

export function datosEstructuradosViaje(viaje: Viaje, config: SiteConfig) {
  const ruta = esPropuesta(viaje)
    ? `/propuesta/${viaje.slug}`
    : `/paquetes/${viaje.slug}`;

  const disponibilidad =
    "estado" in viaje && viaje.estado === "agotado"
      ? "https://schema.org/SoldOut"
      : "estado" in viaje && viaje.estado === "proximamente"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: viaje.titulo,
    description: viaje.highlights.join(" "),
    url: absoluta(ruta),
    image: [viaje.imagenPortada, ...viaje.galeria].map((f) =>
      f.src.startsWith("http") ? f.src : absoluta(f.src),
    ),
    touristType: viaje.idealPara,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: viaje.itinerario.length,
      itemListElement: viaje.itinerario.map((dia) => ({
        "@type": "ListItem",
        position: dia.dia,
        name: dia.titulo,
        description: dia.descripcion,
      })),
    },
    provider: agenciaDeViajes(config),
    offers: {
      "@type": "Offer",
      price: viaje.precioDesde,
      priceCurrency: viaje.moneda,
      availability: disponibilidad,
      url: absoluta(ruta),
      ...(viaje.vigenciaPrecio ? { priceValidUntil: viaje.vigenciaPrecio } : {}),
      seller: { "@id": `${SITIO.url}#agencia` },
    },
  };
}

export function migasDePan(items: { nombre: string; ruta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nombre,
      item: absoluta(item.ruta),
    })),
  };
}

export function preguntasFrecuentes(faq: { pregunta: string; respuesta: string }[]) {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };
}
