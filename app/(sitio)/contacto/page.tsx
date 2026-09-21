import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SITIO } from "@/config/site";
import { getConfig } from "@/lib/data";
import { linkWhatsApp, mensajeGeneral } from "@/lib/whatsapp";
import { agenciaDeViajes } from "@/lib/seo";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";
import {
  IconoFacebook,
  IconoInstagram,
} from "@/components/ui/IconosRedes";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por WhatsApp, mandanos un mail o pasá por la oficina. Te contesta una persona del equipo.",
  alternates: { canonical: "/contacto" },
};

export const revalidate = 3600;

export default async function Contacto() {
  const config = await getConfig();
  const wa = linkWhatsApp(config, mensajeGeneral());

  const tieneDatos =
    config.whatsapp || config.email || config.telefono || config.direccion;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(agenciaDeViajes(config)),
        }}
      />

      <div className="contenedor py-12 md:py-16">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl">Hablemos</h1>
          <p className="mt-4 text-lg text-tinta-600">
            La forma más rápida es WhatsApp: te contesta alguien del equipo, no
            un robot. Contanos a dónde querés ir y lo vemos.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Datos */}
          <div>
            {wa && (
              <div className="rounded-2xl bg-palma-800 p-7 text-arena-50">
                <h2 className="font-display text-2xl text-arena-50">
                  Escribinos por WhatsApp
                </h2>
                <p className="mt-2 text-arena-200/90">
                  Es por donde arreglamos casi todo. Contestamos de lunes a
                  sábado.
                </p>
                <div className="mt-6">
                  <BotonWhatsApp href={wa} origen="pagina_contacto" tamano="lg">
                    Abrir WhatsApp
                  </BotonWhatsApp>
                </div>
              </div>
            )}

            <dl className="mt-8 space-y-6">
              {config.direccion && (
                <Dato icono={MapPin} etiqueta="Dónde estamos">
                  {config.direccion}
                  {config.ciudad && (
                    <>
                      <br />
                      {config.ciudad}
                    </>
                  )}
                </Dato>
              )}

              {config.telefono && (
                <Dato icono={Phone} etiqueta="Teléfono">
                  <a
                    href={`tel:${config.telefono.replace(/\s/g, "")}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {config.telefono}
                  </a>
                </Dato>
              )}

              {config.email && (
                <Dato icono={Mail} etiqueta="Email">
                  <a
                    href={`mailto:${config.email}`}
                    className="break-all underline-offset-4 hover:underline"
                  >
                    {config.email}
                  </a>
                </Dato>
              )}

              <Dato icono={Clock} etiqueta="Horario de atención">
                Lunes a viernes de 8:00 a 17:00
                <br />
                Sábados de 8:00 a 12:00
              </Dato>
            </dl>

            {(config.instagram || config.facebook) && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold tracking-wide text-tinta-500 uppercase">
                  Seguinos
                </h2>
                <div className="mt-3 flex gap-3">
                  {config.instagram && (
                    <a
                      href={`https://instagram.com/${config.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-arena-100 px-4 py-2.5 text-[0.95rem] font-medium text-palma-900 transition-colors hover:bg-arena-200"
                    >
                      <IconoInstagram className="size-5" />@{config.instagram}
                    </a>
                  )}
                  {config.facebook && (
                    <a
                      href={`https://facebook.com/${config.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-arena-100 px-4 py-2.5 text-[0.95rem] font-medium text-palma-900 transition-colors hover:bg-arena-200"
                    >
                      <IconoFacebook className="size-5" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}

            {config.registroSenatur && (
              <p className="mt-8 rounded-xl bg-arena-100 px-5 py-4 text-sm text-tinta-600">
                {SITIO.nombreLegal} está registrada en la Secretaría Nacional de
                Turismo con el n.º {config.registroSenatur}.
              </p>
            )}

            {!tieneDatos && (
              <p className="mt-8 rounded-xl bg-arena-200 px-5 py-4 text-sm text-tinta-600">
                Todavía no están cargados los datos de contacto. Se completan
                desde el panel, en Configuración del sitio.
              </p>
            )}
          </div>

          {/* Mapa */}
          <div>
            <h2 className="font-display text-2xl">Cómo llegar</h2>
            <div className="mt-4 overflow-hidden rounded-2xl bg-arena-200">
              {config.mapsUrl ? (
                <iframe
                  src={config.mapsUrl}
                  title="Mapa con la ubicación de la oficina"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full border-0"
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center px-6 text-center">
                  <MapPin className="size-8 text-tinta-400" aria-hidden="true" />
                  <p className="mt-3 max-w-xs text-sm text-tinta-500">
                    El mapa aparece acá cuando se carga el enlace de Google Maps
                    desde el panel, en Configuración del sitio.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl bg-arena-100 p-7">
              <h2 className="font-display text-xl">¿Preferís que te escribamos?</h2>
              <p className="mt-2 text-[0.95rem] text-tinta-600">
                Mandanos un mail con tu nombre, a dónde querés ir, cuántas
                personas son y las fechas que tenés en mente. Te contestamos con
                una propuesta armada.
              </p>
              {config.email && (
                <a
                  href={`mailto:${config.email}?subject=${encodeURIComponent(
                    "Consulta desde la web",
                  )}&body=${encodeURIComponent(
                    "Hola Palma Travel:\n\nMi nombre es: \nQuiero viajar a: \nSomos (cantidad de personas): \nFechas aproximadas: \nPresupuesto por persona: \n\nGracias.",
                  )}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-palma-900/8 px-5 py-2.5 font-medium text-palma-800 transition-colors hover:bg-palma-900/14"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  Escribir un mail
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Dato({
  icono: Icono,
  etiqueta,
  children,
}: {
  icono: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  etiqueta: string;
  children: React.ReactNode;
}) {
  /* `dt` y `dd` van directo dentro de este div, que es lo único que una
     lista de definiciones acepta entre medio. El ícono vive dentro
     del `dt` para no romper esa estructura. */
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4">
      <dt className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold tracking-wide text-tinta-500 uppercase">
        <Icono className="size-5 shrink-0 text-palma-600" aria-hidden={true} />
        <span>{etiqueta}</span>
      </dt>
      <dd className="col-start-2 mt-1 text-[0.95rem] text-tinta-700">{children}</dd>
    </div>
  );
}
