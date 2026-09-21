/** Forma de las filas tal como vienen de Postgres (nombres en snake_case). */
export type FilaPaquete = {
  id: string;
  slug: string;
  titulo: string;
  destino: string;
  pais: string;
  region: string;
  estado: string;
  tipo_viaje: string[];
  ideal_para: string[];
  ritmo: string;
  duracion_dias: number;
  duracion_noches: number;
  fechas_salida: unknown;
  salida_grupal: boolean;
  coordinadores: string[];
  precio_desde: number | string;
  moneda: string;
  base_precio: string;
  vigencia_precio: string | null;
  incluye_vuelo: boolean;
  incluye: unknown;
  no_incluye: unknown;
  itinerario: unknown;
  alojamiento: unknown;
  highlights: unknown;
  imagen_portada: unknown;
  galeria: unknown;
  documentacion: unknown;
  bases_y_condiciones: string;
  faq: unknown;
  tags: string[];
  destacado: boolean;
  es_ejemplo: boolean;
  creado_en: string;
  actualizado_en: string;
  actualizado_por: string | null;
  actualizado_por_nombre: string;
};

export type FilaPropuesta = Omit<FilaPaquete, "estado" | "destacado"> & {
  cliente_nombre: string;
  valida_hasta: string;
  notas_internas?: string;
};
