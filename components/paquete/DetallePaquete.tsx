import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { Paquete, SiteConfig } from "@/lib/schema";
import { duracion, fechaLarga, hoyISO, precioMostrable } from "@/lib/format";
import { SITIO } from "@/config/site";
import { InsigniasViaje } from "@/components/paquete/InsigniasViaje";
import { GaleriaPaquete } from "@/components/paquete/GaleriaPaquete";
import { NavegacionViaje } from "@/components/paquete/NavegacionViaje";
import { ConsultaPaquete } from "@/components/paquete/ConsultaPaquete";
import { ItinerarioViaje } from "@/components/paquete/ItinerarioViaje";
import { BotonCompartir } from "@/components/paquete/BotonCompartir";
import { BotonImprimir } from "@/components/paquete/BotonImprimir";
import { AbrirAlImprimir } from "@/components/paquete/AbrirAlImprimir";
import {
  Alojamientos,
  BasesYCondiciones,
  Documentacion,
  Faq,
  FechasYPrecio,
  IncluyeNoIncluye,
  ResumenIconos,
  Seccion,
} from "@/components/paquete/Secciones";

export function DetallePaquete({
  paquete,
  config,
  similares,
}: {
  paquete: Paquete;
  config: SiteConfig;
  similares?: React.ReactNode;
}) {
  const fotos = [paquete.imagenPortada, ...paquete.galeria].filter(
    (foto, i, todas) => todas.findIndex((f) => f.src === foto.src) === i,
  );
  const precio = precioMostrable(paquete.precioDesde, paquete.moneda, config);
  const secciones = [
    { id: "resumen", titulo: "El viaje" },
    ...(paquete.itinerario.length
      ? [{ id: "itinerario", titulo: "Itinerario" }]
      : []),
    { id: "incluye", titulo: "Qué incluye" },
    ...(paquete.alojamiento.length
      ? [{ id: "alojamiento", titulo: "Alojamiento" }]
      : []),
    { id: "fechas", titulo: "Fechas y precio" },
    { id: "antes-de-viajar", titulo: "Antes de viajar" },
  ];
  return (
    <div className="detalle-paquete">
      <AbrirAlImprimir />
      <div className="contenedor">
        <div className="detalle-migas" data-print="ocultar">
          <Link href="/paquetes">
            <ArrowLeft size={15} aria-hidden="true" />
            Todos los viajes
          </Link>
          <span aria-hidden="true">/</span>
          <span>{paquete.destino}</span>
        </div>
        <header className="detalle-encabezado">
          <div>
            <p className="inicio-antetitulo">
              <MapPin size={13} aria-hidden="true" />
              {paquete.destino} · {paquete.pais}
            </p>
            <h1>{paquete.titulo}</h1>
            <div className="detalle-subtitulo">
              <span>
                <Clock size={15} aria-hidden="true" />
                {duracion(paquete.duracionDias, paquete.duracionNoches)}
              </span>
              <span>
                <MapPin size={15} aria-hidden="true" />
                Salida desde Asunción
              </span>
            </div>
          </div>
          <div className="detalle-encabezado-lateral" data-print="ocultar">
            <div className="detalle-primer-precio">
              <span>Desde <strong>{precio.principal}</strong></span>
              <small>{paquete.basePrecio}</small>
              <a href="#consulta">
                {paquete.estado === "agotado" ? "Consultar lista de espera" : "Consultar este viaje"}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div className="detalle-acciones">
              <BotonCompartir
                titulo={paquete.titulo}
                texto={`${paquete.destino} · desde ${precio.principal}`}
              />
              <BotonImprimir />
            </div>
          </div>
        </header>
        <GaleriaPaquete fotos={fotos} />
        <div className="detalle-etiquetas">
          <InsigniasViaje viaje={paquete} />
          {paquete.esEjemplo && (
            <span className="detalle-etiqueta-ejemplo">
              Viaje de ejemplo · datos ilustrativos
            </span>
          )}
        </div>
        <NavegacionViaje secciones={secciones} />
        <div className="detalle-distribucion">
          <div className="detalle-contenido">
            <Seccion
              id="resumen"
              titulo="Así se siente este viaje"
              descripcion="Lo esencial para saber si es el viaje que estás buscando."
            >
              <ResumenIconos viaje={paquete} />
              {paquete.highlights.length > 0 && (
                <div className="detalle-highlights">
                  <h3>
                    <Sparkles size={18} aria-hidden="true" />
                    Momentos que te esperan
                  </h3>
                  <ul>
                    {paquete.highlights.map((frase, i) => (
                      <li key={i}>
                        <Check size={16} aria-hidden="true" />
                        <span>{frase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Seccion>
            {paquete.itinerario.length > 0 && (
              <Seccion
                id="itinerario"
                titulo="Cada día, una nueva historia"
                descripcion={`${paquete.duracionDias} días para disfrutar el recorrido. Abrí cada etapa para conocer el detalle.`}
              >
                <ItinerarioViaje dias={paquete.itinerario} />
              </Seccion>
            )}
            <Seccion
              id="incluye"
              titulo="Lo que está contemplado"
              descripcion="Compará lo incluido con los gastos que tendrás que prever por separado."
            >
              <IncluyeNoIncluye viaje={paquete} />
            </Seccion>
            {paquete.alojamiento.length > 0 && (
              <Seccion
                id="alojamiento"
                titulo="Tu lugar para descansar"
                descripcion="Los alojamientos previstos para este recorrido."
              >
                <Alojamientos hoteles={paquete.alojamiento} />
              </Seccion>
            )}
            <Seccion id="fechas" titulo="Elegí cuándo empieza tu viaje">
              <FechasYPrecio viaje={paquete} config={config} />
              <div className="detalle-fechas-nota">
                <CalendarDays size={17} aria-hidden="true" />
                <p>
                  La disponibilidad se confirma al consultar.
                  {paquete.vigenciaPrecio &&
                    ` Referencia de vigencia: ${fechaLarga(paquete.vigenciaPrecio)}.`}{" "}
                  El precio final depende de las fechas y condiciones de tu
                  viaje.
                </p>
              </div>
            </Seccion>
            <section id="antes-de-viajar" className="detalle-preparacion">
              <p className="inicio-antetitulo">VIAJÁ CON TODO CLARO</p>
              <h2>Antes de preparar la valija</h2>
              {paquete.documentacion.length > 0 && (
                <div className="detalle-documentos">
                  <h3>Documentación necesaria</h3>
                  <Documentacion requisitos={paquete.documentacion} />
                </div>
              )}
              {paquete.faq.length > 0 && (
                <div className="detalle-preguntas">
                  <h3>Preguntas frecuentes</h3>
                  <Faq preguntas={paquete.faq} />
                </div>
              )}
              <BasesYCondiciones texto={paquete.basesYCondiciones} />
            </section>
            <section className="detalle-a-medida" data-print="ocultar">
              <Sparkles size={24} aria-hidden="true" />
              <div>
                <h2>¿Lo imaginás de otra manera?</h2>
                <p>
                  Podemos conversar sobre otras fechas, alojamientos o
                  experiencias.
                </p>
                <Link href="/encontra-tu-viaje">
                  Contanos cómo querés viajar{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
          <div className="detalle-columna-consulta">
            <ConsultaPaquete paquete={paquete} config={config} hoy={hoyISO()} />
          </div>
        </div>
        {similares && <div className="detalle-similares">{similares}</div>}
        <div data-print="pie">
          <p>
            {SITIO.nombreLegal}
            {config.whatsapp && ` · WhatsApp +${config.whatsapp}`}
            {config.email && ` · ${config.email}`}
          </p>
          <p>{SITIO.url} · Precios y disponibilidad sujetos a confirmación.</p>
        </div>
      </div>
    </div>
  );
}
