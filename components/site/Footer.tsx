import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  IconoFacebook,
  IconoInstagram,
  IconoWhatsApp,
} from "@/components/ui/IconosRedes";
import { NAVEGACION, SITIO } from "@/config/site";
import { getConfig } from "@/lib/data";
import { linkWhatsApp, mensajeGeneral } from "@/lib/whatsapp";
import { Logo } from "@/components/site/Logo";

export async function Footer() {
  const config = await getConfig();
  const wa = linkWhatsApp(config, mensajeGeneral());
  const anio = new Date().getFullYear();

  return (
    <footer
      data-sitio
      className="mt-24 border-t border-palma-900/10 bg-palma-900 text-arena-100"
    >
      <div className="contenedor grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="text-arena-100" />
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-arena-200/80">
            {SITIO.descripcion}
          </p>

          <div className="mt-6 flex gap-3">
            {config.instagram && (
              <a
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram de ${SITIO.nombre}`}
                className="inline-flex size-10 items-center justify-center rounded-full bg-arena-100/10 transition-colors hover:bg-arena-100/20"
              >
                <IconoInstagram className="size-5" />
              </a>
            )}
            {config.facebook && (
              <a
                href={`https://facebook.com/${config.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Facebook de ${SITIO.nombre}`}
                className="inline-flex size-10 items-center justify-center rounded-full bg-arena-100/10 transition-colors hover:bg-arena-100/20"
              >
                <IconoFacebook className="size-5" />
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribinos por WhatsApp"
                data-evento="click_whatsapp"
                data-evento-origen="footer"
                className="inline-flex size-10 items-center justify-center rounded-full bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark"
              >
                <IconoWhatsApp className="size-5" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Pie de página">
          <h2 className="font-display text-base text-arena-100">Navegación</h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] text-arena-200/80">
            {NAVEGACION.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-arena-50">
                  {item.etiqueta}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="transition-colors hover:text-arena-50">
                Inicio
              </Link>
            </li>
          </ul>
        </nav>

        <address className="not-italic">
          <h2 className="font-display text-base text-arena-100">Contacto</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem] text-arena-200/80">
            {config.direccion && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {config.direccion}
                  {config.ciudad && (
                    <>
                      <br />
                      {config.ciudad}
                    </>
                  )}
                </span>
              </li>
            )}
            {config.telefono && (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${config.telefono.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-arena-50"
                >
                  {config.telefono}
                </a>
              </li>
            )}
            {config.email && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${config.email}`}
                  className="break-all transition-colors hover:text-arena-50"
                >
                  {config.email}
                </a>
              </li>
            )}
          </ul>
        </address>
      </div>

      <div className="border-t border-arena-100/12">
        <div className="contenedor flex flex-col gap-2 py-6 text-sm text-arena-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {anio} {SITIO.nombreLegal}. Todos los derechos reservados.
          </p>
          {config.registroSenatur && (
            <p>Registro SENATUR n.º {config.registroSenatur}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
