import Link from "next/link";
import { Plus } from "lucide-react";
import { exigirSesion } from "@/lib/admin/sesion";
import { listarPaquetes } from "@/lib/admin/datos";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { TablaPaquetes } from "@/components/admin/TablaPaquetes";
import { estiloBoton } from "@/components/ui/Boton";

export const metadata = { title: "Paquetes" };

export default async function PaginaPaquetes() {
  await exigirSesion();
  const paquetes = await listarPaquetes();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Paquetes"
        descripcion="Los viajes del catálogo. Podés cambiarles el estado desde acá mismo, sin entrar a editar."
        acciones={
          <Link href="/admin/paquetes/nuevo" className={estiloBoton()}>
            <Plus className="size-4" aria-hidden="true" />
            Paquete nuevo
          </Link>
        }
      />
      <TablaPaquetes paquetes={paquetes} />
    </div>
  );
}
