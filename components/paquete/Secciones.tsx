import {
  BedDouble,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Footprints,
  Plane,
  Users,
  X,
} from "lucide-react";
import {
  ETIQUETA_IDEAL_PARA,
  ETIQUETA_RITMO,
  type SiteConfig,
  type Viaje,
} from "@/lib/schema";
import {
  duracion,
  fechaLarga,
  precioMostrable,
  resumenSalidas,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/* ===================================================================
   Las secciones de la página de un viaje. Son las mismas para un
   paquete del catálogo y para una propuesta personalizada.
   =================================================================== */

export function Seccion({
  id,
  titulo,
  descripcion,
  children,
  className,
}: {
  id?: string;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <h2 className="font-display text-2xl md:text-3xl">{titulo}</h2>
      {descripcion && (
        <p className="mt-2 max-w-2xl text-tinta-600">{descripcion}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ---------- Resumen en íconos ---------- */

export function ResumenIconos({ viaje }: { viaje: Viaje }) {
  const noches = viaje.alojamiento.reduce((t, a) => t + a.noches, 0);

  const datos = [
    {
      icono: Clock,
      etiqueta: "Duración",
      valor: duracion(viaje.duracionDias, viaje.duracionNoches),
    },
    {
      icono: CalendarDays,
      etiqueta: "Salidas",
      valor: resumenSalidas(viaje),
    },
    {
      icono: viaje.incluyeVuelo ? Plane : Bus,
      etiqueta: "Vuelo",
      valor: viaje.incluyeVuelo ? "Incluido" : "No incluido",
      destacar: !viaje.incluyeVuelo,
    },
    {
      icono: BedDouble,
      etiqueta: "Alojamiento",
      valor:
        viaje.alojamiento.length === 0
          ? "A confirmar"
          : viaje.alojamiento.length === 1
            ? viaje.alojamiento[0]!.categoria
            : `${viaje.alojamiento.length} hoteles · ${noches} noches`,
    },
    {
      icono: Users,
      etiqueta: "Ideal para",
      valor: viaje.idealPara.map((v) => ETIQUETA_IDEAL_PARA[v]).join(", "),
    },
    {
      icono: Footprints,
      etiqueta: "Ritmo",
      valor: ETIQUETA_RITMO[viaje.ritmo],
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-palma-900/10 md:grid-cols-3">
      {datos.map(({ icono: Icono, etiqueta, valor, destacar }) => (
        <div
          key={etiqueta}
          className={cn("bg-arena-50 p-5", destacar && "bg-coral-50")}
        >
          <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-tinta-500 uppercase">
            <Icono
              className={cn("size-4", destacar ? "text-coral-600" : "text-palma-600")}
              aria-hidden="true"
            />
            {etiqueta}
          </dt>
          <dd
            className={cn(
              "mt-1.5 text-[0.95rem] font-medium",
              destacar ? "text-coral-800" : "text-tinta-800",
            )}
          >
            {valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Frases destacadas ---------- */

export function Highlights({ frases }: { frases: string[] }) {
  if (frases.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {frases.map((frase, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-xl bg-palma-50 p-4 text-[0.95rem] text-palma-900"
        >
          <Check className="mt-0.5 size-5 shrink-0 text-palma-600" aria-hidden="true" />
          {frase}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Itinerario ---------- */

export function Itinerario({ dias }: { dias: Viaje["itinerario"] }) {
  if (dias.length === 0) return null;

  return (
    <ol className="space-y-2">
      {dias.map((dia, i) => (
        <li key={`${dia.dia}-${i}`}>
          <details
            open={i === 0}
            data-print="abrir"
            className="group overflow-hidden rounded-xl bg-arena-50 ring-1 ring-inset ring-palma-900/8"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 p-4 transition-colors hover:bg-arena-100">
              <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-palma-800 text-arena-50">
                <span className="text-[0.6rem] leading-none tracking-wide uppercase">
                  Día
                </span>
                <span className="font-display text-lg leading-none">{dia.dia}</span>
              </span>
              <span className="flex-1 font-medium text-palma-900">{dia.titulo}</span>
              <ChevronDown
                className="size-5 shrink-0 text-tinta-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="border-t border-palma-900/8 px-4 py-4 pl-[4.75rem] text-[0.95rem] leading-relaxed text-tinta-600">
              {dia.descripcion}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Incluye / No incluye ---------- */

export function IncluyeNoIncluye({ viaje }: { viaje: Viaje }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-palma-50 p-6">
        <h3 className="flex items-center gap-2 font-display text-xl text-palma-900">
          <Check className="size-5 text-palma-600" aria-hidden="true" />
          Qué incluye
        </h3>
        <ul className="mt-4 space-y-3">
          {viaje.incluye.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[0.95rem] text-tinta-700">
              <Check
                className="mt-1 size-4 shrink-0 text-palma-600"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-arena-100 p-6">
        <h3 className="flex items-center gap-2 font-display text-xl text-palma-900">
          <X className="size-5 text-coral-600" aria-hidden="true" />
          Qué no incluye
        </h3>

        {!viaje.incluyeVuelo && (
          <p className="mt-4 flex gap-2.5 rounded-xl bg-coral-100 p-4 text-[0.95rem] font-medium text-coral-900">
            <Bus className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span>
              Este viaje <strong>no incluye pasaje aéreo</strong>. El traslado
              desde Asunción es por tierra.
            </span>
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {viaje.noIncluye.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[0.95rem] text-tinta-700">
              <X className="mt-1 size-4 shrink-0 text-coral-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Alojamiento ---------- */

export function Alojamientos({ hoteles }: { hoteles: Viaje["alojamiento"] }) {
  if (hoteles.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {hoteles.map((hotel, i) => (
        <li key={i} className="rounded-2xl bg-arena-50 p-5 ring-1 ring-inset ring-palma-900/8">
          <p className="text-xs font-semibold tracking-wide text-tinta-500 uppercase">
            {hotel.ciudad}
          </p>
          <p className="mt-1 font-display text-lg text-palma-900">{hotel.nombre}</p>
          <p className="mt-1 text-sm text-tinta-600">
            {hotel.categoria} · {hotel.noches}{" "}
            {hotel.noches === 1 ? "noche" : "noches"}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Fechas y precio ---------- */

export function FechasYPrecio({
  viaje,
  config,
}: {
  viaje: Viaje;
  config: SiteConfig;
}) {
  const precio = precioMostrable(viaje.precioDesde, viaje.moneda, config);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-palma-800 p-6 text-arena-50">
        <p className="text-sm text-arena-200/80">Precio desde</p>
        <p className="mt-1 font-display text-4xl">{precio.principal}</p>
        {precio.equivalente && (
          <p className="mt-1 text-arena-200/80">≈ {precio.equivalente}</p>
        )}
        <p className="mt-3 text-[0.95rem] text-arena-200/90">{viaje.basePrecio}</p>
        {viaje.vigenciaPrecio && (
          <p className="mt-4 border-t border-arena-100/20 pt-4 text-sm text-arena-200/80">
            Precio vigente hasta el {fechaLarga(viaje.vigenciaPrecio)}. Después de
            esa fecha lo revisamos y te confirmamos el valor actualizado.
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-arena-50 p-6 ring-1 ring-inset ring-palma-900/8">
        <h3 className="font-display text-xl text-palma-900">Fechas de salida</h3>

        {viaje.fechasSalida === "flexible" ? (
          <p className="mt-3 text-[0.95rem] text-tinta-600">
            Salida flexible: lo armamos para la fecha que vos elijas. Escribinos
            con los días que tenés y lo cotizamos.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {viaje.fechasSalida.map((fecha) => (
              <li
                key={fecha}
                className="flex items-center gap-2.5 text-[0.95rem] text-tinta-700"
              >
                <CalendarDays className="size-4 text-palma-600" aria-hidden="true" />
                {fechaLarga(fecha)}
              </li>
            ))}
          </ul>
        )}

        {viaje.salidaGrupal && viaje.coordinadores.length > 0 && (
          <div className="mt-5 border-t border-palma-900/8 pt-5">
            <p className="flex items-center gap-2 text-sm font-medium text-palma-900">
              <Users className="size-4 text-palma-600" aria-hidden="true" />
              Salida grupal acompañada
            </p>
            <p className="mt-1.5 text-[0.95rem] text-tinta-600">
              Viaja con el grupo {listaEnEspanol(viaje.coordinadores)}, desde
              Asunción y hasta la vuelta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Documentación ---------- */

export function Documentacion({ requisitos }: { requisitos: Viaje["documentacion"] }) {
  if (requisitos.length === 0) return null;

  return (
    <ul className="space-y-4">
      {requisitos.map((req, i) => (
        <li key={i} className="flex gap-4">
          <FileText className="mt-0.5 size-5 shrink-0 text-palma-600" aria-hidden="true" />
          <div>
            <p className="font-medium text-palma-900">{req.titulo}</p>
            <p className="mt-0.5 text-[0.95rem] text-tinta-600">{req.detalle}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Bases y condiciones ---------- */

export function BasesYCondiciones({ texto }: { texto: string }) {
  if (!texto.trim()) return null;

  return (
    <details
      data-print="abrir"
      className="group rounded-2xl bg-arena-100 ring-1 ring-inset ring-palma-900/8"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
        <span className="font-display text-xl text-palma-900">
          Bases y condiciones
        </span>
        <ChevronDown
          className="size-5 shrink-0 text-tinta-400 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-palma-900/8 px-5 py-5 text-sm leading-relaxed text-tinta-600">
        {texto.split("\n").filter(Boolean).map((parrafo, i) => (
          <p key={i} className={i > 0 ? "mt-3" : undefined}>
            {parrafo}
          </p>
        ))}
      </div>
    </details>
  );
}

/* ---------- Preguntas frecuentes ---------- */

export function Faq({ preguntas }: { preguntas: Viaje["faq"] }) {
  if (preguntas.length === 0) return null;

  return (
    <ul className="space-y-2">
      {preguntas.map((item, i) => (
        <li key={i}>
          <details
            data-print="abrir"
            className="group rounded-xl bg-arena-50 ring-1 ring-inset ring-palma-900/8"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-medium text-palma-900 transition-colors hover:bg-arena-100">
              {item.pregunta}
              <ChevronDown
                className="size-5 shrink-0 text-tinta-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="border-t border-palma-900/8 px-4 py-4 text-[0.95rem] leading-relaxed text-tinta-600">
              {item.respuesta}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Ayuda ---------- */

function listaEnEspanol(nombres: string[]): string {
  if (nombres.length === 1) return nombres[0]!;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}
