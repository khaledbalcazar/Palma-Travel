import { exigirSesion } from "@/lib/admin/sesion";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { FormularioViaje } from "@/components/admin/FormularioViaje";

export const metadata = { title: "Paquete nuevo" };

export default async function NuevoPaquete() {
  await exigirSesion();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Paquete nuevo"
        descripcion="Se guarda como «Oculto» hasta que lo pongas en activo. Podés guardar a medio hacer y seguir después."
        volverA="/admin/paquetes"
        volverEtiqueta="Paquetes"
      />
      <FormularioViaje modo="paquete" />
    </div>
  );
}
