/* Junta todas las migraciones en un solo archivo, para pegar de una sola
   vez en el SQL Editor de Supabase. Se regenera con:
     npm run armar-sql                                                    */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CARPETA = join(process.cwd(), "supabase", "migrations");
const SALIDA = join(process.cwd(), "supabase", "setup-completo.sql");

const archivos = readdirSync(CARPETA)
  .filter((a) => a.endsWith(".sql"))
  .sort();

const encabezado = `-- ===================================================================
-- Palma Travel — TODO el SQL de la base de datos, en un solo archivo
-- -------------------------------------------------------------------
-- Este archivo se genera solo: es la suma de supabase/migrations/*.sql
-- No lo edites a mano. Si hay que cambiar algo, agregá una migración
-- nueva en supabase/migrations y corré: npm run armar-sql
--
-- CÓMO USARLO
--   1. Entrá a tu proyecto en supabase.com
--   2. Menú de la izquierda → SQL Editor → New query
--   3. Copiá TODO este archivo, pegalo y apretá Run
--   4. Tiene que decir "Success"
--
-- Se puede correr las veces que haga falta: no borra ni duplica nada.
-- ===================================================================

`;

const cuerpo = archivos
  .map((archivo) => {
    const contenido = readFileSync(join(CARPETA, archivo), "utf8").trim();
    return `-- ▼▼▼ ${archivo} ▼▼▼\n\n${contenido}\n`;
  })
  .join("\n\n");

writeFileSync(SALIDA, encabezado + cuerpo, "utf8");
console.log(
  `supabase/setup-completo.sql armado a partir de ${archivos.length} migraciones: ${archivos.join(", ")}`,
);
