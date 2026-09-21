import Link from "next/link";
import { CalendarClock, FileHeart, Luggage, Plus, TriangleAlert } from "lucide-react";
import { exigirSesion } from "@/lib/admin/sesion";
import { listarPaquetes, listarPropuestas } from "@/lib/admin/datos";
import { diasHasta, fechaCorta, hoyISO } from "@/lib/format";
import { EncabezadoPanel } from "@/components/admin/Encabezado";
import { estiloBoton } from "@/components/ui/Boton";

export const metadata = { title: "Inicio" };

const AVISO_DIAS = 15;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const usuario = await exigirSesion();
  const { motivo } = await searchParams;

  const [paquetes, propuestas] = await Promise.all([
    listarPaquetes(),
    listarPropuestas(),
  ]);

  const hoy = hoyISO();
  const activos = paquetes.filter((p) => p.estado === "activo");

  /* Por vencer: el precio o la próxima salida caen dentro de 15 días */
  const porVencer = paquetes
    .map((p) => {
      const motivos: string[] = [];

      if (p.vigenciaPrecio) {
        const d = diasHasta(p.vigenciaPrecio);
        if (d >= 0 && d <= AVISO_DIAS)
          motivos.push(`el precio vale hasta el ${fechaCorta(p.vigenciaPrecio)}`);
        else if (d < 0)
          motivos.push(`el precio venció el ${fechaCorta(p.vigenciaPrecio)}`);
      }

      if (p.fechasSalida !== "flexible") {
        const proxima = p.fechasSalida.filter((f) => f >= hoy).sort()[0];
        if (proxima) {
          const d = diasHasta(proxima);
          if (d >= 0 && d <= AVISO_DIAS)
            motivos.push(`sale el ${fechaCorta(proxima)}`);
        } else {
          motivos.push("ya pasaron todas las fechas de salida");
        }
      }

      return { paquete: p, motivos };
    })
    .filter((x) => x.motivos.length > 0 && x.paquete.estado !== "oculto");

  const vigentes = propuestas.filter((p) => p.validaHasta >= hoy);
  const vencidas = propuestas.filter((p) => p.validaHasta < hoy);

  return (
    <div className="px-5 py-7 md:px-8">
      <EncabezadoPanel
        titulo={`Hola, ${usuario.nombreVisible}`}
        descripcion="Esto es lo que está pasando con el sitio hoy."
        acciones={
          <>
            <Link href="/admin/paquetes/nuevo" className={estiloBoton()}>
              <Plus className="size-4" aria-hidden="true" />
              Paquete nuevo
            </Link>
            <Link
              href="/admin/propuestas/nuevo"
              className={estiloBoton({ variante: "secundario" })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Propuesta nueva
            </Link>
          </>
        }
      />

      {motivo === "sin-permiso" && (
        <p role="alert" className="mb-6 rounded-xl bg-coral-100 px-4 py-3 text-sm text-coral-800">
          Esa sección es solo para administradores. Pedile a alguien con ese
          permiso que la abra por vos.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Tarjeta
          href="/admin/paquetes"
          icono={<Luggage className="size-5" aria-hidden="true" />}
          numero={activos.length}
          etiqueta={activos.length === 1 ? "paquete activo" : "paquetes activos"}
          detalle={`${paquetes.length} en total`}
        />
        <Tarjeta
          href="/admin/propuestas"
          icono={<FileHeart className="size-5" aria-hidden="true" />}
          numero={vigentes.length}
          etiqueta={vigentes.length === 1 ? "propuesta vigente" : "propuestas vigentes"}
          detalle={`${vencidas.length} vencidas`}
        />
        <Tarjeta
          href="/admin/paquetes"
          icono={<CalendarClock className="size-5" aria-hidden="true" />}
          numero={porVencer.length}
          etiqueta="para revisar"
          detalle={`precios o salidas en ${AVISO_DIAS} días`}
          alerta={porVencer.length > 0}
        />
      </div>

      {porVencer.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-xl text-palma-900">
            <TriangleAlert className="size-5 text-coral-600" aria-hidden="true" />
            Para revisar pronto
          </h2>
          <ul className="mt-3 space-y-2">
            {porVencer.map(({ paquete, motivos }) => (
              <li key={paquete.id} className="rounded-xl bg-arena-50 p-4">
                <Link
                  href={`/admin/paquetes/${paquete.id}`}
                  className="font-medium text-palma-900 hover:underline"
                >
                  {paquete.titulo}
                </Link>
                <p className="mt-0.5 text-sm text-tinta-600">
                  {motivos.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {vencidas.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-palma-900">
            Propuestas vencidas
          </h2>
          <p className="mt-1 text-sm text-tinta-500">
            Sus páginas siguen abriendo, pero avisan que la propuesta venció y
            proponen escribir por WhatsApp.
          </p>
          <ul className="mt-3 space-y-2">
            {vencidas.slice(0, 8).map((p) => (
              <li key={p.id} className="rounded-xl bg-arena-50 p-4">
                <Link
                  href={`/admin/propuestas/${p.id}`}
                  className="font-medium text-palma-900 hover:underline"
                >
                  {p.clienteNombre} — {p.titulo}
                </Link>
                <p className="mt-0.5 text-sm text-tinta-600">
                  Venció el {fechaCorta(p.validaHasta)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Tarjeta({
  href,
  icono,
  numero,
  etiqueta,
  detalle,
  alerta,
}: {
  href: string;
  icono: React.ReactNode;
  numero: number;
  etiqueta: string;
  detalle: string;
  alerta?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl p-5 transition-colors ${
        alerta ? "bg-coral-100 hover:bg-coral-200" : "bg-arena-50 hover:bg-arena-200"
      }`}
    >
      <span className={alerta ? "text-coral-700" : "text-palma-700"}>{icono}</span>
      <p className="mt-3 font-display text-3xl text-palma-900">{numero}</p>
      <p className="text-[0.95rem] text-tinta-700">{etiqueta}</p>
      <p className="mt-0.5 text-xs text-tinta-500">{detalle}</p>
    </Link>
  );
}
