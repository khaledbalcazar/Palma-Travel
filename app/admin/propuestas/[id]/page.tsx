import { notFound } from "next/navigation";
import { exigirSesion } from "@/lib/admin/sesion";
import { obtenerPropuesta } from "@/lib/admin/datos";
import { borradorDesde } from "@/lib/admin/borrador";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { FormularioViaje } from "@/components/admin/FormularioViaje";

export const metadata = { title: "Editar propuesta" };

export default async function EditarPropuesta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirSesion();
  const { id } = await params;
  const propuesta = await obtenerPropuesta(id);
  if (!propuesta) notFound();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo={`Propuesta para ${propuesta.clienteNombre}`}
        descripcion={`Última edición: ${new Date(propuesta.actualizadoEn).toLocaleString("es-PY")}${
          propuesta.actualizadoPor ? ` · por ${propuesta.actualizadoPor}` : ""
        }`}
        volverA="/admin/propuestas"
        volverEtiqueta="Propuestas"
      />
      <FormularioViaje
        modo="propuesta"
        id={propuesta.id}
        inicial={borradorDesde(propuesta)}
      />
    </div>
  );
}
