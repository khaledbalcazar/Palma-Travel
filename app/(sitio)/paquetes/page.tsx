import type { Metadata } from "next";
import { Suspense } from "react";
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
    <div className="contenedor py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl">Nuestros viajes</h1>
        <p className="mt-4 text-lg text-tinta-600">
          Todo lo que tenemos armado hoy, con salida desde Asunción. Si ninguno
          te cierra del todo, te lo armamos a tu medida.
        </p>
      </header>

      <div className="mt-10">
        <Suspense
          fallback={
            <p className="text-tinta-500">Cargando los viajes…</p>
          }
        >
          <Catalogo paquetes={paquetes} config={config} hoy={hoyISO()} />
        </Suspense>
      </div>
    </div>
  );
}
