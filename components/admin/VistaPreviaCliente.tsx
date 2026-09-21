"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { CuerpoViaje } from "@/components/paquete/CuerpoViaje";
import {
  linkWhatsApp,
  mensajePaquete,
  mensajePropuesta,
} from "@/lib/whatsapp";
import {
  esPropuesta,
  paqueteSchema,
  propuestaSchema,
  type SiteConfig,
  type Viaje,
} from "@/lib/schema";

/* Lee lo que el formulario dejó guardado en la pestaña y lo dibuja.
   La página de verdad se arma con los mismos componentes, así que lo que
   se ve acá es lo que va a quedar publicado. */
export function VistaPreviaCliente({ config }: { config: SiteConfig }) {
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [problema, setProblema] = useState<string | null>(null);

  useEffect(() => {
    try {
      const crudo = sessionStorage.getItem("palma:vista-previa");
      if (!crudo) {
        setProblema(
          "No encontramos nada para mostrar. Abrí la vista previa desde el botón del formulario.",
        );
        return;
      }
      const { modo, datos } = JSON.parse(crudo) as {
        modo: "paquete" | "propuesta";
        datos: unknown;
      };
      const schema = modo === "paquete" ? paqueteSchema : propuestaSchema;
      const resultado = schema.safeParse(datos);
      if (!resultado.success) {
        setProblema(
          `Todavía faltan datos para poder mostrar la página: ${resultado.error.issues
            .slice(0, 3)
            .map((i) => i.message)
            .join(" ")}`,
        );
        return;
      }
      setViaje(resultado.data as Viaje);
    } catch {
      setProblema("No se pudo leer la vista previa.");
    }
  }, []);

  if (problema) {
    return (
      <div className="contenedor max-w-xl py-20">
        <p className="flex items-start gap-3 rounded-xl bg-arena-200 px-5 py-4 text-[0.95rem] text-tinta-700">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-coral-600" aria-hidden="true" />
          {problema}
        </p>
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="contenedor py-20 text-center text-tinta-500">Cargando…</div>
    );
  }

  return (
    <>
      <p className="sticky top-0 z-50 bg-coral-600 px-5 py-2 text-center text-sm font-medium text-white">
        Vista previa — así se va a ver «{viaje.titulo}». Todavía no está
        publicado.
      </p>
      <CuerpoViaje
        viaje={viaje}
        config={config}
        whatsapp={linkWhatsApp(
          config,
          esPropuesta(viaje) ? mensajePropuesta(viaje) : mensajePaquete(viaje),
        )}
      />
    </>
  );
}
