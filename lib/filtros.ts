import type { Paquete, Region, TipoViaje } from "@/lib/schema";
import { mesDe } from "@/lib/format";

/* ===================================================================
   FILTROS DEL CATÁLOGO
   Se guardan en la dirección web (?region=caribe&vuelo=si), así una
   búsqueda se puede compartir por WhatsApp y llega igual del otro lado.
   =================================================================== */

export const ORDENES = ["destacados", "precio-asc", "precio-desc", "salida"] as const;
export type Orden = (typeof ORDENES)[number];

export const ETIQUETA_ORDEN: Record<Orden, string> = {
  destacados: "Destacados primero",
  "precio-asc": "Precio: de menor a mayor",
  "precio-desc": "Precio: de mayor a menor",
  salida: "Próxima salida",
};

export const RANGOS_PRECIO = [
  { valor: "0-500", etiqueta: "Hasta USD 500", min: 0, max: 500 },
  { valor: "500-1200", etiqueta: "USD 500 a 1.200", min: 500, max: 1200 },
  { valor: "1200-2500", etiqueta: "USD 1.200 a 2.500", min: 1200, max: 2500 },
  { valor: "2500-99999", etiqueta: "Más de USD 2.500", min: 2500, max: 99999 },
] as const;

export const RANGOS_DURACION = [
  { valor: "1-4", etiqueta: "Hasta 4 días", min: 1, max: 4 },
  { valor: "5-8", etiqueta: "5 a 8 días", min: 5, max: 8 },
  { valor: "9-14", etiqueta: "9 a 14 días", min: 9, max: 14 },
  { valor: "15-999", etiqueta: "Más de 14 días", min: 15, max: 999 },
] as const;

export type Filtros = {
  region: Region[];
  tipo: TipoViaje[];
  precio: string[];
  duracion: string[];
  mes: number[];
  vuelo: "si" | "no" | null;
  orden: Orden;
};

export const FILTROS_VACIOS: Filtros = {
  region: [],
  tipo: [],
  precio: [],
  duracion: [],
  mes: [],
  vuelo: null,
  orden: "destacados",
};

/* ---------- La dirección web ↔ los filtros ---------- */

export function filtrosDesdeParams(params: URLSearchParams): Filtros {
  const lista = (clave: string) =>
    (params.get(clave) ?? "").split(",").map((v) => v.trim()).filter(Boolean);

  const vuelo = params.get("vuelo");
  const orden = params.get("orden") as Orden | null;

  return {
    region: lista("region") as Region[],
    tipo: lista("tipo") as TipoViaje[],
    precio: lista("precio"),
    duracion: lista("duracion"),
    mes: lista("mes").map(Number).filter((n) => n >= 1 && n <= 12),
    vuelo: vuelo === "si" || vuelo === "no" ? vuelo : null,
    orden: orden && ORDENES.includes(orden) ? orden : "destacados",
  };
}

export function paramsDesdeFiltros(filtros: Filtros): URLSearchParams {
  const params = new URLSearchParams();
  const poner = (clave: string, valores: (string | number)[]) => {
    if (valores.length) params.set(clave, valores.join(","));
  };

  poner("region", filtros.region);
  poner("tipo", filtros.tipo);
  poner("precio", filtros.precio);
  poner("duracion", filtros.duracion);
  poner("mes", filtros.mes);
  if (filtros.vuelo) params.set("vuelo", filtros.vuelo);
  if (filtros.orden !== "destacados") params.set("orden", filtros.orden);

  return params;
}

export function cantidadDeFiltros(filtros: Filtros): number {
  return (
    filtros.region.length +
    filtros.tipo.length +
    filtros.precio.length +
    filtros.duracion.length +
    filtros.mes.length +
    (filtros.vuelo ? 1 : 0)
  );
}

/* ---------- Aplicar ---------- */

const entraEnRango = (
  valor: number,
  seleccionados: string[],
  rangos: readonly { valor: string; min: number; max: number }[],
) => {
  if (seleccionados.length === 0) return true;
  return seleccionados.some((v) => {
    const rango = rangos.find((r) => r.valor === v);
    return rango ? valor >= rango.min && valor <= rango.max : false;
  });
};

/** Los meses en los que sale un paquete. Si es flexible, sale cualquier mes. */
export function mesesDe(paquete: Pick<Paquete, "fechasSalida">): number[] | "todos" {
  if (paquete.fechasSalida === "flexible") return "todos";
  return [...new Set(paquete.fechasSalida.map(mesDe))];
}

export function aplicarFiltros(paquetes: Paquete[], filtros: Filtros): Paquete[] {
  return paquetes.filter((p) => {
    if (filtros.region.length && !filtros.region.includes(p.region)) return false;

    if (
      filtros.tipo.length &&
      !p.tipoViaje.some((t) => filtros.tipo.includes(t))
    )
      return false;

    if (!entraEnRango(p.precioDesde, filtros.precio, RANGOS_PRECIO)) return false;
    if (!entraEnRango(p.duracionDias, filtros.duracion, RANGOS_DURACION))
      return false;

    if (filtros.mes.length) {
      const meses = mesesDe(p);
      if (meses !== "todos" && !meses.some((m) => filtros.mes.includes(m)))
        return false;
    }

    if (filtros.vuelo === "si" && !p.incluyeVuelo) return false;
    if (filtros.vuelo === "no" && p.incluyeVuelo) return false;

    return true;
  });
}

const PRIORIDAD_ESTADO: Record<string, number> = {
  activo: 0,
  proximamente: 1,
  agotado: 2,
  oculto: 3,
};

/** Primera fecha de salida futura, como texto comparable. */
function proximaSalidaOrden(paquete: Paquete, hoy: string): string {
  if (paquete.fechasSalida === "flexible") return "0000-00-00";
  const futura = paquete.fechasSalida.filter((f) => f >= hoy).sort()[0];
  return futura ?? "9999-99-99";
}

export function ordenar(paquetes: Paquete[], orden: Orden, hoy: string): Paquete[] {
  const copia = [...paquetes];

  switch (orden) {
    case "precio-asc":
      return copia.sort((a, b) => a.precioDesde - b.precioDesde);
    case "precio-desc":
      return copia.sort((a, b) => b.precioDesde - a.precioDesde);
    case "salida":
      return copia.sort((a, b) =>
        proximaSalidaOrden(a, hoy).localeCompare(proximaSalidaOrden(b, hoy)),
      );
    default:
      return copia.sort((a, b) => {
        if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
        const estado =
          (PRIORIDAD_ESTADO[a.estado] ?? 9) - (PRIORIDAD_ESTADO[b.estado] ?? 9);
        if (estado !== 0) return estado;
        return a.precioDesde - b.precioDesde;
      });
  }
}
