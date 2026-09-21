import { exigirSesion } from "@/lib/admin/sesion";
import { listarPaquetes } from "@/lib/admin/datos";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { FormularioViaje } from "@/components/admin/FormularioViaje";
import { DesdePaquete } from "@/components/admin/DesdePaquete";

export const metadata = { title: "Propuesta nueva" };

export default async function NuevaPropuesta() {
  await exigirSesion();
  const paquetes = await listarPaquetes();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Propuesta nueva"
        descripcion="Armá un viaje a medida para un cliente. Después le pasás el enlace por WhatsApp."
        volverA="/admin/propuestas"
        volverEtiqueta="Propuestas"
      />

      <DesdePaquete
        paquetes={paquetes.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          destino: p.destino,
        }))}
      />

      <FormularioViaje modo="propuesta" />
    </div>
  );
}
