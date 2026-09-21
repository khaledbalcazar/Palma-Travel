import {
  paqueteSchema,
  propuestaSchema,
  type Paquete,
  type PaqueteRegistro,
  type Propuesta,
  type PropuestaRegistro,
} from "@/lib/schema";
import type { FilaPaquete, FilaPropuesta } from "@/lib/supabase/tipos";

/* ===================================================================
   TRADUCCIÓN entre las filas de Postgres (snake_case) y los objetos
   que usa la aplicación (camelCase, validados con Zod).
   Todo lo que sale de la base pasa por acá y se valida: si alguien
   carga algo raro a mano en la base, el sitio no se rompe en silencio.
   =================================================================== */

const comunDeFila = (f: FilaPaquete | FilaPropuesta) => ({
  slug: f.slug,
  titulo: f.titulo,
  destino: f.destino,
  pais: f.pais,
  region: f.region,
  tipoViaje: f.tipo_viaje,
  idealPara: f.ideal_para,
  ritmo: f.ritmo,
  duracionDias: f.duracion_dias,
  duracionNoches: f.duracion_noches,
  fechasSalida: f.fechas_salida,
  salidaGrupal: f.salida_grupal,
  coordinadores: f.coordinadores,
  precioDesde: Number(f.precio_desde),
  moneda: f.moneda,
  basePrecio: f.base_precio,
  vigenciaPrecio: f.vigencia_precio ?? undefined,
  incluyeVuelo: f.incluye_vuelo,
  incluye: f.incluye,
  noIncluye: f.no_incluye,
  itinerario: f.itinerario,
  alojamiento: f.alojamiento,
  highlights: f.highlights,
  imagenPortada: f.imagen_portada,
  galeria: f.galeria,
  documentacion: f.documentacion,
  basesYCondiciones: f.bases_y_condiciones,
  faq: f.faq,
  tags: f.tags,
  esEjemplo: f.es_ejemplo,
});

export function paqueteDeFila(f: FilaPaquete): PaqueteRegistro {
  const paquete = paqueteSchema.parse({
    ...comunDeFila(f),
    estado: f.estado,
    destacado: f.destacado,
    ultimosLugares: f.ultimos_lugares,
  });
  return {
    ...paquete,
    id: f.id,
    creadoEn: f.creado_en,
    actualizadoEn: f.actualizado_en,
    actualizadoPor: f.actualizado_por_nombre || null,
  };
}

export function propuestaDeFila(f: FilaPropuesta): PropuestaRegistro {
  const propuesta = propuestaSchema.parse({
    ...comunDeFila(f),
    clienteNombre: f.cliente_nombre,
    validaHasta: f.valida_hasta,
    notasInternas: f.notas_internas ?? "",
  });
  return {
    ...propuesta,
    id: f.id,
    creadoEn: f.creado_en,
    actualizadoEn: f.actualizado_en,
    actualizadoPor: f.actualizado_por_nombre || null,
  };
}

/* ---------- Del objeto a la fila, para guardar ---------- */

const comunAFila = (v: Paquete | Propuesta) => ({
  slug: v.slug,
  titulo: v.titulo,
  destino: v.destino,
  pais: v.pais,
  region: v.region,
  tipo_viaje: v.tipoViaje,
  ideal_para: v.idealPara,
  ritmo: v.ritmo,
  duracion_dias: v.duracionDias,
  duracion_noches: v.duracionNoches,
  fechas_salida: v.fechasSalida,
  salida_grupal: v.salidaGrupal,
  coordinadores: v.coordinadores,
  precio_desde: v.precioDesde,
  moneda: v.moneda,
  base_precio: v.basePrecio,
  vigencia_precio: v.vigenciaPrecio ?? null,
  incluye_vuelo: v.incluyeVuelo,
  incluye: v.incluye,
  no_incluye: v.noIncluye,
  itinerario: v.itinerario,
  alojamiento: v.alojamiento,
  highlights: v.highlights,
  imagen_portada: v.imagenPortada,
  galeria: v.galeria,
  documentacion: v.documentacion,
  bases_y_condiciones: v.basesYCondiciones,
  faq: v.faq,
  tags: v.tags,
  es_ejemplo: v.esEjemplo,
});

export function paqueteAFila(p: Paquete, quien?: { id: string; nombre: string }) {
  return {
    ...comunAFila(p),
    estado: p.estado,
    destacado: p.destacado,
    ultimos_lugares: p.ultimosLugares,
    ...(quien
      ? { actualizado_por: quien.id, actualizado_por_nombre: quien.nombre }
      : {}),
  };
}

export function propuestaAFila(
  p: Propuesta,
  quien?: { id: string; nombre: string },
) {
  return {
    ...comunAFila(p),
    cliente_nombre: p.clienteNombre,
    valida_hasta: p.validaHasta,
    notas_internas: p.notasInternas,
    ...(quien
      ? { actualizado_por: quien.id, actualizado_por_nombre: quien.nombre }
      : {}),
  };
}
