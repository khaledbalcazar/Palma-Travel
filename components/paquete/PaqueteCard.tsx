import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
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
        "viaje-card group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-palma-900/12 bg-white transition-colors duration-200",
        /* Un paquete agotado se apaga en la foto, no en el texto: bajarle
           la opacidad a todo dejaba los datos por debajo del contraste
           mínimo que se puede leer. */
        !agotado && "hover:border-palma-600/50",
      )}
    >
      <div className="viaje-card-imagen relative overflow-hidden">
        <Foto
          src={paquete.imagenPortada.src}
          alt={paquete.imagenPortada.alt}
          fill
          priority={prioridad}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 460px"
          className={cn(
            "transition-transform duration-500",
            agotado ? "opacity-60 saturate-50" : "group-hover:scale-105",
          )}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-3">
          <InsigniasViaje viaje={paquete} sobreFoto />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="viaje-card-destino">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />
          {paquete.destino} · {paquete.pais}
        </p>
        <h3 className="font-sans text-xl font-bold leading-snug">
          <Link
            href={`/paquetes/${paquete.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {paquete.titulo}
          </Link>
        </h3>

        <dl className="viaje-card-datos">
          <div className="flex items-center gap-1.5">
            <dt className="solo-lectores">Duración</dt>
            <Clock className="size-4 text-tinta-400" aria-hidden="true" />
            <dd>{duracion(paquete.duracionDias, paquete.duracionNoches)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="solo-lectores">Salidas</dt>
            <CalendarDays
              className="size-4 text-tinta-400"
              aria-hidden="true"
            />
            <dd>{resumenSalidas(paquete)}</dd>
          </div>
        </dl>

        <div className="viaje-card-pie">
          <div>
            <p className="text-xs text-tinta-500">Desde</p>
            <p className="viaje-card-precio">{precio.principal}</p>
            {precio.equivalente && (
              <p className="text-xs text-tinta-500">≈ {precio.equivalente}</p>
            )}
            <p className="mt-0.5 text-xs text-tinta-400">
              {paquete.basePrecio}
            </p>
          </div>

          <span aria-hidden="true" className="viaje-card-enlace">
            {agotado ? "Lista de espera" : "Ver viaje"}
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
