import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, Compass, HeartHandshake, MapPin, MessageCircleMore, Palmtree, Plane, Sparkles, Mountain, Landmark } from "lucide-react";
import { getConfig, getPaquetesDestacados } from "@/lib/data";
import { linkWhatsApp, mensajeAMedida } from "@/lib/whatsapp";
import { agenciaDeViajes } from "@/lib/seo";
import { Foto } from "@/components/ui/Foto";
import { estiloBoton } from "@/components/ui/Boton";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";
import { BuscadorViajes } from "@/components/site/BuscadorViajes";
import { PaqueteCard } from "@/components/paquete/PaqueteCard";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const revalidate = 3600;

export default async function Home() {
  const [destacados, config] = await Promise.all([getPaquetesDestacados(3), getConfig()]);
  const waAMedida = linkWhatsApp(config, mensajeAMedida());

  return (
    <div className="inicio-palma">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agenciaDeViajes(config)) }} />

      <section className="portada-palma" aria-labelledby="titulo-inicio">
        <Foto src={config.heroImagen || "/images/costa-portada.webp"} alt="Un paisaje de costa para inspirar tu próximo viaje" fill priority sizes="100vw" className="object-cover" />
        <div className="portada-velo" />
        <div className="portada-contenido">
          <p className="portada-antetitulo"><span />DESDE PARAGUAY, AL MUNDO</p>
          <h1 id="titulo-inicio">{config.heroTitulo}</h1>
          {config.heroSubtitulo && <p className="portada-descripcion">{config.heroSubtitulo}</p>}
          <BuscadorViajes />
          <div className="portada-ayuda">
            <span><Plane className="size-4" aria-hidden="true" /> Salidas desde Asunción</span>
            <Link href="/encontra-tu-viaje">¿Todavía no sabés a dónde? Te ayudamos <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
        <a href="#explorar" className="portada-explorar">Un viaje empieza con una idea <ArrowDown className="size-4" aria-hidden="true" /></a>
      </section>

      <section id="explorar" className="contenedor inicio-explorar" aria-label="Explorá por tipo de viaje">
        <span className="text-sm font-semibold text-tinta-500">¿Qué te dan ganas de hacer?</span>
        <div className="inicio-categorias">
          {[
            { tipo: "playa", texto: "Sol y playa", icono: Palmtree },
            { tipo: "aventura", texto: "Aventura", icono: Mountain },
            { tipo: "cultura", texto: "Cultura", icono: Landmark },
            { tipo: "naturaleza", texto: "Naturaleza", icono: Compass },
          ].map(({ tipo, texto, icono: Icono }) => <Link key={tipo} href={`/paquetes?tipo=${tipo}`}><Icono className="size-4" aria-hidden="true" />{texto}</Link>)}
        </div>
      </section>

      <section className="contenedor inicio-seccion" aria-labelledby="destacados-titulo">
        <div className="inicio-encabezado">
          <div><p className="inicio-antetitulo">TU PRÓXIMA ESCAPADA</p><h2 id="destacados-titulo">Un destino. Mil ganas de ir.</h2><p className="mt-3 text-tinta-500">Descubrí nuestros viajes destacados, con salida desde Asunción.</p></div>
          <Link href="/paquetes" className="inicio-ver-todos">Ver todos los viajes <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {destacados.length ? <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{destacados.map((p) => <li key={p.slug}><PaqueteCard paquete={p} config={config} /></li>)}</ul> : <div className="mt-8 rounded-2xl border border-palma-900/15 bg-tinta-50 p-10 text-center"><p>Estamos preparando los próximos viajes.</p><Link href="/contacto" className="mt-4 inline-flex font-semibold text-palma-800 underline">Contanos a dónde querés ir</Link></div>}
      </section>

      <section className="contenedor inicio-seccion" aria-labelledby="a-medida-titulo">
        <div className="inicio-medida">
          <div className="medida-texto">
            <p className="inicio-antetitulo">VIAJES TAN ÚNICOS COMO VOS</p>
            <h2 id="a-medida-titulo">Vos ponés el sueño.<br />Nosotros, el plan.</h2>
            <p>Una luna de miel, una aventura con amigos o ese viaje en familia que venís imaginando. Contanos qué tenés en mente y lo armamos a tu medida.</p>
            <Link href="/encontra-tu-viaje" className={estiloBoton({ tamano: "lg", className: "bg-white text-palma-900 hover:bg-arena-100 shadow-none" })}>Encontrá tu viaje ideal <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <span className="medida-nota"><Sparkles className="size-4" aria-hidden="true" /> Unas preguntas para empezar a conocerte</span>
          </div>
          <div className="medida-itinerario">
            <div className="flex items-center justify-between border-b border-palma-900/10 pb-5"><span className="text-xs font-bold tracking-widest text-palma-700">TU VIAJE, A TU MANERA</span><Plane className="size-5 text-palma-700" aria-hidden="true" /></div>
            <ol>
              <li><span>01</span><div><h3>Contanos tu idea</h3><p>Destino, compañía y ganas de explorar.</p></div></li>
              <li><span>02</span><div><h3>Le damos forma juntos</h3><p>Vuelos, hoteles y experiencias a tu medida.</p></div></li>
              <li><span>03</span><div><h3>Disfrutá el camino</h3><p>Con nuestro equipo acompañándote.</p></div></li>
            </ol>
            <div className="flex items-center gap-2 border-t border-palma-900/10 pt-5 text-xs font-medium text-tinta-500"><MapPin className="size-4" aria-hidden="true" /> Desde Asunción hasta donde quieras llegar</div>
          </div>
        </div>
      </section>

      <section className="contenedor inicio-seccion" aria-labelledby="equipo-titulo">
        <div className="inicio-encabezado"><div><p className="inicio-antetitulo">CERCA TUYO, VAYAS DONDE VAYAS</p><h2 id="equipo-titulo">Viajá con un equipo de tu lado.</h2></div></div>
        <ul className="inicio-beneficios">
          {[
            { icono: MessageCircleMore, titulo: "Personas, no respuestas automáticas", texto: "Conversá con el equipo y resolvé tus dudas antes de elegir tu próximo destino." },
            { icono: Compass, titulo: "Un viaje que va con vos", texto: "Elegí un paquete o armemos una propuesta según tus tiempos, tus gustos y tu presupuesto." },
            { icono: HeartHandshake, titulo: "Del primer mensaje al regreso", texto: "Te acompañamos en la planificación y durante el viaje para que disfrutes cada etapa." },
          ].map(({ icono: Icono, titulo, texto }) => <li key={titulo}><Icono className="size-6 text-palma-600" aria-hidden="true" /><h3>{titulo}</h3><p>{texto}</p></li>)}
        </ul>
      </section>

      <section className="contenedor inicio-seccion inicio-cierre">
        <div><p className="inicio-antetitulo">EMPECEMOS POR UNA CHARLA</p><h2>¿A dónde te gustaría ir?</h2><p className="mt-3 text-tinta-500">Contanos tu idea. El próximo viaje empieza acá.</p></div>
        {waAMedida ? <BotonWhatsApp href={waAMedida} origen="home_cierre" tamano="lg">Hablemos de tu viaje</BotonWhatsApp> : <Link href="/contacto" className={estiloBoton({ tamano: "lg", className: "shadow-none" })}>Hablemos de tu viaje <ArrowRight className="size-4" aria-hidden="true" /></Link>}
      </section>
    </div>
  );
}
