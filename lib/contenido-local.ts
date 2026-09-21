import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  paqueteValidadoSchema,
  propuestaValidadaSchema,
  type Paquete,
  type Propuesta,
} from "@/lib/schema";

/* ===================================================================
   CONTENIDO LOCAL (respaldo)
   Lee los paquetes y propuestas de ejemplo de /content/seed.
   Se usa cuando todavía no hay Supabase configurado, y es la fuente
   que lee el script de seed para cargar la base por primera vez.
   =================================================================== */

const RAIZ = join(process.cwd(), "content", "seed");

function leerCarpeta<T>(carpeta: string, schema: z.ZodType<T>): T[] {
  const ruta = join(RAIZ, carpeta);
  let archivos: string[];
  try {
    archivos = readdirSync(ruta).filter((a) => a.endsWith(".json"));
  } catch {
    return [];
  }

  return archivos.map((archivo) => {
    const crudo = JSON.parse(readFileSync(join(ruta, archivo), "utf8"));
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

let cachePaquetes: Paquete[] | null = null;
let cachePropuestas: Propuesta[] | null = null;

export function paquetesLocales(): Paquete[] {
  cachePaquetes ??= leerCarpeta("paquetes", paqueteValidadoSchema as z.ZodType<Paquete>);
  return cachePaquetes;
}

export function propuestasLocales(): Propuesta[] {
  cachePropuestas ??= leerCarpeta(
    "propuestas",
    propuestaValidadaSchema as z.ZodType<Propuesta>,
  );
  return cachePropuestas;
}
