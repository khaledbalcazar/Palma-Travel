/* ===================================================================
   CARGA INICIAL DE DATOS
   Sube a Supabase los 6 paquetes de ejemplo, la propuesta de ejemplo y
   la configuración por defecto del sitio.

   Cómo se usa:
     npm run seed
     npm run seed -- --admin=tu@email.com   (además, convierte a esa
                                             persona en administradora)

   Se puede correr las veces que haga falta: actualiza por slug en vez
   de duplicar.
   =================================================================== */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { CONFIG_POR_DEFECTO } from "../config/site.js";
import {
  leerPaquetesDeArchivos,
  leerPropuestasDeArchivos,
} from "../lib/contenido-archivos.js";
import { paqueteAFila, propuestaAFila } from "../lib/supabase/mapeo.js";

/* ---------- Variables de entorno ---------- */

function cargarEnv() {
  for (const archivo of [".env.local", ".env"]) {
    try {
      const texto = readFileSync(join(process.cwd(), archivo), "utf8");
      for (const linea of texto.split("\n")) {
        const limpia = linea.trim();
        if (!limpia || limpia.startsWith("#")) continue;
        const i = limpia.indexOf("=");
        if (i === -1) continue;
        const clave = limpia.slice(0, i).trim();
        const valor = limpia.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[clave]) process.env[clave] = valor;
      }
    } catch {
      /* el archivo no existe, se sigue */
    }
  }
}

cargarEnv();

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_SERVICIO = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_SUPABASE || !CLAVE_SERVICIO) {
  console.error(`
  No encuentro los datos de conexión a Supabase.

  Creá un archivo .env.local en la raíz del proyecto (podés copiar
  .env.example) y completá al menos:

    NEXT_PUBLIC_SUPABASE_URL=...
    SUPABASE_SERVICE_ROLE_KEY=...

  Las dos se sacan del panel de Supabase, en Project Settings → API.
`);
  process.exit(1);
}

const supabase = createClient(URL_SUPABASE, CLAVE_SERVICIO, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* ---------- Carga ---------- */

async function principal() {
  console.log("Cargando el contenido de ejemplo en Supabase…\n");
  let ok = 0;
  let fallados = 0;

  /* Paquetes */
  const paquetes = leerPaquetesDeArchivos();
  for (const paquete of paquetes) {
    const { error } = await supabase
      .from("paquetes")
      .upsert(
        { ...paqueteAFila(paquete), actualizado_por_nombre: "Carga inicial" },
        { onConflict: "slug" },
      );
    if (error) {
      console.error(`  ✗ ${paquete.slug}: ${error.message}`);
      process.exitCode = 1;
      fallados++;
    } else {
      console.log(`  ✓ paquete ${paquete.slug}`);
      ok++;
    }
  }

  /* Propuestas */
  const propuestas = leerPropuestasDeArchivos();
  for (const propuesta of propuestas) {
    const { error } = await supabase
      .from("propuestas")
      .upsert(
        { ...propuestaAFila(propuesta), actualizado_por_nombre: "Carga inicial" },
        { onConflict: "slug" },
      );
    if (error) {
      console.error(`  ✗ ${propuesta.slug}: ${error.message}`);
      process.exitCode = 1;
      fallados++;
    } else {
      console.log(`  ✓ propuesta ${propuesta.slug}`);
      ok++;
    }
  }

  /* Configuración del sitio: solo si todavía está vacía, para no pisar
     lo que el equipo haya cargado desde el panel. */
  const { data: actual } = await supabase
    .from("site_config")
    .select("datos")
    .eq("id", 1)
    .maybeSingle();

  const vacia =
    !actual?.datos || Object.keys(actual.datos as object).length === 0;

  if (vacia) {
    const { error } = await supabase
      .from("site_config")
      .upsert({ id: 1, datos: CONFIG_POR_DEFECTO });
    if (error) {
      console.error(`  ✗ configuración: ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log("  ✓ configuración del sitio (valores por defecto)");
    }
  } else {
    console.log("  · configuración del sitio: ya estaba cargada, no se toca");
  }

  /* Primer administrador */
  const arg = process.argv.find((a) => a.startsWith("--admin="));
  if (arg) {
    const email = arg.slice("--admin=".length).trim().toLowerCase();
    const { error } = await supabase
      .from("perfiles")
      .update({ rol: "admin", activo: true })
      .eq("email", email);

    if (error) {
      console.error(`\n  ✗ No pude dar permisos de administrador a ${email}: ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log(`\n  ✓ ${email} ahora es administrador`);
      console.log(
        "    (si el email no existe todavía, primero creá el usuario en Supabase → Authentication → Users)",
      );
    }
  }

  if (fallados > 0) {
    console.error(
      `\nTerminó con problemas: ${ok} elementos cargados y ${fallados} con error.`,
    );
    console.error(
      "Revisá que hayas corrido la migración supabase/migrations/0001_init.sql y que las claves de .env.local sean las correctas.\n",
    );
  } else {
    console.log(
      `\nListo: ${paquetes.length} paquetes y ${propuestas.length} propuestas cargados.\n`,
    );
  }
}

principal().catch((error) => {
  console.error("\nFalló la carga inicial:\n", error);
  process.exit(1);
});
