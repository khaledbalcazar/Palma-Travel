import type { MetadataRoute } from "next";
import { SITIO } from "@/config/site";
import { getPaquetes } from "@/lib/data";

/* Mapa del sitio para los buscadores.
   Las propuestas personalizadas NO entran a propósito: son privadas y se
   comparten solo por enlace. El panel tampoco. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITIO.url.replace(/\/$/, "");
  const paquetes = await getPaquetes();

  const fijas: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/paquetes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/encontra-tu-viaje`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contacto`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const deViajes: MetadataRoute.Sitemap = paquetes
    .filter((p) => p.estado !== "oculto")
    .map((p) => ({
      url: `${base}/paquetes/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: p.destacado ? 0.9 : 0.7,
    }));

  return [...fijas, ...deViajes];
}
