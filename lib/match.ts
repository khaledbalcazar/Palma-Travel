import {
  ETIQUETA_IDEAL_PARA,
  ETIQUETA_REGION,
  ETIQUETA_RITMO,
  ETIQUETA_TIPO_VIAJE,
  PESOS_MATCH_DEFAULT,
  RITMOS,
  type IdealPara,
  type Paquete,
  type PesosMatch,
  type Region,
  type Ritmo,
  type TipoViaje,
} from "@/lib/schema";
import { NOMBRE_MES } from "@/lib/format";

/* ===================================================================
   ALGORITMO DE COINCIDENCIA
   Toma las respuestas del cuestionario y le pone un porcentaje a cada
   paquete. Es una función pura: las mismas respuestas dan siempre el
   mismo resultado, sin inteligencia artificial ni azar de por medio.

   Cómo funciona: cada pregunta da un puntaje de 0 a 1 y se multiplica
   por su peso. El porcentaje final es el puntaje obtenido sobre el
   puntaje máximo posible, contando solo las preguntas contestadas.
   Los pesos se configuran desde el panel.
   =================================================================== */

export type Respuestas = {
  /** Qué tipo de experiencia busca (varias opciones). */
  tipoViaje: TipoViaje[];
  /** Con quién viaja. */
  companiaViaje: IdealPara | null;
  /** Presupuesto por persona, en dólares. */
  presupuesto: { min: number; max: number } | null;
  /** Cuántos días tiene. */
  dias: { min: number; max: number } | null;
  /** Mes en el que quiere viajar, o "flexible". */
  mes: number | "flexible" | null;
  /** Ritmo preferido. */
  ritmo: Ritmo | null;
  /** Región, o "sorprendeme" si le da igual. */
  region: Region | "sorprendeme" | null;
  /** Si necesita que el paquete incluya el vuelo desde Asunción. */
  necesitaVuelo: boolean | null;
};

export const RESPUESTAS_VACIAS: Respuestas = {
  tipoViaje: [],
  companiaViaje: null,
  presupuesto: null,
  dias: null,
  mes: null,
  ritmo: null,
  region: null,
  necesitaVuelo: null,
};

export type Coincidencia = {
  paquete: Paquete;
  porcentaje: number;
  razones: string[];
};

/** Debajo de este porcentaje conviene ofrecer un viaje a medida en vez
 *  de insistir con el catálogo. */
export const UMBRAL_BUEN_MATCH = 50;

/* Qué tan rápido cae el puntaje cuando el paquete se pasa del
   presupuesto. Con 4: pasarse un 20% deja el criterio en 0,45; un 50%,
   en 0,13; el doble de caro, prácticamente en cero. */
const CAIDA_POR_EXCESO = 4;

/* Cuánto se castiga a un paquete que no se puede vender hoy. */
const AJUSTE_ESTADO: Record<string, number> = {
  activo: 1,
  proximamente: 0.9,
  agotado: 0.7,
  oculto: 0,
};

type Criterio = {
  peso: number;
  puntaje: number;
  razon?: string;
};

/* ------------------------------------------------------------------
   Un paquete
   ------------------------------------------------------------------ */

export function calcularMatch(
  paquete: Paquete,
  respuestas: Respuestas,
  pesos: PesosMatch = PESOS_MATCH_DEFAULT,
): Coincidencia {
  const criterios: Criterio[] = [];

  /* --- Tipo de experiencia --- */
  if (respuestas.tipoViaje.length > 0) {
    const coinciden = respuestas.tipoViaje.filter((t) =>
      paquete.tipoViaje.includes(t),
    );
    criterios.push({
      peso: pesos.tipoViaje,
      puntaje: coinciden.length / respuestas.tipoViaje.length,
      razon:
        coinciden.length > 0
          ? `Es un viaje de ${listar(coinciden.map((t) => ETIQUETA_TIPO_VIAJE[t].toLowerCase()))}`
          : undefined,
    });
  }

  /* --- Presupuesto ---
     Si el paquete entra, puntaje lleno. Si se pasa, el puntaje cae muy
     rápido pero nunca llega a cero del todo: un viaje un poco más caro
     capaz entra sacando noches o cambiando fechas, y esa conversación
     la queremos tener. Como la caída es suave y no se corta, entre dos
     paquetes fuera de presupuesto siempre gana el menos caro. */
  if (respuestas.presupuesto) {
    const { max } = respuestas.presupuesto;
    let puntaje: number;
    let razon: string | undefined;

    if (paquete.precioDesde <= max) {
      puntaje = 1;
      razon = "Entra en tu presupuesto";
    } else {
      const exceso = (paquete.precioDesde - max) / max;
      puntaje = Math.exp(-exceso * CAIDA_POR_EXCESO);
      razon = undefined;
    }

    criterios.push({ peso: pesos.presupuesto, puntaje, razon });
  }

  /* --- Cantidad de días --- */
  if (respuestas.dias) {
    const { min, max } = respuestas.dias;
    const dias = paquete.duracionDias;
    let puntaje: number;

    if (dias >= min && dias <= max) {
      puntaje = 1;
    } else {
      const distancia = dias < min ? min - dias : dias - max;
      puntaje = Math.max(0, 1 - distancia / 7);
    }

    criterios.push({
      peso: pesos.duracion,
      puntaje,
      razon: puntaje === 1 ? `Dura ${dias} días, como los que tenés` : undefined,
    });
  }

  /* --- Mes --- */
  if (respuestas.mes !== null) {
    if (respuestas.mes === "flexible") {
      criterios.push({ peso: pesos.mes, puntaje: 1 });
    } else {
      const mesBuscado = respuestas.mes;
      const meses = mesesDePaquete(paquete);

      if (meses === "todos") {
        criterios.push({
          peso: pesos.mes,
          puntaje: 0.9,
          razon: "Tiene salida flexible: se arma para la fecha que quieras",
        });
      } else if (meses.includes(mesBuscado)) {
        criterios.push({
          peso: pesos.mes,
          puntaje: 1,
          razon: `Sale en ${NOMBRE_MES(mesBuscado)}`,
        });
      } else {
        const distancia = Math.min(
          ...meses.map((m) => distanciaEntreMeses(m, mesBuscado)),
        );
        criterios.push({
          peso: pesos.mes,
          puntaje: Math.max(0, 1 - distancia / 6),
        });
      }
    }
  }

  /* --- Con quién viaja --- */
  if (respuestas.companiaViaje) {
    const coincide = paquete.idealPara.includes(respuestas.companiaViaje);
    criterios.push({
      peso: pesos.companiaViaje,
      puntaje: coincide ? 1 : 0.15,
      razon: coincide
        ? `Ideal para ${ETIQUETA_IDEAL_PARA[respuestas.companiaViaje].toLowerCase()}`
        : undefined,
    });
  }

  /* --- Ritmo --- */
  if (respuestas.ritmo) {
    const distancia = Math.abs(
      RITMOS.indexOf(paquete.ritmo) - RITMOS.indexOf(respuestas.ritmo),
    );
    const puntaje = distancia === 0 ? 1 : distancia === 1 ? 0.5 : 0;
    criterios.push({
      peso: pesos.ritmo,
      puntaje,
      razon:
        distancia === 0
          ? `Es de ritmo ${ETIQUETA_RITMO[paquete.ritmo].toLowerCase()}`
          : undefined,
    });
  }

  /* --- Región --- */
  if (respuestas.region && respuestas.region !== "sorprendeme") {
    const coincide = paquete.region === respuestas.region;
    criterios.push({
      peso: pesos.region,
      puntaje: coincide ? 1 : 0.2,
      razon: coincide ? `Está en ${ETIQUETA_REGION[respuestas.region]}` : undefined,
    });
  }

  /* --- Vuelo --- */
  if (respuestas.necesitaVuelo === true) {
    criterios.push({
      peso: pesos.vuelo,
      puntaje: paquete.incluyeVuelo ? 1 : 0,
      razon: paquete.incluyeVuelo ? "Incluye el vuelo desde Asunción" : undefined,
    });
  }

  /* --- Total --- */
  const pesoTotal = criterios.reduce((t, c) => t + c.peso, 0);
  const obtenido = criterios.reduce((t, c) => t + c.peso * c.puntaje, 0);

  const base = pesoTotal === 0 ? 0 : (obtenido / pesoTotal) * 100;
  const ajuste = AJUSTE_ESTADO[paquete.estado] ?? 1;
  const porcentaje = Math.round(Math.max(0, Math.min(100, base * ajuste)));

  const razones = criterios
    .filter((c) => c.razon && c.puntaje >= 0.8)
    .map((c) => c.razon!);

  if (paquete.estado === "agotado") {
    razones.push("Ojo: esta salida está agotada, te anotamos en la lista de espera");
  } else if (paquete.estado === "proximamente") {
    razones.push("Todavía no abrimos la venta, pero te avisamos apenas salga");
  }

  return { paquete, porcentaje, razones };
}

/* ------------------------------------------------------------------
   Todos los paquetes
   ------------------------------------------------------------------ */

export function recomendar(
  paquetes: Paquete[],
  respuestas: Respuestas,
  pesos: PesosMatch = PESOS_MATCH_DEFAULT,
  cantidad = 3,
): Coincidencia[] {
  return paquetes
    .filter((p) => p.estado !== "oculto")
    .map((p) => calcularMatch(p, respuestas, pesos))
    .sort(
      (a, b) =>
        b.porcentaje - a.porcentaje ||
        a.paquete.precioDesde - b.paquete.precioDesde ||
        a.paquete.slug.localeCompare(b.paquete.slug),
    )
    .slice(0, cantidad);
}

/** ¿Vale la pena mostrar el catálogo, o conviene ir directo al viaje a
 *  medida? */
export function hayBuenMatch(resultados: Coincidencia[]): boolean {
  return resultados.some((r) => r.porcentaje >= UMBRAL_BUEN_MATCH);
}

/* ------------------------------------------------------------------
   Resumen para el mensaje de WhatsApp
   ------------------------------------------------------------------ */

export function resumenDeRespuestas(respuestas: Respuestas): string[] {
  const lineas: string[] = [];

  if (respuestas.tipoViaje.length)
    lineas.push(
      `Busco: ${listar(respuestas.tipoViaje.map((t) => ETIQUETA_TIPO_VIAJE[t].toLowerCase()))}`,
    );

  if (respuestas.companiaViaje)
    lineas.push(
      `Viajo: ${ETIQUETA_IDEAL_PARA[respuestas.companiaViaje].toLowerCase()}`,
    );

  if (respuestas.presupuesto)
    lineas.push(
      `Presupuesto por persona: hasta USD ${respuestas.presupuesto.max.toLocaleString("es-PY")}`,
    );

  if (respuestas.dias)
    lineas.push(
      respuestas.dias.min === respuestas.dias.max
        ? `Días: ${respuestas.dias.min}`
        : `Días: entre ${respuestas.dias.min} y ${respuestas.dias.max}`,
    );

  if (respuestas.mes !== null)
    lineas.push(
      respuestas.mes === "flexible"
        ? "Fecha: flexible"
        : `Quiero viajar en ${NOMBRE_MES(respuestas.mes)}`,
    );

  if (respuestas.ritmo)
    lineas.push(`Ritmo: ${ETIQUETA_RITMO[respuestas.ritmo].toLowerCase()}`);

  if (respuestas.region)
    lineas.push(
      respuestas.region === "sorprendeme"
        ? "Región: me da igual, sorprendeme"
        : `Región: ${ETIQUETA_REGION[respuestas.region]}`,
    );

  if (respuestas.necesitaVuelo !== null)
    lineas.push(
      respuestas.necesitaVuelo
        ? "Necesito que incluya el vuelo desde Asunción"
        : "No hace falta que incluya vuelo",
    );

  return lineas;
}

/* ------------------------------------------------------------------
   Ayudas
   ------------------------------------------------------------------ */

export function mesesDePaquete(
  paquete: Pick<Paquete, "fechasSalida">,
): number[] | "todos" {
  if (paquete.fechasSalida === "flexible") return "todos";
  const meses = [
    ...new Set(paquete.fechasSalida.map((f) => Number(f.split("-")[1]))),
  ].filter((m) => m >= 1 && m <= 12);
  return meses.length ? meses : "todos";
}

/** Distancia entre dos meses dando la vuelta al año: de diciembre a
 *  enero hay 1 mes, no 11. */
function distanciaEntreMeses(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 12 - d);
}

function listar(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}
