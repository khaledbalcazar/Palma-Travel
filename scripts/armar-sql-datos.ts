/* ===================================================================
   Genera supabase/datos-de-ejemplo.sql a partir de los archivos de
   /content/seed, para poder cargar el contenido inicial pegando SQL en
   Supabase, sin necesidad de terminal ni de Node.

   Se regenera con:  npm run armar-sql-datos
   =================================================================== */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_POR_DEFECTO } from "../config/site.js";
import {
  leerPaquetesDeArchivos,
  leerPropuestasDeArchivos,
} from "../lib/contenido-archivos.js";
import { paqueteAFila, propuestaAFila } from "../lib/supabase/mapeo.js";

/* Qué forma tiene cada columna en Postgres */
const COLUMNAS_TEXTO_ARRAY = new Set([
  "tipo_viaje",
  "ideal_para",
  "coordinadores",
  "tags",
]);

const COLUMNAS_JSONB = new Set([
  "fechas_salida",
  "incluye",
  "no_incluye",
  "itinerario",
  "alojamiento",
  "highlights",
  "imagen_portada",
  "galeria",
  "documentacion",
  "faq",
]);

/** Escapa un texto para meterlo entre comillas simples en SQL. */
const comillas = (texto: string) => `'${texto.replace(/'/g, "''")}'`;

function aValorSQL(columna: string, valor: unknown): string {
  if (valor === null || valor === undefined) return "NULL";

  if (COLUMNAS_TEXTO_ARRAY.has(columna)) {
    const lista = (valor as string[]) ?? [];
    if (lista.length === 0) return "'{}'::text[]";
    return `ARRAY[${lista.map((v) => comillas(v)).join(", ")}]::text[]`;
  }

  if (COLUMNAS_JSONB.has(columna)) {
    return `${comillas(JSON.stringify(valor))}::jsonb`;
  }

  if (typeof valor === "boolean") return valor ? "true" : "false";
  if (typeof valor === "number") return String(valor);
  return comillas(String(valor));
}

function armarInsert(tabla: string, fila: Record<string, unknown>): string {
  const columnas = Object.keys(fila);
  const valores = columnas.map((c) => aValorSQL(c, fila[c]));

  /* Al volver a correrlo, actualiza en vez de duplicar. */
  const actualizaciones = columnas
    .filter((c) => c !== "slug")
    .map((c) => `  ${c} = excluded.${c}`)
    .join(",\n");

  return `insert into public.${tabla} (
  ${columnas.join(",\n  ")}
) values (
  ${valores.join(",\n  ")}
)
on conflict (slug) do update set
${actualizaciones},
  actualizado_en = now();`;
}

/* ---------- Armado del archivo ---------- */

const paquetes = leerPaquetesDeArchivos();
const propuestas = leerPropuestasDeArchivos();

const partes: string[] = [];

partes.push(`-- ===================================================================
-- Palma Travel — contenido de ejemplo
-- -------------------------------------------------------------------
-- Carga los ${paquetes.length} paquetes de ejemplo, la propuesta de ejemplo y la
-- configuración inicial del sitio.
--
-- CÓMO USARLO
--   1. Entrá a tu proyecto en supabase.com
--   2. SQL Editor → New query
--   3. Pegá TODO este archivo y apretá Run
--
-- Correlo DESPUÉS de supabase/setup-completo.sql.
-- Se puede correr las veces que haga falta: actualiza en vez de duplicar.
--
-- Este archivo se genera solo desde /content/seed. No lo edites a mano:
-- una vez que el equipo empiece a cargar paquetes desde el panel, este
-- archivo deja de hacer falta.
-- ===================================================================
`);

partes.push(`
-- -------------------------------------------------------------------
-- PAQUETES (${paquetes.length})
-- -------------------------------------------------------------------`);

for (const paquete of paquetes) {
  const fila = {
    ...paqueteAFila(paquete),
    actualizado_por_nombre: "Carga inicial",
  };
  partes.push(`\n-- ${paquete.titulo}\n${armarInsert("paquetes", fila)}`);
}

partes.push(`
-- -------------------------------------------------------------------
-- PROPUESTAS PERSONALIZADAS (${propuestas.length})
-- -------------------------------------------------------------------`);

for (const propuesta of propuestas) {
  const fila = {
    ...propuestaAFila(propuesta),
    actualizado_por_nombre: "Carga inicial",
  };
  partes.push(`\n-- ${propuesta.clienteNombre} — ${propuesta.titulo}\n${armarInsert("propuestas", fila)}`);
}

partes.push(`
-- -------------------------------------------------------------------
-- CONFIGURACIÓN DEL SITIO
-- Solo se carga si todavía está vacía, para no pisar lo que el equipo
-- haya cargado desde el panel.
-- -------------------------------------------------------------------
update public.site_config
   set datos = ${comillas(JSON.stringify(CONFIG_POR_DEFECTO))}::jsonb
 where id = 1
   and (datos is null or datos = '{}'::jsonb);
`);

partes.push(`
-- -------------------------------------------------------------------
-- LISTO
-- -------------------------------------------------------------------
select
  (select count(*) from public.paquetes)   as paquetes_cargados,
  (select count(*) from public.propuestas) as propuestas_cargadas;
`);

const SALIDA = join(process.cwd(), "supabase", "datos-de-ejemplo.sql");
writeFileSync(SALIDA, partes.join("\n") + "\n", "utf8");

console.log(
  `supabase/datos-de-ejemplo.sql armado: ${paquetes.length} paquetes y ${propuestas.length} propuestas.`,
);
