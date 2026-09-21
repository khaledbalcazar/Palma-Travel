import { z } from "zod";

/* ===================================================================
   SCHEMA ÚNICO DE DATOS — Palma Travel
   Este archivo es la fuente de verdad. Lo usan:
     · el sitio público, para validar lo que llega de la base
     · el panel /admin, para validar los formularios
     · el script de seed
   Si agregás un campo acá, aparece en los dos lados.
   =================================================================== */

/* ---------- Listas cerradas (valores guardados en la base) ---------- */

export const REGIONES = [
  "paraguay",
  "sudamerica",
  "caribe",
  "norteamerica",
  "europa",
  "otros",
] as const;

export const ESTADOS = ["activo", "agotado", "proximamente", "oculto"] as const;

export const TIPOS_VIAJE = [
  "playa",
  "cultura",
  "aventura",
  "naturaleza",
  "religioso",
  "compras",
  "nieve",
  "gastronomia",
  "relax",
  "ciudad",
] as const;

export const IDEAL_PARA = [
  "pareja",
  "familia",
  "amigos",
  "solo",
  "grupo",
  "adultos-mayores",
] as const;

export const RITMOS = ["tranquilo", "moderado", "intenso"] as const;

export const MONEDAS = ["USD", "PYG"] as const;

export const ROLES = ["admin", "editor"] as const;

/* ---------- Etiquetas visibles (español, es-PY) ----------
   Separadas del valor guardado: cambiar un texto no rompe la base. */

export const ETIQUETA_REGION: Record<Region, string> = {
  paraguay: "Paraguay",
  sudamerica: "Sudamérica",
  caribe: "Caribe",
  norteamerica: "Norteamérica",
  europa: "Europa",
  otros: "Otros destinos",
};

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  activo: "Activo",
  agotado: "Agotado",
  proximamente: "Próximamente",
  oculto: "Oculto",
};

export const ETIQUETA_TIPO_VIAJE: Record<TipoViaje, string> = {
  playa: "Playa",
  cultura: "Cultura e historia",
  aventura: "Aventura",
  naturaleza: "Naturaleza",
  religioso: "Religioso / peregrinación",
  compras: "Compras",
  nieve: "Nieve",
  gastronomia: "Gastronomía",
  relax: "Relax",
  ciudad: "Ciudad",
};

export const ETIQUETA_IDEAL_PARA: Record<IdealPara, string> = {
  pareja: "Parejas",
  familia: "Familias con niños",
  amigos: "Grupos de amigos",
  solo: "Viajeros solos",
  grupo: "Grupos",
  "adultos-mayores": "Adultos mayores",
};

export const ETIQUETA_RITMO: Record<Ritmo, string> = {
  tranquilo: "Tranquilo",
  moderado: "Moderado",
  intenso: "Intenso",
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  admin: "Administrador",
  editor: "Editor",
};

/* ---------- Ayudas de validación, con mensajes en español ---------- */

const texto = (campo: string, min = 1) =>
  z.string().trim().min(min, `Completá ${campo}.`);

const fechaISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usá el formato día/mes/año válido (AAAA-MM-DD).");

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .min(3, "El enlace (slug) necesita al menos 3 caracteres.")
  .max(80, "El enlace (slug) es demasiado largo.")
  .regex(
    slugRegex,
    "El enlace solo puede tener minúsculas, números y guiones. Ejemplo: rio-de-janeiro-verano",
  );

/* ---------- Bloques reutilizables ---------- */

/** Acepta una dirección web completa (https://...) o una ruta del propio
 *  sitio (/muestra/foto.svg). Así conviven las fotos subidas al panel,
 *  las de Unsplash y las de muestra. */
const direccionDeFoto = z
  .string()
  .trim()
  .min(1, "Completá la dirección de la foto.")
  .refine(
    (v) => v.startsWith("/") || /^https?:\/\/\S+$/.test(v),
    "La foto necesita una dirección web válida (https://...) o una ruta del sitio (/...).",
  );

export const imagenSchema = z.object({
  src: direccionDeFoto,
  alt: texto("el texto alternativo de la foto", 3).max(
    200,
    "El texto alternativo es demasiado largo.",
  ),
});

export const diaItinerarioSchema = z.object({
  dia: z
    .number({ error: "Indicá el número de día." })
    .int("El día tiene que ser un número entero.")
    .min(1, "El primer día es el 1."),
  titulo: texto("el título del día"),
  descripcion: texto("la descripción del día"),
});

export const alojamientoSchema = z.object({
  nombre: texto("el nombre del alojamiento"),
  categoria: texto("la categoría (por ejemplo: 4 estrellas)"),
  noches: z
    .number({ error: "Indicá cuántas noches." })
    .int("Las noches tienen que ser un número entero.")
    .min(1, "Tiene que ser al menos 1 noche."),
  ciudad: texto("la ciudad del alojamiento"),
});

export const faqSchema = z.object({
  pregunta: texto("la pregunta"),
  respuesta: texto("la respuesta"),
});

export const documentoSchema = z.object({
  titulo: texto("el título del requisito"),
  detalle: texto("el detalle del requisito"),
});

/* fechasSalida: o son fechas concretas, o el paquete sale cuando el
   cliente quiera ("flexible"). */
export const fechasSalidaSchema = z.union([
  z.literal("flexible"),
  z.array(fechaISO).min(1, "Agregá al menos una fecha de salida."),
]);

/* ---------- Paquete ---------- */

export const paqueteSchema = z.object({
  slug: slugSchema,
  titulo: texto("el título del paquete", 4).max(120, "El título es demasiado largo."),
  destino: texto("el destino"),
  pais: texto("el país"),
  region: z.enum(REGIONES, { error: "Elegí una región." }),
  estado: z.enum(ESTADOS, { error: "Elegí un estado." }).default("oculto"),

  tipoViaje: z
    .array(z.enum(TIPOS_VIAJE))
    .min(1, "Elegí al menos un tipo de viaje."),
  idealPara: z
    .array(z.enum(IDEAL_PARA))
    .min(1, "Elegí para quién es ideal este viaje."),
  ritmo: z.enum(RITMOS, { error: "Elegí el ritmo del viaje." }),

  duracionDias: z
    .number({ error: "Indicá cuántos días dura." })
    .int("Los días tienen que ser un número entero.")
    .min(1, "El viaje dura al menos 1 día.")
    .max(120, "¿Seguro que dura más de 120 días?"),
  duracionNoches: z
    .number({ error: "Indicá cuántas noches dura." })
    .int("Las noches tienen que ser un número entero.")
    .min(0, "Las noches no pueden ser negativas.")
    .max(120, "¿Seguro que dura más de 120 noches?"),

  fechasSalida: fechasSalidaSchema,
  salidaGrupal: z.boolean().default(false),
  coordinadores: z.array(texto("el nombre del coordinador")).default([]),

  precioDesde: z
    .number({ error: "Indicá el precio desde." })
    .min(0, "El precio no puede ser negativo."),
  moneda: z.enum(MONEDAS).default("USD"),
  basePrecio: texto("la base del precio").default("por persona en base doble"),
  vigenciaPrecio: fechaISO.optional(),

  incluyeVuelo: z.boolean(),
  incluye: z.array(texto("el ítem")).min(1, "Agregá al menos un ítem en «Incluye»."),
  noIncluye: z.array(texto("el ítem")).default([]),

  itinerario: z.array(diaItinerarioSchema).default([]),
  alojamiento: z.array(alojamientoSchema).default([]),

  highlights: z
    .array(texto("el destacado"))
    .min(3, "Escribí al menos 3 frases destacadas.")
    .max(6, "Como máximo 6 frases destacadas."),

  imagenPortada: imagenSchema,
  galeria: z.array(imagenSchema).default([]),

  documentacion: z.array(documentoSchema).default([]),
  basesYCondiciones: z.string().trim().default(""),
  faq: z.array(faqSchema).default([]),

  tags: z.array(z.string().trim().min(1)).default([]),
  destacado: z.boolean().default(false),

  /** Lo marca el equipo cuando quedan pocos cupos. No se calcula solo:
   *  nadie más que la agencia sabe cuántos lugares quedan. */
  ultimosLugares: z.boolean().default(false),

  /* Marca los 6 paquetes de muestra: el sitio los señala como ejemplo. */
  esEjemplo: z.boolean().default(false),
});

/* Coherencia entre campos: se valida aparte para poder reutilizar
   `paqueteSchema` como base de la propuesta sin arrastrar los refinamientos. */
export const reglasDeCoherencia = <T extends z.ZodType>(schema: T) =>
  schema
    .refine(
      (p: any) => p.duracionNoches <= p.duracionDias,
      {
        message: "Las noches no pueden ser más que los días.",
        path: ["duracionNoches"],
      },
    )
    .refine((p: any) => !p.salidaGrupal || p.fechasSalida !== "flexible", {
      message: "Una salida grupal necesita fechas concretas, no puede ser flexible.",
      path: ["fechasSalida"],
    })
    .refine(
      (p: any) =>
        p.itinerario.length === 0 ||
        p.itinerario.every((d: { dia: number }) => d.dia <= p.duracionDias),
      {
        message: "Hay días del itinerario que superan la duración del viaje.",
        path: ["itinerario"],
      },
    );

export const paqueteValidadoSchema = reglasDeCoherencia(paqueteSchema);

/* ---------- Propuesta personalizada ---------- */

export const propuestaSchema = paqueteSchema
  .omit({ estado: true, destacado: true, ultimosLugares: true })
  .extend({
    clienteNombre: texto("el nombre del cliente").max(
      120,
      "El nombre del cliente es demasiado largo.",
    ),
    validaHasta: fechaISO,
    notasInternas: z.string().trim().default(""),
  });

export const propuestaValidadaSchema = reglasDeCoherencia(propuestaSchema);

/* ---------- Metadatos de la base ---------- */

export const metadatosSchema = z.object({
  id: z.string(),
  creadoEn: z.string(),
  actualizadoEn: z.string(),
  actualizadoPor: z.string().nullable().default(null),
});

export const paqueteRegistroSchema = paqueteSchema.extend(metadatosSchema.shape);
export const propuestaRegistroSchema = propuestaSchema.extend(metadatosSchema.shape);

/* ---------- Configuración del sitio ---------- */

export const pesosMatchSchema = z.object({
  tipoViaje: z.number().min(0).max(100),
  presupuesto: z.number().min(0).max(100),
  duracion: z.number().min(0).max(100),
  mes: z.number().min(0).max(100),
  companiaViaje: z.number().min(0).max(100),
  ritmo: z.number().min(0).max(100),
  region: z.number().min(0).max(100),
  vuelo: z.number().min(0).max(100),
});

export const PESOS_MATCH_DEFAULT: PesosMatch = {
  tipoViaje: 30,
  presupuesto: 25,
  duracion: 12,
  mes: 10,
  companiaViaje: 8,
  ritmo: 7,
  region: 5,
  vuelo: 3,
};

export const siteConfigSchema = z.object({
  whatsapp: z
    .string()
    .trim()
    .regex(
      /^$|^\d{8,15}$/,
      "El número de WhatsApp va solo con números, con código de país y sin signos. Ejemplo: 595981123456",
    )
    .default(""),
  email: z.union([z.literal(""), z.email({ message: "Revisá el email." })]).default(""),
  telefono: z.string().trim().default(""),
  direccion: z.string().trim().default(""),
  ciudad: z.string().trim().default("Asunción, Paraguay"),
  mapsUrl: z.string().trim().default(""),
  instagram: z.string().trim().default(""),
  facebook: z.string().trim().default(""),
  registroSenatur: z.string().trim().default(""),

  heroTitulo: z.string().trim().default("Cada viaje, a tu medida"),
  heroSubtitulo: z.string().trim().default(""),
  heroImagen: z.string().trim().default(""),

  mostrarPrecioEnGuaranies: z.boolean().default(false),
  tipoCambioUsdGs: z
    .number()
    .min(1, "El tipo de cambio tiene que ser mayor a 1.")
    .default(7300),

  pesosMatch: pesosMatchSchema.default(PESOS_MATCH_DEFAULT),
});

/* ---------- Usuarios del panel ---------- */

export const perfilSchema = z.object({
  id: z.string(),
  email: z.email(),
  nombre: z.string().trim().default(""),
  rol: z.enum(ROLES).default("editor"),
  activo: z.boolean().default(true),
});

export const invitacionSchema = z.object({
  email: z.email({ message: "Escribí un email válido." }),
  nombre: texto("el nombre"),
  rol: z.enum(ROLES),
});

/* ---------- Tipos exportados ---------- */

export type Region = (typeof REGIONES)[number];
export type Estado = (typeof ESTADOS)[number];
export type TipoViaje = (typeof TIPOS_VIAJE)[number];
export type IdealPara = (typeof IDEAL_PARA)[number];
export type Ritmo = (typeof RITMOS)[number];
export type Moneda = (typeof MONEDAS)[number];
export type Rol = (typeof ROLES)[number];

export type Imagen = z.infer<typeof imagenSchema>;
export type DiaItinerario = z.infer<typeof diaItinerarioSchema>;
export type Alojamiento = z.infer<typeof alojamientoSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type Documento = z.infer<typeof documentoSchema>;
export type FechasSalida = z.infer<typeof fechasSalidaSchema>;

export type Paquete = z.infer<typeof paqueteSchema>;
export type PaqueteEntrada = z.input<typeof paqueteSchema>;
export type PaqueteRegistro = z.infer<typeof paqueteRegistroSchema>;

export type Propuesta = z.infer<typeof propuestaSchema>;
export type PropuestaEntrada = z.input<typeof propuestaSchema>;
export type PropuestaRegistro = z.infer<typeof propuestaRegistroSchema>;

export type PesosMatch = z.infer<typeof pesosMatchSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Perfil = z.infer<typeof perfilSchema>;
export type Invitacion = z.infer<typeof invitacionSchema>;

/* Un «viaje» es lo que las páginas muestran: puede ser un paquete del
   catálogo o una propuesta personalizada. Comparten la misma plantilla. */
export type Viaje = Paquete | Propuesta;

export const esPropuesta = (v: Viaje): v is Propuesta =>
  "clienteNombre" in v && "validaHasta" in v;
