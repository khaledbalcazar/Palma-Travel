import { PESOS_MATCH_DEFAULT, type SiteConfig } from "@/lib/schema";
import { normalizarUrlSitio } from "@/lib/url-sitio";

/* ===================================================================
   DATOS DE CONTACTO Y DE LA MARCA
   -------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar el número de
   WhatsApp, el email, la dirección o las redes sociales.

   Cuando el panel /admin esté conectado a Supabase, los valores que se
   carguen ahí mandan sobre estos. Estos quedan como respaldo (y son los
   que se usan si todavía no hay base de datos).
   =================================================================== */

/* ⚠️ PENDIENTE: completar con los datos reales de la agencia.
   Mientras estén vacíos, el sitio oculta el dato en lugar de mostrar
   un valor inventado, y `npm run build` avisa cuáles faltan.        */
export const CONTACTO = {
  /** Solo números, con código de país, sin +, espacios ni guiones.
   *  Paraguay es 595 y al celular se le saca el 0 inicial.
   *  Ejemplo: el 0981 123 456 se escribe "595981123456". */
  whatsapp: "",
  email: "",
  telefono: "",
  direccion: "",
  ciudad: "Asunción, Paraguay",
  /** Link de Google Maps para el mapa de /contacto. */
  mapsUrl: "",
  /** Número de registro en SENATUR. */
  registroSenatur: "",
} as const;

export const REDES = {
  instagram: "palmatravelsrl",
  facebook: "",
} as const;

/** Campos de contacto que todavía no tienen dato real. */
export const CONTACTO_PENDIENTE = (
  [
    ["whatsapp", "número de WhatsApp"],
    ["email", "email de contacto"],
    ["direccion", "dirección de la oficina"],
    ["registroSenatur", "número de registro SENATUR"],
  ] as const
).filter(([campo]) => !CONTACTO[campo]).map(([, etiqueta]) => etiqueta);

export const SITIO = {
  nombre: "Palma Travel",
  nombreLegal: "Palma Travel S.R.L.",
  eslogan: "Cada viaje, a tu medida",
  descripcion:
    "Agencia de viajes paraguaya registrada en SENATUR. Armamos paquetes y viajes a medida con salidas desde Asunción.",
  /** Dominio de producción, tomado de NEXT_PUBLIC_SITE_URL.
   *  Si viene vacía o mal escrita, se usa la de por defecto y se avisa
   *  en el log, en vez de tirar abajo el build. */
  url: normalizarUrlSitio(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "es_PY",
  idioma: "es-PY",
  zonaHoraria: "America/Asuncion",
} as const;

export const ANALITICA = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
} as const;

/** Valores por defecto del sitio, con la misma forma que la tabla
 *  `site_config` de Supabase. */
export const CONFIG_POR_DEFECTO: SiteConfig = {
  whatsapp: CONTACTO.whatsapp,
  email: CONTACTO.email,
  telefono: CONTACTO.telefono,
  direccion: CONTACTO.direccion,
  ciudad: CONTACTO.ciudad,
  mapsUrl: CONTACTO.mapsUrl,
  instagram: REDES.instagram,
  facebook: REDES.facebook,
  registroSenatur: CONTACTO.registroSenatur,

  heroTitulo: SITIO.eslogan,
  heroSubtitulo:
    "Paquetes armados con tiempo y viajes hechos a tu gusto, siempre con salida desde Asunción y alguien del equipo atrás tuyo de principio a fin.",
  /* Foto de muestra propia. Se reemplaza desde el panel, en
     Configuración del sitio, por una foto real de la agencia o por una
     dirección de Unsplash (ya está habilitado en next.config.ts). */
  heroImagen: "/muestra/hero-home.svg",

  mostrarPrecioEnGuaranies: false,
  tipoCambioUsdGs: 7300,

  pesosMatch: PESOS_MATCH_DEFAULT,
};

export const NAVEGACION = [
  { href: "/paquetes", etiqueta: "Paquetes" },
  { href: "/encontra-tu-viaje", etiqueta: "Encontrá tu viaje" },
  { href: "/contacto", etiqueta: "Contacto" },
] as const;
