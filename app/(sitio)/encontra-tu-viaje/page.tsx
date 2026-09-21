import type { Metadata } from "next";
import { getConfig, getPaquetes } from "@/lib/data";
import { Cuestionario } from "@/components/cuestionario/Cuestionario";

export const metadata: Metadata = {
  title: "Encontrá tu viaje ideal",
  description:
    "Contestá 8 preguntas cortas y te decimos qué viaje de Palma Travel se parece más a lo que buscás. Y si ninguno da, te lo armamos a medida.",
  alternates: { canonical: "/encontra-tu-viaje" },
  openGraph: {
    title: "Encontrá tu viaje ideal · Palma Travel",
    description:
      "Ocho preguntas y te decimos qué viaje se parece más a lo que buscás.",
    url: "/encontra-tu-viaje",
  },
};

export default async function PaginaCuestionario() {
  const [paquetes, config] = await Promise.all([getPaquetes(), getConfig()]);

  return (
    <div className="contenedor py-12 md:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-coral-600 uppercase">
          Encontrá tu viaje
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">
          ¿Qué viaje querés?
        </h1>
        <p className="mt-4 text-lg text-tinta-600">
          Ocho preguntas cortas y te mostramos los viajes que más se parecen a lo
          que tenés en la cabeza. Si ninguno da, lo armamos desde cero.
        </p>
      </header>

      <div className="mt-12">
        <Cuestionario paquetes={paquetes} config={config} />
      </div>
    </div>
  );
}
