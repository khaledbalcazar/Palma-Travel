import { notFound } from "next/navigation";
import { exigirSesion } from "@/lib/admin/sesion";
import { obtenerPaquete } from "@/lib/admin/datos";
import { borradorDesde } from "@/lib/admin/borrador";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { FormularioViaje } from "@/components/admin/FormularioViaje";

export const metadata = { title: "Editar paquete" };

export default async function EditarPaquete({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirSesion();
  const { id } = await params;
  const paquete = await obtenerPaquete(id);
  if (!paquete) notFound();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Editar paquete"
        descripcion={`Última edición: ${new Date(paquete.actualizadoEn).toLocaleString("es-PY")}${
          paquete.actualizadoPor ? ` · por ${paquete.actualizadoPor}` : ""
        }`}
        volverA="/admin/paquetes"
        volverEtiqueta="Paquetes"
      />
      <FormularioViaje
        modo="paquete"
        id={paquete.id}
        inicial={borradorDesde(paquete)}
      />
    </div>
  );
}
