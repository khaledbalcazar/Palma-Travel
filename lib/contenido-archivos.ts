import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import {
  paqueteValidadoSchema,
  propuestaValidadaSchema,
  type Paquete,
  type Propuesta,
} from "@/lib/schema";

/* Lee y valida los archivos de ejemplo de /content/seed.
   Lo usan la capa de datos (como respaldo) y el script de carga inicial. */

const RAIZ = join(process.cwd(), "content", "seed");

function leerCarpeta<T>(carpeta: string, schema: z.ZodType<T>): T[] {
  let archivos: string[];
  try {
    archivos = readdirSync(join(RAIZ, carpeta)).filter((a) => a.endsWith(".json"));
  } catch {
    return [];
  }

  return archivos.sort().map((archivo) => {
    const crudo = JSON.parse(readFileSync(join(RAIZ, carpeta, archivo), "utf8"));
    const resultado = schema.safeParse(crudo);
    if (!resultado.success) {
      const detalle = resultado.error.issues
        .map((i) => `  · ${i.path.join(".") || "(raíz)"}: ${i.message}`)
        .join("\n");
      throw new Error(
        `El archivo content/seed/${carpeta}/${archivo} tiene errores:\n${detalle}`,
      );
    }
    return resultado.data;
  });
}

export const leerPaquetesDeArchivos = (): Paquete[] =>
  leerCarpeta("paquetes", paqueteValidadoSchema as z.ZodType<Paquete>);

export const leerPropuestasDeArchivos = (): Propuesta[] =>
  leerCarpeta("propuestas", propuestaValidadaSchema as z.ZodType<Propuesta>);
