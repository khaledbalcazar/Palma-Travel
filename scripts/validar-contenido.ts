/* Revisa que los paquetes y propuestas de /content/seed cumplan el schema.
   Se corre solo:  npx tsx scripts/validar-contenido.ts                    */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import {
  paqueteValidadoSchema,
  propuestaValidadaSchema,
} from "../lib/schema.js";

const RAIZ = join(process.cwd(), "content", "seed");
let errores = 0;
let revisados = 0;

function revisar(carpeta: string, schema: z.ZodType<unknown>) {
  let archivos: string[] = [];
  try {
    archivos = readdirSync(join(RAIZ, carpeta)).filter((a) => a.endsWith(".json"));
  } catch {
    console.log(`(sin carpeta ${carpeta})`);
    return;
  }
  for (const archivo of archivos) {
    revisados++;
    const ruta = join(RAIZ, carpeta, archivo);
    const resultado = schema.safeParse(JSON.parse(readFileSync(ruta, "utf8")));
    if (resultado.success) {
      console.log(`  ✓ ${carpeta}/${archivo}`);
    } else {
      errores++;
      console.log(`  ✗ ${carpeta}/${archivo}`);
      for (const i of resultado.error.issues) {
        console.log(`      · ${i.path.join(".") || "(raíz)"}: ${i.message}`);
      }
    }
  }
}

console.log("Revisando el contenido de ejemplo…\n");
revisar("paquetes", paqueteValidadoSchema);
revisar("propuestas", propuestaValidadaSchema);

console.log(
  `\n${revisados} archivos revisados, ${errores} con errores.`,
);
process.exit(errores > 0 ? 1 : 0);
