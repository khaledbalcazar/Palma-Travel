import Link from "next/link";
import { Plus } from "lucide-react";
import { SITIO } from "@/config/site";
import { exigirSesion } from "@/lib/admin/sesion";
import { listarPropuestas } from "@/lib/admin/datos";
import { getConfig } from "@/lib/data";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { TablaPropuestas } from "@/components/admin/TablaPropuestas";
import { estiloBoton } from "@/components/ui/Boton";

export const metadata = { title: "Propuestas" };

export default async function PaginaPropuestas() {
  await exigirSesion();
  const [propuestas, config] = await Promise.all([listarPropuestas(), getConfig()]);

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Propuestas personalizadas"
        descripcion="Viajes armados para un cliente puntual. No aparecen en el catálogo ni en Google: se comparten solo por enlace."
        acciones={
          <Link href="/admin/propuestas/nuevo" className={estiloBoton()}>
            <Plus className="size-4" aria-hidden="true" />
            Propuesta nueva
          </Link>
        }
      />
      <TablaPropuestas
        propuestas={propuestas}
        urlSitio={SITIO.url}
        whatsapp={config.whatsapp}
      />
    </div>
  );
}
