import type { MetadataRoute } from "next";
import { SITIO } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITIO.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* El panel y las propuestas personalizadas quedan fuera de los
           buscadores. Las propuestas además llevan noindex en la propia
           página, porque robots.txt es público y no queremos ni siquiera
           anunciar que existen. */
        disallow: ["/admin", "/admin/", "/propuesta/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
