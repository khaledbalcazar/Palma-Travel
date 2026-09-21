import "server-only";
import { cache } from "react";
import { CONFIG_POR_DEFECTO } from "@/config/site";
import { paquetesLocales, propuestasLocales } from "@/lib/contenido-local";
import {
  ESTADOS,
  type Paquete,
  type Propuesta,
  type SiteConfig,
} from "@/lib/schema";

/* ===================================================================
   CAPA DE DATOS
   Todas las páginas del sitio leen por acá. Hoy los datos salen de
   Supabase si está configurado, y si no, de los archivos de ejemplo
   de /content/seed. Cambiar de origen no obliga a tocar ninguna página.
   =================================================================== */

/** Estados que una persona que no está logueada puede ver. */
export const ESTADOS_PUBLICOS = ESTADOS.filter((e) => e !== "oculto");

const hayBase = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

/* ------------------------------------------------------------------
   Paquetes
   ------------------------------------------------------------------ */

/** Todos los paquetes publicados (sin los ocultos), ordenados para el
 *  catálogo: primero los destacados, después por precio. */
export const getPaquetes = cache(async (): Promise<Paquete[]> => {
  const todos = await todosLosPaquetes();
  return todos
    .filter((p) => p.estado !== "oculto")
    .sort(ordenPorDefecto);
});

/** Incluye los ocultos. Solo para el panel. */
export const todosLosPaquetes = cache(async (): Promise<Paquete[]> => {
  if (hayBase()) {
    const { leerPaquetesDeSupabase } = await import("@/lib/supabase/consultas");
    return leerPaquetesDeSupabase();
  }
  return paquetesLocales();
});

export const getPaquete = cache(
  async (slug: string): Promise<Paquete | null> => {
    const todos = await todosLosPaquetes();
    const p = todos.find((x) => x.slug === slug);
    if (!p || p.estado === "oculto") return null;
    return p;
  },
);

export const getPaquetesDestacados = cache(
  async (limite = 3): Promise<Paquete[]> => {
    const todos = await getPaquetes();
    const destacados = todos.filter((p) => p.destacado && p.estado === "activo");
    const resto = todos.filter(
      (p) => !destacados.includes(p) && p.estado === "activo",
    );
    return [...destacados, ...resto].slice(0, limite);
  },
);

/** Paquetes parecidos a uno dado, para el bloque del final de la landing.
 *  Prioriza misma región y tipos de viaje en común. */
export const getPaquetesSimilares = cache(
  async (slug: string, limite = 3): Promise<Paquete[]> => {
    const todos = await getPaquetes();
    const base = todos.find((p) => p.slug === slug);
    if (!base) return todos.slice(0, limite);

    return todos
      .filter((p) => p.slug !== slug && p.estado !== "oculto")
      .map((p) => {
        const tiposEnComun = p.tipoViaje.filter((t) =>
          base.tipoViaje.includes(t),
        ).length;
        const puntaje =
          tiposEnComun * 3 +
          (p.region === base.region ? 4 : 0) +
          (Math.abs(p.duracionDias - base.duracionDias) <= 3 ? 2 : 0) +
          (p.estado === "activo" ? 1 : 0);
        return { p, puntaje };
      })
      .sort((a, b) => b.puntaje - a.puntaje || a.p.precioDesde - b.p.precioDesde)
      .slice(0, limite)
      .map(({ p }) => p);
  },
);

/* ------------------------------------------------------------------
   Propuestas personalizadas
   ------------------------------------------------------------------ */

/** Se busca SIEMPRE por slug exacto: las propuestas no se listan nunca
 *  en el sitio público. */
export const getPropuesta = cache(
  async (slug: string): Promise<Propuesta | null> => {
    if (hayBase()) {
      const { leerPropuestaDeSupabase } = await import("@/lib/supabase/consultas");
      return leerPropuestaDeSupabase(slug);
    }
    return propuestasLocales().find((p) => p.slug === slug) ?? null;
  },
);

/** Solo para el panel. */
export const todasLasPropuestas = cache(async (): Promise<Propuesta[]> => {
  if (hayBase()) {
    const { leerPropuestasDeSupabase } = await import("@/lib/supabase/consultas");
    return leerPropuestasDeSupabase();
  }
  return propuestasLocales();
});

/** ¿La propuesta sigue vigente hoy? */
export function propuestaVigente(
  propuesta: Pick<Propuesta, "validaHasta">,
  hoy = new Date(),
): boolean {
  const limite = new Date(`${propuesta.validaHasta}T23:59:59`);
  return limite.getTime() >= hoy.getTime();
}

/* ------------------------------------------------------------------
   Configuración del sitio
   ------------------------------------------------------------------ */

export const getConfig = cache(async (): Promise<SiteConfig> => {
  if (hayBase()) {
    const { leerConfigDeSupabase } = await import("@/lib/supabase/consultas");
    return leerConfigDeSupabase();
  }
  return CONFIG_POR_DEFECTO;
});

/* ------------------------------------------------------------------
   Orden
   ------------------------------------------------------------------ */

const PRIORIDAD_ESTADO: Record<string, number> = {
  activo: 0,
  proximamente: 1,
  agotado: 2,
  oculto: 3,
};

export function ordenPorDefecto(a: Paquete, b: Paquete): number {
  if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
  const estado = PRIORIDAD_ESTADO[a.estado] - PRIORIDAD_ESTADO[b.estado];
  if (estado !== 0) return estado;
  return a.precioDesde - b.precioDesde;
}

/** Primera fecha de salida futura de un paquete, o null si es flexible
 *  o ya pasaron todas. */
export function proximaSalida(
  paquete: Pick<Paquete, "fechasSalida">,
  hoy = new Date(),
): string | null {
  if (paquete.fechasSalida === "flexible") return null;
  const futuras = paquete.fechasSalida
    .filter((f) => new Date(`${f}T23:59:59`).getTime() >= hoy.getTime())
    .sort();
  return futuras[0] ?? null;
}
