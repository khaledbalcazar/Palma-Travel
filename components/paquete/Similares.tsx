import type { Paquete, SiteConfig } from "@/lib/schema";
import { PaqueteCard } from "@/components/paquete/PaqueteCard";

export function Similares({
  paquetes,
  config,
  titulo = "Viajes parecidos",
}: {
  paquetes: Paquete[];
  config: SiteConfig;
  titulo?: string;
}) {
  if (paquetes.length === 0) return null;

  return (
    <section data-print="ocultar">
      <h2 className="font-display text-2xl md:text-3xl">{titulo}</h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paquetes.map((p) => (
          <li key={p.slug}>
            <PaqueteCard paquete={p} config={config} />
          </li>
        ))}
      </ul>
    </section>
  );
}
