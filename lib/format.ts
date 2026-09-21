import type { Moneda, Paquete, SiteConfig } from "@/lib/schema";

/* ===================================================================
   FORMATO — precios, fechas y duraciones en español de Paraguay
   =================================================================== */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

export const NOMBRE_MES = (mes: number) => MESES[mes - 1] ?? "";

export const MESES_OPCIONES = MESES.map((nombre, i) => ({
  valor: i + 1,
  nombre,
  etiqueta: nombre.charAt(0).toUpperCase() + nombre.slice(1),
}));

/** Precio en dólares: 1850 → "USD 1.850" */
export function precioUSD(monto: number): string {
  return `USD ${new Intl.NumberFormat("es-PY", {
    maximumFractionDigits: 0,
  }).format(monto)}`;
}

/** Precio en guaraníes redondeado a la decena de miles: "Gs. 13.500.000" */
export function precioGs(montoUsd: number, tipoCambio: number): string {
  const gs = Math.round((montoUsd * tipoCambio) / 10_000) * 10_000;
  return `Gs. ${new Intl.NumberFormat("es-PY", {
    maximumFractionDigits: 0,
  }).format(gs)}`;
}

/** Devuelve el precio principal y, si está activado en la configuración,
 *  el equivalente en guaraníes. */
export function precioMostrable(
  monto: number,
  moneda: Moneda,
  config: Pick<SiteConfig, "mostrarPrecioEnGuaranies" | "tipoCambioUsdGs">,
): { principal: string; equivalente: string | null } {
  if (moneda === "PYG") {
    return {
      principal: `Gs. ${new Intl.NumberFormat("es-PY", {
        maximumFractionDigits: 0,
      }).format(monto)}`,
      equivalente: null,
    };
  }
  return {
    principal: precioUSD(monto),
    equivalente: config.mostrarPrecioEnGuaranies
      ? precioGs(monto, config.tipoCambioUsdGs)
      : null,
  };
}

/** "2027-04-10" → "10 de abril de 2027" */
export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return `${d} de ${NOMBRE_MES(m)} de ${a}`;
}

/** "2027-04-10" → "10 abr 2027" */
export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return `${d} ${NOMBRE_MES(m).slice(0, 3)} ${a}`;
}

/** Mes de una fecha ISO (1-12). */
export function mesDe(iso: string): number {
  return Number(iso.split("-")[1] ?? 0);
}

/** "8 días / 7 noches" */
export function duracion(dias: number, noches: number): string {
  const d = `${dias} ${dias === 1 ? "día" : "días"}`;
  if (noches <= 0) return d;
  return `${d} / ${noches} ${noches === 1 ? "noche" : "noches"}`;
}

/** Texto corto para la tarjeta del catálogo. */
export function resumenSalidas(paquete: Pick<Paquete, "fechasSalida">): string {
  if (paquete.fechasSalida === "flexible") return "Salida flexible";
  const n = paquete.fechasSalida.length;
  if (n === 1) return `Salida ${fechaCorta(paquete.fechasSalida[0]!)}`;
  return `${n} fechas de salida`;
}

/** Días que faltan para una fecha (negativo si ya pasó). */
export function diasHasta(iso: string, hoy = new Date()): number {
  const objetivo = new Date(`${iso}T23:59:59`).getTime();
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  return Math.ceil((objetivo - base) / 86_400_000);
}

/** Fecha de hoy en formato AAAA-MM-DD, en hora de Paraguay. */
export function hoyISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
  }).format(new Date());
}
