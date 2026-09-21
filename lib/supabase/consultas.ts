import "server-only";
import { unstable_cache } from "next/cache";
import { CONFIG_POR_DEFECTO } from "@/config/site";
import { siteConfigSchema, type SiteConfig } from "@/lib/schema";
import type { PaqueteRegistro, PropuestaRegistro } from "@/lib/schema";
import { clientePublico } from "@/lib/supabase/publico";
import { paqueteDeFila, propuestaDeFila } from "@/lib/supabase/mapeo";
import type { FilaPaquete, FilaPropuesta } from "@/lib/supabase/tipos";

/* ===================================================================
   LECTURAS DEL SITIO PÚBLICO
   Se guardan en caché con etiquetas. Cuando alguien guarda algo en el
   panel, se invalida la etiqueta y el sitio se actualiza en segundos,
   sin necesidad de volver a publicar.
   =================================================================== */

export const ETIQUETA_PAQUETES = "paquetes";
export const ETIQUETA_PROPUESTAS = "propuestas";
export const ETIQUETA_CONFIG = "site-config";

/** Ignora las filas que no pasan la validación en lugar de tirar abajo
 *  toda la página, pero deja el problema anotado en el log del servidor. */
function validarFilas<F, T>(
  filas: F[],
  convertir: (f: F) => T,
  contexto: string,
): T[] {
  const buenas: T[] = [];
  for (const fila of filas) {
    try {
      buenas.push(convertir(fila));
    } catch (error) {
      console.error(
        `[Palma Travel] Una fila de ${contexto} tiene datos inválidos y se omitió:`,
        error,
      );
    }
  }
  return buenas;
}

export const leerPaquetesDeSupabase = unstable_cache(
  async (): Promise<PaqueteRegistro[]> => {
    const { data, error } = await clientePublico()
      .from("paquetes")
      .select("*")
      .order("actualizado_en", { ascending: false });

    if (error) throw new Error(`No se pudieron leer los paquetes: ${error.message}`);
    return validarFilas(data as FilaPaquete[], paqueteDeFila, "paquetes");
  },
  ["paquetes-publicos"],
  { tags: [ETIQUETA_PAQUETES], revalidate: 3600 },
);

/** Una propuesta, buscada por slug exacto. Pasa por una función de la
 *  base que no permite listar: sin el enlace no se llega. */
export const leerPropuestaDeSupabase = unstable_cache(
  async (slug: string): Promise<PropuestaRegistro | null> => {
    const { data, error } = await clientePublico().rpc("propuesta_por_slug", {
      p_slug: slug,
    });

    if (error) throw new Error(`No se pudo leer la propuesta: ${error.message}`);
    const fila = (data as FilaPropuesta[] | null)?.[0];
    if (!fila) return null;

    try {
      return propuestaDeFila(fila);
    } catch (error) {
      console.error(`[Palma Travel] La propuesta "${slug}" tiene datos inválidos:`, error);
      return null;
    }
  },
  ["propuesta-por-slug"],
  { tags: [ETIQUETA_PROPUESTAS], revalidate: 3600 },
);

/** Listado completo de propuestas: solo lo puede leer el equipo logueado,
 *  porque la política de seguridad no expone la tabla al público. */
export async function leerPropuestasDeSupabase(): Promise<PropuestaRegistro[]> {
  const { clienteServidor } = await import("@/lib/supabase/servidor");
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("propuestas")
    .select("*")
    .order("actualizado_en", { ascending: false });

  if (error) throw new Error(`No se pudieron leer las propuestas: ${error.message}`);
  return validarFilas(data as FilaPropuesta[], propuestaDeFila, "propuestas");
}

export const leerConfigDeSupabase = unstable_cache(
  async (): Promise<SiteConfig> => {
    const { data, error } = await clientePublico()
      .from("site_config")
      .select("datos")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[Palma Travel] No se pudo leer la configuración:", error.message);
      return CONFIG_POR_DEFECTO;
    }

    /* Se completan con los valores por defecto los ajustes que todavía
       no se hayan cargado desde el panel. */
    const resultado = siteConfigSchema.safeParse({
      ...CONFIG_POR_DEFECTO,
      ...((data?.datos as Record<string, unknown>) ?? {}),
    });

    if (!resultado.success) {
      console.error(
        "[Palma Travel] La configuración guardada tiene errores, se usan los valores por defecto:",
        resultado.error.issues,
      );
      return CONFIG_POR_DEFECTO;
    }
    return resultado.data;
  },
  ["site-config"],
  { tags: [ETIQUETA_CONFIG], revalidate: 3600 },
);
