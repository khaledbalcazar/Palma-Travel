"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAVEGACION } from "@/config/site";
import { estiloBoton } from "@/components/ui/Boton";
import { IconoWhatsApp } from "@/components/ui/IconosRedes";

export function MenuMovil({ whatsapp }: { whatsapp: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  /* Se cierra al cambiar de página */
  useEffect(() => setAbierto(false), [ruta]);

  /* Se cierra con Escape y bloquea el scroll de fondo */
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir el menú"
        aria-expanded={abierto}
        className="inline-flex size-10 items-center justify-center rounded-full text-palma-900 transition-colors hover:bg-palma-900/6"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 bg-arena-50">
          <div className="contenedor flex h-16 items-center justify-end">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el menú"
              autoFocus
              className="inline-flex size-10 items-center justify-center rounded-full text-palma-900 transition-colors hover:bg-palma-900/6"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Principal" className="contenedor mt-6 flex flex-col gap-1">
            {NAVEGACION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-palma-900/8 py-4 font-display text-2xl text-palma-900"
              >
                {item.etiqueta}
              </Link>
            ))}

            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                data-evento="click_whatsapp"
                data-evento-origen="menu_movil"
                className={estiloBoton({
                  variante: "whatsapp",
                  tamano: "lg",
                  className: "mt-8 w-full",
                })}
              >
                <IconoWhatsApp className="size-5" />
                Escribinos por WhatsApp
              </a>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
