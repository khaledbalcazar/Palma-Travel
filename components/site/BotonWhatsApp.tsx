"use client";

import { registrarEvento } from "@/lib/analytics";
import { estiloBoton } from "@/components/ui/Boton";
import { IconoWhatsApp } from "@/components/ui/IconosRedes";
import { cn } from "@/lib/utils";

/* Botón de WhatsApp con registro del evento `click_whatsapp`.
   Si todavía no hay número cargado en la configuración, no se muestra. */
export function BotonWhatsApp({
  href,
  origen,
  paquete,
  children = "Consultar por WhatsApp",
  tamano = "md",
  className,
}: {
  href: string | null;
  origen: string;
  paquete?: string;
  children?: React.ReactNode;
  tamano?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-print="ocultar"
      onClick={() => registrarEvento("click_whatsapp", { origen, paquete })}
      className={estiloBoton({ variante: "whatsapp", tamano, className: cn(className) })}
    >
      <IconoWhatsApp className={tamano === "sm" ? "size-4" : "size-5"} />
      {children}
    </a>
  );
}
