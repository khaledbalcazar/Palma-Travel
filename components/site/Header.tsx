import Link from "next/link";
import { NAVEGACION } from "@/config/site";
import { getConfig } from "@/lib/data";
import { linkWhatsApp, mensajeGeneral } from "@/lib/whatsapp";
import { Logo } from "@/components/site/Logo";
import { estiloBoton } from "@/components/ui/Boton";
import { MenuMovil } from "@/components/site/MenuMovil";
import { IconoWhatsApp } from "@/components/ui/IconosRedes";
import { MarcoHeader } from "@/components/site/MarcoHeader";

export async function Header() {
  const config = await getConfig();
  const wa = linkWhatsApp(config, mensajeGeneral());

  return (
    <MarcoHeader>
      <div className="contenedor flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href="/"
          className="cabecera-logo text-palma-900 transition-opacity hover:opacity-80"
          aria-label="Palma Travel, ir al inicio"
        >
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAVEGACION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cabecera-enlace rounded-full px-4 py-2 text-base font-semibold text-tinta-700 transition-colors hover:bg-palma-900/6 hover:text-palma-900"
            >
              {item.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="click_whatsapp"
              data-evento-origen="header"
              className={estiloBoton({
                variante: "whatsapp",
                tamano: "sm",
                className: "cabecera-contacto hidden sm:inline-flex",
              })}
            >
              <IconoWhatsApp className="size-4" />
              Escribinos
            </a>
          ) : (
            <Link href="/contacto" className="cabecera-contacto hidden rounded-full border border-palma-900/20 px-5 py-2.5 text-sm font-semibold text-palma-900 sm:inline-flex">Hablemos de tu viaje</Link>
          )}
          <MenuMovil whatsapp={wa} />
        </div>
      </div>
    </MarcoHeader>
  );
}
