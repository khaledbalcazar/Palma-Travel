/* ===================================================================
   LA DIRECCIÓN DEL SITIO
   Sale de la variable de entorno NEXT_PUBLIC_SITE_URL, pero esa variable
   la carga una persona a mano en Vercel, así que puede venir de
   cualquier forma: vacía, sin https://, con una barra al final, con
   espacios de más. Acá se normaliza todo, porque si llega rota el build
   se cae entero.
   =================================================================== */

export const URL_POR_DEFECTO = "https://palmatravel.com.py";

/**
 * Limpia y valida una dirección de sitio.
 * - vacía o solo espacios  → la de por defecto
 * - sin protocolo          → se le agrega https://
 * - con barra al final     → se la saca
 * - irrecuperable          → la de por defecto, avisando en el log
 */
export function normalizarUrlSitio(
  crudo: string | undefined | null,
  porDefecto: string = URL_POR_DEFECTO,
): string {
  const texto = (crudo ?? "").trim();
  if (!texto) return porDefecto;

  /* Alguien que escribe "palma-travel.vercel.app" quiere decir https. */
  const conProtocolo = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;

  try {
    const url = new URL(conProtocolo);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("protocolo no soportado");
    }
    if (!url.hostname.includes(".") && url.hostname !== "localhost") {
      throw new Error("no parece un dominio");
    }
    /* origin ya viene sin barra al final ni querystring. */
    return url.origin;
  } catch {
    if (typeof console !== "undefined") {
      console.warn(
        `[Palma Travel] NEXT_PUBLIC_SITE_URL no es una dirección válida ("${texto}"). ` +
          `Se usa ${porDefecto}. Cargala bien en Vercel, con el formato https://tudominio.com`,
      );
    }
    return porDefecto;
  }
}
