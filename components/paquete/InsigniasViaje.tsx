import { Bus, Plane, Users, Flame } from "lucide-react";
import { Insignia } from "@/components/ui/Insignia";
import type { Paquete, Viaje } from "@/lib/schema";

/* Las etiquetas que se ven arriba de una tarjeta o de una landing.
   Lo más importante es dejar clarísimo si el vuelo está incluido o no. */
export function InsigniasViaje({
  viaje,
  sobreFoto = false,
}: {
  viaje: Viaje;
  sobreFoto?: boolean;
}) {
  const estado = "estado" in viaje ? (viaje as Paquete).estado : undefined;
  const ultimosLugares =
    "ultimosLugares" in viaje ? (viaje as Paquete).ultimosLugares : false;

  return (
    <>
      {estado === "agotado" && (
        <Insignia tono={sobreFoto ? "oscuro" : "coral"}>Agotado</Insignia>
      )}
      {estado === "proximamente" && (
        <Insignia tono={sobreFoto ? "oscuro" : "arena"}>Próximamente</Insignia>
      )}
      {ultimosLugares && estado === "activo" && (
        <Insignia tono="aviso" icono={<Flame className="size-3" aria-hidden="true" />}>
          Últimos lugares
        </Insignia>
      )}

      {viaje.incluyeVuelo ? (
        <Insignia
          tono={sobreFoto ? "oscuro" : "palma"}
          icono={<Plane className="size-3" aria-hidden="true" />}
        >
          Vuelo incluido
        </Insignia>
      ) : (
        <Insignia
          tono="coral"
          icono={<Bus className="size-3" aria-hidden="true" />}
        >
          Sin vuelo
        </Insignia>
      )}

      {viaje.salidaGrupal && (
        <Insignia
          tono={sobreFoto ? "oscuro" : "arena"}
          icono={<Users className="size-3" aria-hidden="true" />}
        >
          Salida grupal
        </Insignia>
      )}
    </>
  );
}
