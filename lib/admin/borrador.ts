import { hoyISO } from "@/lib/format";
import type {
  Alojamiento,
  DiaItinerario,
  Documento,
  Estado,
  Faq,
  IdealPara,
  Imagen,
  Moneda,
  PaqueteRegistro,
  PropuestaRegistro,
  Region,
  Ritmo,
  TipoViaje,
} from "@/lib/schema";

/* ===================================================================
   BORRADOR
   Lo que el formulario del panel tiene en pantalla mientras se edita.
   Es plano y todos los campos existen siempre, así los inputs nunca
   pasan de "no controlado" a "controlado". Al guardar se convierte a
   la forma que espera el schema Zod.
   =================================================================== */

export type Borrador = {
  slug: string;
  titulo: string;
  destino: string;
  pais: string;
  region: Region;
  estado: Estado;
  tipoViaje: TipoViaje[];
  idealPara: IdealPara[];
  ritmo: Ritmo;
  duracionDias: string;
  duracionNoches: string;

  salidaFlexible: boolean;
  fechas: string[];
  salidaGrupal: boolean;
  coordinadores: string[];

  precioDesde: string;
  moneda: Moneda;
  basePrecio: string;
  vigenciaPrecio: string;

  incluyeVuelo: boolean;
  incluye: string[];
  noIncluye: string[];

  itinerario: DiaItinerario[];
  alojamiento: Alojamiento[];
  highlights: string[];

  imagenPortada: Imagen | null;
  galeria: Imagen[];

  documentacion: Documento[];
  basesYCondiciones: string;
  faq: Faq[];

  tags: string[];
  destacado: boolean;
  esEjemplo: boolean;

  /* Solo propuestas */
  clienteNombre: string;
  validaHasta: string;
  notasInternas: string;
};

export function borradorVacio(): Borrador {
  return {
    slug: "",
    titulo: "",
    destino: "",
    pais: "",
    region: "sudamerica",
    estado: "oculto",
    tipoViaje: [],
    idealPara: [],
    ritmo: "moderado",
    duracionDias: "7",
    duracionNoches: "6",

    salidaFlexible: true,
    fechas: [],
    salidaGrupal: false,
    coordinadores: [],

    precioDesde: "",
    moneda: "USD",
    basePrecio: "por persona en base doble",
    vigenciaPrecio: "",

    incluyeVuelo: true,
    incluye: [],
    noIncluye: [],

    itinerario: [],
    alojamiento: [],
    highlights: [],

    imagenPortada: null,
    galeria: [],

    documentacion: [],
    basesYCondiciones: "",
    faq: [],

    tags: [],
    destacado: false,
    esEjemplo: false,

    clienteNombre: "",
    validaHasta: hoyISO(),
    notasInternas: "",
  };
}

export function borradorDesde(
  viaje: PaqueteRegistro | PropuestaRegistro,
): Borrador {
  const esPropuesta = "clienteNombre" in viaje;
  return {
    ...borradorVacio(),
    slug: viaje.slug,
    titulo: viaje.titulo,
    destino: viaje.destino,
    pais: viaje.pais,
    region: viaje.region,
    estado: esPropuesta ? "oculto" : (viaje as PaqueteRegistro).estado,
    tipoViaje: viaje.tipoViaje,
    idealPara: viaje.idealPara,
    ritmo: viaje.ritmo,
    duracionDias: String(viaje.duracionDias),
    duracionNoches: String(viaje.duracionNoches),

    salidaFlexible: viaje.fechasSalida === "flexible",
    fechas: viaje.fechasSalida === "flexible" ? [] : viaje.fechasSalida,
    salidaGrupal: viaje.salidaGrupal,
    coordinadores: viaje.coordinadores,

    precioDesde: String(viaje.precioDesde),
    moneda: viaje.moneda,
    basePrecio: viaje.basePrecio,
    vigenciaPrecio: viaje.vigenciaPrecio ?? "",

    incluyeVuelo: viaje.incluyeVuelo,
    incluye: viaje.incluye,
    noIncluye: viaje.noIncluye,

    itinerario: viaje.itinerario,
    alojamiento: viaje.alojamiento,
    highlights: viaje.highlights,

    imagenPortada: viaje.imagenPortada,
    galeria: viaje.galeria,

    documentacion: viaje.documentacion,
    basesYCondiciones: viaje.basesYCondiciones,
    faq: viaje.faq,

    tags: viaje.tags,
    destacado: esPropuesta ? false : (viaje as PaqueteRegistro).destacado,
    esEjemplo: viaje.esEjemplo,

    clienteNombre: esPropuesta ? (viaje as PropuestaRegistro).clienteNombre : "",
    validaHasta: esPropuesta ? (viaje as PropuestaRegistro).validaHasta : hoyISO(),
    notasInternas: esPropuesta ? (viaje as PropuestaRegistro).notasInternas : "",
  };
}

/** Pasa el borrador a la forma que valida el schema Zod. */
export function aDatosDeViaje(
  b: Borrador,
  modo: "paquete" | "propuesta",
): Record<string, unknown> {
  const comun = {
    slug: b.slug.trim(),
    titulo: b.titulo.trim(),
    destino: b.destino.trim(),
    pais: b.pais.trim(),
    region: b.region,
    tipoViaje: b.tipoViaje,
    idealPara: b.idealPara,
    ritmo: b.ritmo,
    duracionDias: aNumero(b.duracionDias),
    duracionNoches: aNumero(b.duracionNoches),
    fechasSalida: b.salidaFlexible ? "flexible" : b.fechas.filter(Boolean),
    salidaGrupal: b.salidaGrupal,
    coordinadores: limpiar(b.coordinadores),
    precioDesde: aNumero(b.precioDesde),
    moneda: b.moneda,
    basePrecio: b.basePrecio.trim(),
    vigenciaPrecio: b.vigenciaPrecio || undefined,
    incluyeVuelo: b.incluyeVuelo,
    incluye: limpiar(b.incluye),
    noIncluye: limpiar(b.noIncluye),
    itinerario: b.itinerario,
    alojamiento: b.alojamiento,
    highlights: limpiar(b.highlights),
    imagenPortada: b.imagenPortada ?? undefined,
    galeria: b.galeria,
    documentacion: b.documentacion,
    basesYCondiciones: b.basesYCondiciones.trim(),
    faq: b.faq,
    tags: limpiar(b.tags),
    esEjemplo: b.esEjemplo,
  };

  if (modo === "propuesta") {
    return {
      ...comun,
      clienteNombre: b.clienteNombre.trim(),
      validaHasta: b.validaHasta,
      notasInternas: b.notasInternas.trim(),
    };
  }

  return { ...comun, estado: b.estado, destacado: b.destacado };
}

const limpiar = (lista: string[]) => lista.map((t) => t.trim()).filter(Boolean);

/** Los inputs numéricos devuelven texto; si está vacío devolvemos NaN
 *  para que Zod lo marque como campo faltante en lugar de guardar 0. */
const aNumero = (valor: string): number =>
  valor.trim() === "" ? Number.NaN : Number(valor);
