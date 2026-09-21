import "server-only";
import {
  leerPaquetesDeArchivos,
  leerPropuestasDeArchivos,
} from "@/lib/contenido-archivos";
import type { Paquete, Propuesta } from "@/lib/schema";

/* Respaldo del sitio cuando todavía no hay Supabase configurado. */

let cachePaquetes: Paquete[] | null = null;
let cachePropuestas: Propuesta[] | null = null;

export function paquetesLocales(): Paquete[] {
  cachePaquetes ??= leerPaquetesDeArchivos();
  return cachePaquetes;
}

export function propuestasLocales(): Propuesta[] {
  cachePropuestas ??= leerPropuestasDeArchivos();
  return cachePropuestas;
}
