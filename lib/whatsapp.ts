import { SITIO } from "@/config/site";
import type { SiteConfig } from "@/lib/schema";

/* ===================================================================
   WHATSAPP — el canal principal de venta
   Todos los botones del sitio arman el link desde acá, con un mensaje
   ya escrito para que el cliente solo tenga que apretar enviar.
   =================================================================== */

/** Arma el link de WhatsApp. Devuelve null si todavía no se cargó el
 *  número en la configuración: así el sitio esconde el botón en vez de
 *  mandar a una conversación vacía. */
export function linkWhatsApp(
  config: Pick<SiteConfig, "whatsapp">,
  mensaje: string,
): string | null {
  const numero = config.whatsapp.replace(/\D/g, "");
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

const urlAbsoluta = (ruta: string) =>
  `${SITIO.url.replace(/\/$/, "")}${ruta}`;

/** Consulta general, desde la home o el menú. */
export function mensajeGeneral(): string {
  return `¡Hola Palma Travel! Estuve mirando la página y quiero hacer una consulta.`;
}

/** Consulta por un paquete concreto. Incluye el link para que del otro
 *  lado sepan enseguida de qué viaje se trata. */
export function mensajePaquete(paquete: {
  titulo: string;
  slug: string;
  destino: string;
}): string {
  return [
    `¡Hola Palma Travel! Me interesa el paquete "${paquete.titulo}" (${paquete.destino}).`,
    `¿Me pasás más información?`,
    ``,
    urlAbsoluta(`/paquetes/${paquete.slug}`),
  ].join("\n");
}

/** Consulta sobre una propuesta personalizada. */
export function mensajePropuesta(propuesta: {
  titulo: string;
  slug: string;
  clienteNombre: string;
}): string {
  return [
    `¡Hola Palma Travel! Soy de ${propuesta.clienteNombre} y quiero hablar sobre la propuesta "${propuesta.titulo}".`,
    ``,
    urlAbsoluta(`/propuesta/${propuesta.slug}`),
  ].join("\n");
}

/** Viaje a medida, con el resumen de lo que la persona respondió en el
 *  cuestionario. Así la conversación arranca con todo el contexto. */
export function mensajeAMedida(resumen?: string[]): string {
  const base = `¡Hola Palma Travel! Quiero armar un viaje a medida.`;
  if (!resumen || resumen.length === 0) return base;
  return [base, ``, `Esto es lo que busco:`, ...resumen.map((r) => `· ${r}`)].join(
    "\n",
  );
}
