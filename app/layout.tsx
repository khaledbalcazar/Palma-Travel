import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { SITIO } from "@/config/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} — ${SITIO.eslogan}`,
    template: `%s · ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  openGraph: {
    type: "website",
    locale: SITIO.locale,
    siteName: SITIO.nombre,
    title: `${SITIO.nombre} — ${SITIO.eslogan}`,
    description: SITIO.descripcion,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITIO.nombre} — ${SITIO.eslogan}`,
    description: SITIO.descripcion,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f3d33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PY" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="solo-lectores focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-palma-800 focus:px-5 focus:py-3 focus:text-arena-50"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
