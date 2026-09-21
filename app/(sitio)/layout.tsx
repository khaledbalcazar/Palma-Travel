import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

/* Marco del sitio público: encabezado, contenido y pie. */
export default function LayoutSitio({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#contenido"
        className="solo-lectores focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-palma-800 focus:px-5 focus:py-3 focus:text-arena-50"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
    </>
  );
}
