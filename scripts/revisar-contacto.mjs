/* Avisa, antes de cada build, qué datos de contacto siguen sin cargar.
   No rompe el build: solo lo deja escrito en el log para que no se olvide. */
import { readFileSync } from "node:fs";

const CAMPOS = {
  whatsapp: "número de WhatsApp",
  email: "email de contacto",
  direccion: "dirección de la oficina",
  registroSenatur: "número de registro SENATUR",
};

const fuente = readFileSync(new URL("../config/site.ts", import.meta.url), "utf8");
const bloque = fuente.split("export const CONTACTO")[1]?.split("} as const")[0] ?? "";

const faltan = Object.entries(CAMPOS).filter(([campo]) => {
  const m = bloque.match(new RegExp(`${campo}:\\s*"([^"]*)"`));
  return !m || m[1].trim() === "";
});

if (faltan.length) {
  console.log("");
  console.log("  ⚠  Datos de contacto pendientes en config/site.ts:");
  for (const [, etiqueta] of faltan) console.log(`     · ${etiqueta}`);
  console.log("     Mientras estén vacíos, el sitio los oculta en lugar de mostrar un dato inventado.");
  console.log("");
}
