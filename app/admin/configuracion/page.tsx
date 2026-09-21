import { exigirAdmin } from "@/lib/admin/sesion";
import { getConfig } from "@/lib/data";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { FormularioConfig } from "@/components/admin/FormularioConfig";

export const metadata = { title: "Configuración" };

export default async function PaginaConfiguracion() {
  await exigirAdmin();
  const config = await getConfig();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Configuración del sitio"
        descripcion="Los datos de contacto, los textos de la página de inicio y cómo funciona el cuestionario. Los cambios se ven en el sitio en unos segundos."
      />
      <FormularioConfig inicial={config} />
    </div>
  );
}
