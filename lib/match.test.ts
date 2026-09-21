import { describe, expect, it } from "vitest";
import {
  calcularMatch,
  hayBuenMatch,
  mesesDePaquete,
  recomendar,
  RESPUESTAS_VACIAS,
  resumenDeRespuestas,
  UMBRAL_BUEN_MATCH,
  type Respuestas,
} from "@/lib/match";
import { PESOS_MATCH_DEFAULT, type Paquete, type PesosMatch } from "@/lib/schema";

/* ===================================================================
   Tests del algoritmo de coincidencia del cuestionario.
   =================================================================== */

/** Paquete de prueba: playa en el Caribe, 8 días, USD 1.500, con vuelo. */
function paquete(cambios: Partial<Paquete> = {}): Paquete {
  return {
    slug: "prueba",
    titulo: "Paquete de prueba",
    destino: "Punta Cana",
    pais: "República Dominicana",
    region: "caribe",
    estado: "activo",
    tipoViaje: ["playa", "relax"],
    idealPara: ["pareja", "familia"],
    ritmo: "tranquilo",
    duracionDias: 8,
    duracionNoches: 7,
    fechasSalida: ["2027-01-15"],
    salidaGrupal: false,
    coordinadores: [],
    precioDesde: 1500,
    moneda: "USD",
    basePrecio: "por persona en base doble",
    vigenciaPrecio: undefined,
    incluyeVuelo: true,
    incluye: ["Todo"],
    noIncluye: [],
    itinerario: [],
    alojamiento: [],
    highlights: ["Uno", "Dos", "Tres"],
    imagenPortada: { src: "/a.svg", alt: "Una foto" },
    galeria: [],
    documentacion: [],
    basesYCondiciones: "",
    faq: [],
    tags: [],
    destacado: false,
    ultimosLugares: false,
    esEjemplo: true,
    ...cambios,
  };
}

/** Respuestas que le calzan perfecto al paquete de arriba. */
const RESPUESTAS_PERFECTAS: Respuestas = {
  tipoViaje: ["playa"],
  companiaViaje: "pareja",
  presupuesto: { min: 1000, max: 2000 },
  dias: { min: 7, max: 10 },
  mes: 1,
  ritmo: "tranquilo",
  region: "caribe",
  necesitaVuelo: true,
};

describe("calcularMatch", () => {
  it("da 100% cuando todo coincide", () => {
    const { porcentaje } = calcularMatch(paquete(), RESPUESTAS_PERFECTAS);
    expect(porcentaje).toBe(100);
  });

  it("explica por qué coincide, en español", () => {
    const { razones } = calcularMatch(paquete(), RESPUESTAS_PERFECTAS);
    expect(razones).toContain("Entra en tu presupuesto");
    expect(razones).toContain("Sale en enero");
    expect(razones).toContain("Incluye el vuelo desde Asunción");
    expect(razones.some((r) => r.includes("playa"))).toBe(true);
  });

  it("es determinístico: la misma entrada da siempre lo mismo", () => {
    const a = calcularMatch(paquete(), RESPUESTAS_PERFECTAS);
    const b = calcularMatch(paquete(), RESPUESTAS_PERFECTAS);
    expect(a).toEqual(b);
  });

  it("no toma en cuenta las preguntas sin contestar", () => {
    const soloTipo: Respuestas = { ...RESPUESTAS_VACIAS, tipoViaje: ["playa"] };
    expect(calcularMatch(paquete(), soloTipo).porcentaje).toBe(100);
  });

  it("da 0% si no se contestó ninguna pregunta", () => {
    expect(calcularMatch(paquete(), RESPUESTAS_VACIAS).porcentaje).toBe(0);
  });

  describe("presupuesto", () => {
    it("puntúa lleno cuando el paquete cuesta menos que el tope", () => {
      const barato = paquete({ precioDesde: 800 });
      const { razones } = calcularMatch(barato, RESPUESTAS_PERFECTAS);
      expect(razones).toContain("Entra en tu presupuesto");
    });

    it("castiga fuerte al que se pasa, pero no lo elimina", () => {
      const caro = paquete({ precioDesde: 3000 }); // 50% por encima del tope
      const { porcentaje } = calcularMatch(caro, RESPUESTAS_PERFECTAS);
      expect(porcentaje).toBeGreaterThan(0);
      expect(porcentaje).toBeLessThan(80);
    });

    it("cuanto más caro, peor puntaje", () => {
      const puntajes = [2000, 2400, 3000, 4000].map(
        (precio) =>
          calcularMatch(paquete({ precioDesde: precio }), RESPUESTAS_PERFECTAS)
            .porcentaje,
      );
      for (let i = 1; i < puntajes.length; i++) {
        expect(puntajes[i]!).toBeLessThan(puntajes[i - 1]!);
      }
    });

    it("no menciona el presupuesto entre las razones si se pasa", () => {
      const caro = paquete({ precioDesde: 5000 });
      const { razones } = calcularMatch(caro, RESPUESTAS_PERFECTAS);
      expect(razones).not.toContain("Entra en tu presupuesto");
    });
  });

  describe("duración", () => {
    it("puntúa lleno dentro del rango", () => {
      const p = calcularMatch(paquete({ duracionDias: 7 }), RESPUESTAS_PERFECTAS);
      expect(p.porcentaje).toBe(100);
    });

    it("baja de a poco a medida que se aleja del rango", () => {
      const cerca = calcularMatch(
        paquete({ duracionDias: 12 }),
        RESPUESTAS_PERFECTAS,
      ).porcentaje;
      const lejos = calcularMatch(
        paquete({ duracionDias: 25 }),
        RESPUESTAS_PERFECTAS,
      ).porcentaje;
      expect(lejos).toBeLessThan(cerca);
      expect(cerca).toBeLessThan(100);
    });
  });

  describe("mes", () => {
    it("reconoce el mes exacto de salida", () => {
      const { razones } = calcularMatch(
        paquete({ fechasSalida: ["2027-07-10"] }),
        { ...RESPUESTAS_PERFECTAS, mes: 7 },
      );
      expect(razones).toContain("Sale en julio");
    });

    it("trata bien a los paquetes de salida flexible", () => {
      const flexible = paquete({ fechasSalida: "flexible" });
      const { porcentaje, razones } = calcularMatch(flexible, {
        ...RESPUESTAS_PERFECTAS,
        mes: 7,
      });
      expect(porcentaje).toBeGreaterThan(90);
      expect(razones.some((r) => r.includes("flexible"))).toBe(true);
    });

    it("cuenta la distancia entre meses dando la vuelta al año", () => {
      const enDiciembre = paquete({ fechasSalida: ["2026-12-20"] });
      const enJunio = paquete({ fechasSalida: ["2027-06-20"] });
      const buscaEnero = { ...RESPUESTAS_PERFECTAS, mes: 1 as const };

      expect(calcularMatch(enDiciembre, buscaEnero).porcentaje).toBeGreaterThan(
        calcularMatch(enJunio, buscaEnero).porcentaje,
      );
    });

    it("no penaliza nada si la fecha es flexible para la persona", () => {
      const p = calcularMatch(paquete({ fechasSalida: ["2027-06-20"] }), {
        ...RESPUESTAS_PERFECTAS,
        mes: "flexible",
      });
      expect(p.porcentaje).toBe(100);
    });
  });

  describe("vuelo", () => {
    it("castiga al paquete sin vuelo cuando la persona lo necesita", () => {
      const sinVuelo = paquete({ incluyeVuelo: false });
      expect(calcularMatch(sinVuelo, RESPUESTAS_PERFECTAS).porcentaje).toBeLessThan(
        100,
      );
    });

    it("no lo tiene en cuenta si a la persona le da igual", () => {
      const sinVuelo = paquete({ incluyeVuelo: false });
      const p = calcularMatch(sinVuelo, {
        ...RESPUESTAS_PERFECTAS,
        necesitaVuelo: null,
      });
      expect(p.porcentaje).toBe(100);
    });
  });

  describe("región", () => {
    it("ignora la región cuando eligen «sorprendeme»", () => {
      const otroLado = paquete({ region: "europa" });
      const p = calcularMatch(otroLado, {
        ...RESPUESTAS_PERFECTAS,
        region: "sorprendeme",
      });
      expect(p.porcentaje).toBe(100);
    });
  });

  describe("estado del paquete", () => {
    it("baja el puntaje de los agotados y lo avisa", () => {
      const agotado = paquete({ estado: "agotado" });
      const r = calcularMatch(agotado, RESPUESTAS_PERFECTAS);
      expect(r.porcentaje).toBeLessThan(100);
      expect(r.razones.some((x) => x.includes("agotada"))).toBe(true);
    });

    it("baja un poco el de los que están por salir a la venta", () => {
      const proximo = calcularMatch(
        paquete({ estado: "proximamente" }),
        RESPUESTAS_PERFECTAS,
      );
      const agotado = calcularMatch(
        paquete({ estado: "agotado" }),
        RESPUESTAS_PERFECTAS,
      );
      expect(proximo.porcentaje).toBeGreaterThan(agotado.porcentaje);
      expect(proximo.porcentaje).toBeLessThan(100);
    });
  });

  describe("pesos configurables", () => {
    it("respeta los pesos que se cargan desde el panel", () => {
      const soloPresupuesto: PesosMatch = {
        ...PESOS_MATCH_DEFAULT,
        tipoViaje: 0,
        duracion: 0,
        mes: 0,
        companiaViaje: 0,
        ritmo: 0,
        region: 0,
        vuelo: 0,
        presupuesto: 100,
      };

      /* Un paquete que no coincide en NADA salvo el precio */
      const raro = paquete({
        tipoViaje: ["nieve"],
        idealPara: ["solo"],
        ritmo: "intenso",
        region: "europa",
        duracionDias: 30,
        fechasSalida: ["2027-08-01"],
        precioDesde: 900,
      });

      expect(calcularMatch(raro, RESPUESTAS_PERFECTAS, soloPresupuesto).porcentaje)
        .toBe(100);
      expect(
        calcularMatch(raro, RESPUESTAS_PERFECTAS).porcentaje,
      ).toBeLessThan(50);
    });

    it("da 0% si todos los pesos están en cero", () => {
      const enCero = Object.fromEntries(
        Object.keys(PESOS_MATCH_DEFAULT).map((k) => [k, 0]),
      ) as PesosMatch;
      expect(calcularMatch(paquete(), RESPUESTAS_PERFECTAS, enCero).porcentaje).toBe(0);
    });
  });

  it("nunca se va de 0 a 100", () => {
    const casos = [
      paquete({ precioDesde: 100000 }),
      paquete({ duracionDias: 120 }),
      paquete({ estado: "agotado", precioDesde: 99999 }),
      paquete(),
    ];
    for (const p of casos) {
      const { porcentaje } = calcularMatch(p, RESPUESTAS_PERFECTAS);
      expect(porcentaje).toBeGreaterThanOrEqual(0);
      expect(porcentaje).toBeLessThanOrEqual(100);
    }
  });
});

describe("recomendar", () => {
  const catalogo = [
    paquete({ slug: "caribe", precioDesde: 1500 }),
    paquete({
      slug: "europa",
      region: "europa",
      tipoViaje: ["cultura"],
      ritmo: "intenso",
      duracionDias: 14,
      precioDesde: 3500,
      idealPara: ["amigos"],
      fechasSalida: ["2027-09-01"],
    }),
    paquete({
      slug: "paraguay",
      region: "paraguay",
      tipoViaje: ["cultura", "naturaleza"],
      duracionDias: 3,
      precioDesde: 210,
      incluyeVuelo: false,
      fechasSalida: "flexible",
    }),
    paquete({ slug: "escondido", estado: "oculto" }),
  ];

  it("devuelve como máximo la cantidad pedida", () => {
    expect(recomendar(catalogo, RESPUESTAS_PERFECTAS, PESOS_MATCH_DEFAULT, 2))
      .toHaveLength(2);
  });

  it("nunca recomienda un paquete oculto", () => {
    const todos = recomendar(catalogo, RESPUESTAS_PERFECTAS, PESOS_MATCH_DEFAULT, 10);
    expect(todos.map((r) => r.paquete.slug)).not.toContain("escondido");
  });

  it("ordena de mayor a menor coincidencia", () => {
    const todos = recomendar(catalogo, RESPUESTAS_PERFECTAS, PESOS_MATCH_DEFAULT, 10);
    for (let i = 1; i < todos.length; i++) {
      expect(todos[i]!.porcentaje).toBeLessThanOrEqual(todos[i - 1]!.porcentaje);
    }
    expect(todos[0]!.paquete.slug).toBe("caribe");
  });

  it("desempata siempre igual, sin azar", () => {
    const a = recomendar(catalogo, RESPUESTAS_VACIAS, PESOS_MATCH_DEFAULT, 10);
    const b = recomendar([...catalogo].reverse(), RESPUESTAS_VACIAS, PESOS_MATCH_DEFAULT, 10);
    expect(a.map((r) => r.paquete.slug)).toEqual(b.map((r) => r.paquete.slug));
  });

  it("con un catálogo vacío devuelve una lista vacía", () => {
    expect(recomendar([], RESPUESTAS_PERFECTAS)).toEqual([]);
  });
});

describe("hayBuenMatch", () => {
  it("dice que sí cuando alguno llega al umbral", () => {
    const resultados = recomendar([paquete()], RESPUESTAS_PERFECTAS);
    expect(hayBuenMatch(resultados)).toBe(true);
  });

  it("dice que no cuando ninguno se acerca, para ofrecer un viaje a medida", () => {
    /* Alguien que busca nieve en Europa, 21 días, con USD 300 */
    const imposible: Respuestas = {
      tipoViaje: ["nieve"],
      companiaViaje: "solo",
      presupuesto: { min: 0, max: 300 },
      dias: { min: 21, max: 30 },
      mes: 8,
      ritmo: "intenso",
      region: "europa",
      necesitaVuelo: true,
    };
    const resultados = recomendar([paquete()], imposible);
    expect(resultados[0]!.porcentaje).toBeLessThan(UMBRAL_BUEN_MATCH);
    expect(hayBuenMatch(resultados)).toBe(false);
  });
});

describe("mesesDePaquete", () => {
  it("devuelve «todos» si la salida es flexible", () => {
    expect(mesesDePaquete({ fechasSalida: "flexible" })).toBe("todos");
  });

  it("junta los meses sin repetir", () => {
    expect(
      mesesDePaquete({ fechasSalida: ["2027-03-01", "2027-03-20", "2027-09-05"] }),
    ).toEqual([3, 9]);
  });
});

describe("resumenDeRespuestas", () => {
  it("arma el resumen que se manda por WhatsApp", () => {
    const lineas = resumenDeRespuestas(RESPUESTAS_PERFECTAS);
    expect(lineas.join("\n")).toContain("Presupuesto por persona: hasta USD 2.000");
    expect(lineas.join("\n")).toContain("enero");
    expect(lineas.join("\n")).toContain("Caribe");
  });

  it("no inventa nada si no se contestó", () => {
    expect(resumenDeRespuestas(RESPUESTAS_VACIAS)).toEqual([]);
  });
});
