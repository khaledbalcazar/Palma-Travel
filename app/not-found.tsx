import Link from "next/link";
import { estiloBoton } from "@/components/ui/Boton";
import { Logo } from "@/components/site/Logo";

export default function NoEncontrado() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-20 text-center">
      <Link href="/" className="text-palma-900">
        <Logo />
      </Link>

      <h1 className="mt-10 font-display text-4xl md:text-5xl">
        Esta página no existe
      </h1>
      <p className="mt-4 max-w-md text-tinta-600">
        Puede que el enlace esté mal escrito, o que el viaje que buscabas ya no
        esté publicado. Si te lo pasaron por WhatsApp, pedile a quien te lo mandó
        que te lo reenvíe.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/paquetes" className={estiloBoton({ tamano: "lg" })}>
          Ver todos los viajes
        </Link>
        <Link
          href="/"
          className={estiloBoton({ variante: "fantasma", tamano: "lg" })}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
