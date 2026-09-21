import { ImageResponse } from "next/og";
import { getPaquete, getPaquetes } from "@/lib/data";
import { duracion, precioUSD } from "@/lib/format";
import { SITIO } from "@/config/site";

/* Imagen que se ve cuando alguien manda el enlace por WhatsApp,
   Instagram o Facebook. Se arma sola con los datos del paquete. */

export const alt = "Paquete de viaje de Palma Travel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const paquetes = await getPaquetes();
  return paquetes.map((p) => ({ slug: p.slug }));
}

/** Solo sirven las fotos que son una dirección web y no un SVG: el
 *  generador de imágenes no dibuja SVG ni rutas del propio sitio. */
function fotoUsable(src: string): string | null {
  if (!src.startsWith("http")) return null;
  if (src.toLowerCase().includes(".svg")) return null;
  return src;
}

export default async function Imagen({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paquete = await getPaquete(slug);

  if (!paquete) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f3d33",
            color: "#f2e6d4",
            fontSize: 64,
          }}
        >
          {SITIO.nombre}
        </div>
      ),
      size,
    );
  }

  const foto = fotoUsable(paquete.imagenPortada.src);

  const etiquetas = [
    paquete.incluyeVuelo ? "Vuelo incluido" : "Sin vuelo",
    duracion(paquete.duracionDias, paquete.duracionNoches),
    paquete.salidaGrupal ? "Salida grupal" : null,
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: foto
            ? "#0a2b24"
            : "linear-gradient(135deg, #0f3d33 0%, #1d5c4d 55%, #2b7563 100%)",
          color: "#f2e6d4",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {foto && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto}
              alt=""
              width={1200}
              height={630}
              style={{
                position: "absolute",
                inset: 0,
                width: 1200,
                height: 630,
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: 1200,
                height: 630,
                background:
                  "linear-gradient(to top, rgba(10,43,36,0.95) 15%, rgba(10,43,36,0.55) 60%, rgba(10,43,36,0.25) 100%)",
              }}
            />
          </>
        )}

        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "#e56b4e",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
              {SITIO.nombre}
            </span>
            <span style={{ fontSize: 19, color: "#d8bc94" }}>
              {SITIO.eslogan}
            </span>
          </div>
        </div>

        {/* Datos del viaje */}
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <span
            style={{
              fontSize: 24,
              color: "#d8bc94",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {paquete.destino} · {paquete.pais}
          </span>

          <span
            style={{
              fontSize: paquete.titulo.length > 55 ? 56 : 68,
              fontWeight: 700,
              lineHeight: 1.08,
              marginTop: 14,
              maxWidth: 1000,
              letterSpacing: -1.5,
            }}
          >
            {paquete.titulo}
          </span>

          <div
            style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30 }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                background: "#e56b4e",
                color: "#ffffff",
                padding: "12px 26px",
                borderRadius: 999,
              }}
            >
              Desde {precioUSD(paquete.precioDesde)}
            </span>

            {etiquetas.map((etiqueta) => (
              <span
                key={etiqueta}
                style={{
                  fontSize: 24,
                  color: "#f2e6d4",
                  border: "2px solid rgba(242,230,212,0.4)",
                  padding: "10px 22px",
                  borderRadius: 999,
                }}
              >
                {etiqueta}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
