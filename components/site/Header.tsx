import Link from "next/link";
import { NAVEGACION } from "@/config/site";
import { getConfig } from "@/lib/data";
import { linkWhatsApp, mensajeGeneral } from "@/lib/whatsapp";
import { Logo } from "@/components/site/Logo";
import { estiloBoton } from "@/components/ui/Boton";
import { MenuMovil } from "@/components/site/MenuMovil";
import { IconoWhatsApp } from "@/components/ui/IconosRedes";

export async function Header() {
  const config = await getConfig();
  const wa = linkWhatsApp(config, mensajeGeneral());

  return (
    <header
      data-sitio
      className="sticky top-0 z-40 border-b border-palma-900/8 bg-arena-50/85 backdrop-blur-md"
    >
      <div className="contenedor flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href="/"
          className="text-palma-900 transition-opacity hover:opacity-80"
          aria-label="Palma Travel, ir al inicio"
        >
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAVEGACION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-tinta-700 transition-colors hover:bg-palma-900/6 hover:text-palma-900"
            >
              {item.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="click_whatsapp"
              data-evento-origen="header"
              className={estiloBoton({
                variante: "whatsapp",
                tamano: "sm",
                className: "hidden sm:inline-flex",
              })}
            >
              <IconoWhatsApp className="size-4" />
              Escribinos
            </a>
          )}
          <MenuMovil whatsapp={wa} />
        </div>
      </div>
    </header>
  );
}
