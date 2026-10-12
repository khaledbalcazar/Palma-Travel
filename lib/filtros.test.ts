import { describe, expect, it } from "vitest";
import {
  aplicarFiltros,
  cantidadDeFiltros,
  filtrosDesdeParams,
  FILTROS_VACIOS,
  paramsDesdeFiltros,
} from "@/lib/filtros";
import { paqueteSchema } from "@/lib/schema";
import rio from "@/content/seed/paquetes/rio-de-janeiro-verano.json";
import puntaCana from "@/content/seed/paquetes/punta-cana-todo-incluido.json";

const paquetes = [paqueteSchema.parse(rio), paqueteSchema.parse(puntaCana)];

describe("Búsqueda del catálogo", () => {
  it("encuentra destinos sin depender de tildes, mayúsculas u orden de palabras", () => {
    expect(
      aplicarFiltros(paquetes, {
        ...FILTROS_VACIOS,
        busqueda: "  JANEIRO rio ",
      }).map((p) => p.slug),
    ).toEqual([rio.slug]);
    expect(
      aplicarFiltros(paquetes, {
        ...FILTROS_VACIOS,
        busqueda: "republica dominicana",
      }).map((p) => p.slug),
    ).toEqual([puntaCana.slug]);
  });
  it("combina la búsqueda con los filtros existentes", () => {
    expect(
      aplicarFiltros(paquetes, {
        ...FILTROS_VACIOS,
        busqueda: "rio",
        region: ["caribe"],
      }),
    ).toEqual([]);
    expect(
      aplicarFiltros(paquetes, {
        ...FILTROS_VACIOS,
        busqueda: "playa",
        vuelo: "si",
        precio: ["500-1200"],
      }).map((p) => p.slug),
    ).toEqual([rio.slug]);
  });
  it("conserva la búsqueda y los filtros al compartir la URL", () => {
    const filtros = {
      ...FILTROS_VACIOS,
      busqueda: "Río de Janeiro",
      mes: [1, 2],
      precio: ["500-1200"],
    };
    expect(filtrosDesdeParams(paramsDesdeFiltros(filtros))).toEqual(filtros);
    expect(cantidadDeFiltros(filtros)).toBe(4);
  });
  it("ignora espacios vacíos y conserva enlaces anteriores sin búsqueda", () => {
    expect(
      aplicarFiltros(paquetes, { ...FILTROS_VACIOS, busqueda: "   " }),
    ).toEqual(paquetes);
    expect(
      paramsDesdeFiltros({ ...FILTROS_VACIOS, busqueda: "   " }).toString(),
    ).toBe("");
    expect(
      filtrosDesdeParams(new URLSearchParams("region=caribe&tipo=playa"))
        .busqueda,
    ).toBe("");
  });
});
