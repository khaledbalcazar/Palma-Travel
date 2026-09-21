import { exigirAdmin } from "@/lib/admin/sesion";
import { listarPerfiles } from "@/lib/admin/datos";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { GestionUsuarios } from "@/components/admin/GestionUsuarios";

export const metadata = { title: "Usuarios" };

export default async function PaginaUsuarios() {
  const admin = await exigirAdmin();
  const usuarios = await listarPerfiles();

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo="Usuarios del panel"
        descripcion="Quién puede entrar a cargar paquetes y propuestas."
      />
      <GestionUsuarios usuarios={usuarios} idPropio={admin.id} />
    </div>
  );
}
