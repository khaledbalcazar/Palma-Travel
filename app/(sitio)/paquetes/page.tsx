import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Plane, Sparkles } from "lucide-react";
import { Foto } from "@/components/ui/Foto";
import { getConfig, getPaquetes } from "@/lib/data";
import { hoyISO } from "@/lib/format";
import { Catalogo } from "@/components/paquete/Catalogo";

export const metadata: Metadata = {
  title: "Paquetes",
  description:
    "Todos los viajes de Palma Travel con salida desde Asunción: playa, cultura, naturaleza, nieve y peregrinaciones. Filtrá por región, precio, duración y mes.",
  alternates: { canonical: "/paquetes" },
  openGraph: {
    title: "Paquetes de viaje · Palma Travel",
    description:
      "Todos nuestros viajes con salida desde Asunción, con precios y fechas.",
    url: "/paquetes",
  },
};

export default async function PaginaPaquetes() {
  const [paquetes, config] = await Promise.all([getPaquetes(), getConfig()]);

  return (
    <div className="pagina-paquetes">
      <div className="contenedor">
        <nav className="paquetes-migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Paquetes</span>
        </nav>
        <header className="paquetes-portada">
          <div className="paquetes-portada-texto">
            <p className="inicio-antetitulo">EL MUNDO TE ESTÁ ESPERANDO</p>
            <h1>
              Un viaje para cada
              <br />
              <span>forma de soñar.</span>
            </h1>
            <p>
              De una escapada cerca a ese destino que siempre imaginaste. Elegí
              tu próximo viaje; nosotros te acompañamos.
            </p>
            <div className="paquetes-portada-datos">
              <span>
                <Plane size={15} aria-hidden="true" />
                Salidas desde Asunción
              </span>
              <span>
                <Sparkles size={15} aria-hidden="true" />
                Asesoramiento personal
              </span>
            </div>
          </div>
          <div className="paquetes-portada-foto">
            <Foto
              src={config.heroImagen || "/images/costa-portada.webp"}
              alt="Costa y mar turquesa para inspirar tu próximo viaje"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 450px"
            />
            <div />
            <Link href="/encontra-tu-viaje">
              Tu próxima historia empieza acá{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </header>
        <div className="paquetes-catalogo">
          <Suspense
            fallback={<p className="text-tinta-500">Cargando los viajes…</p>}
          >
            <Catalogo paquetes={paquetes} config={config} hoy={hoyISO()} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
