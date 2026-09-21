import type { Metadata } from "next";
import { exigirSesion } from "@/lib/admin/sesion";
import { getConfig } from "@/lib/data";
import { VistaPreviaCliente } from "@/components/admin/VistaPreviaCliente";

export const metadata: Metadata = {
  title: "Vista previa",
  robots: { index: false, follow: false },
};

/* Muestra la landing tal como va a quedar, con los datos que están en el
   formulario en este momento (todavía sin guardar). */
export default async function VistaPrevia() {
  await exigirSesion();
  const config = await getConfig();
  return <VistaPreviaCliente config={config} />;
}
