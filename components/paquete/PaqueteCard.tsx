import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import type { Paquete, SiteConfig } from "@/lib/schema";
import { duracion, precioMostrable, resumenSalidas } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Foto } from "@/components/ui/Foto";
import { InsigniasViaje } from "@/components/paquete/InsigniasViaje";

export function PaqueteCard({
  paquete,
  config,
  prioridad = false,
}: {
  paquete: Paquete;
  config: Pick<SiteConfig, "mostrarPrecioEnGuaranies" | "tipoCambioUsdGs">;
  prioridad?: boolean;
}) {
  const agotado = paquete.estado === "agotado";
  const precio = precioMostrable(paquete.precioDesde, paquete.moneda, config);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-arena-50 shadow-suave transition-shadow duration-200",
        agotado ? "opacity-75" : "hover:shadow-alta",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Foto
          src={paquete.imagenPortada.src}
          alt={paquete.imagenPortada.alt}
          fill
          priority={prioridad}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className={cn(
            "transition-transform duration-500",
            !agotado && "group-hover:scale-105",
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 velo-foto" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-3">
          <InsigniasViaje viaje={paquete} sobreFoto />
        </div>

        <div className="absolute inset-x-4 bottom-3">
          <p className="text-xs font-medium tracking-wide text-arena-200 uppercase">
            {paquete.destino} · {paquete.pais}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-snug">
          <Link
            href={`/paquetes/${paquete.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {paquete.titulo}
          </Link>
        </h3>

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-tinta-600">
          <div className="flex items-center gap-1.5">
            <dt className="solo-lectores">Duración</dt>
            <Clock className="size-4 text-tinta-400" aria-hidden="true" />
            <dd>{duracion(paquete.duracionDias, paquete.duracionNoches)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="solo-lectores">Salidas</dt>
            <CalendarDays className="size-4 text-tinta-400" aria-hidden="true" />
            <dd>{resumenSalidas(paquete)}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-tinta-500">Desde</p>
            <p className="font-display text-2xl text-palma-900">{precio.principal}</p>
            {precio.equivalente && (
              <p className="text-xs text-tinta-500">≈ {precio.equivalente}</p>
            )}
            <p className="mt-0.5 text-xs text-tinta-400">{paquete.basePrecio}</p>
          </div>

          <span
            aria-hidden="true"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              agotado
                ? "bg-tinta-100 text-tinta-500"
                : "bg-palma-900/8 text-palma-800 group-hover:bg-palma-800 group-hover:text-arena-50",
            )}
          >
            {agotado ? "Lista de espera" : "Ver viaje"}
          </span>
        </div>
      </div>
    </article>
  );
}
