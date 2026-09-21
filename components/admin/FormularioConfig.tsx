"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { PESOS_MATCH_DEFAULT, type PesosMatch, type SiteConfig } from "@/lib/schema";
import { guardarConfig, restaurarPesosMatch } from "@/lib/admin/acciones";
import { precioGs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";
import { CampoArea, CampoInterruptor, CampoTexto } from "@/components/admin/Campos";

const NOMBRE_PESO: Record<keyof PesosMatch, string> = {
  tipoViaje: "Tipo de experiencia",
  presupuesto: "Presupuesto",
  duracion: "Cantidad de días",
  mes: "Mes de viaje",
  companiaViaje: "Con quién viaja",
  ritmo: "Ritmo",
  region: "Región",
  vuelo: "Que incluya vuelo",
};

export function FormularioConfig({ inicial }: { inicial: SiteConfig }) {
  const router = useRouter();
  const [datos, setDatos] = useState<SiteConfig>(inicial);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [guardando, empezar] = useTransition();

  const actualizar = <C extends keyof SiteConfig>(campo: C, valor: SiteConfig[C]) =>
    setDatos((a) => ({ ...a, [campo]: valor }));

  const actualizarPeso = (clave: keyof PesosMatch, valor: number) =>
    setDatos((a) => ({ ...a, pesosMatch: { ...a.pesosMatch, [clave]: valor } }));

  const totalPesos = Object.values(datos.pesosMatch).reduce((a, b) => a + b, 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setAviso(null);
        empezar(async () => {
          const r = await guardarConfig(datos);
          if (r.ok) {
            setErrores({});
            setAviso({ tipo: "ok", texto: r.mensaje ?? "Guardado." });
            router.refresh();
          } else {
            setErrores(r.errores ?? {});
            setAviso({ tipo: "error", texto: r.mensaje });
          }
        });
      }}
      className="space-y-8"
    >
      {aviso && (
        <p
          role={aviso.tipo === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            aviso.tipo === "ok"
              ? "bg-palma-100 text-palma-800"
              : "bg-coral-100 text-coral-800",
          )}
        >
          {aviso.texto}
        </p>
      )}

      <section className="rounded-2xl bg-arena-50 p-5 md:p-7">
        <h2 className="font-display text-xl text-palma-900">Contacto</h2>
        <p className="mt-1 text-sm text-tinta-600">
          Estos datos aparecen en el pie de página, en la página de contacto y en
          todos los botones de WhatsApp del sitio.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <CampoTexto
            id="whatsapp"
            etiqueta="WhatsApp"
            ayuda="Solo números, con código de país y sin el 0. El 0981 123 456 se escribe 595981123456."
            inputMode="numeric"
            value={datos.whatsapp}
            onChange={(e) => actualizar("whatsapp", e.target.value)}
            error={errores.whatsapp}
          />
          <CampoTexto
            id="email"
            etiqueta="Email"
            type="email"
            value={datos.email}
            onChange={(e) => actualizar("email", e.target.value)}
            error={errores.email}
          />
          <CampoTexto
            id="telefono"
            etiqueta="Teléfono fijo"
            value={datos.telefono}
            onChange={(e) => actualizar("telefono", e.target.value)}
            error={errores.telefono}
          />
          <CampoTexto
            id="registroSenatur"
            etiqueta="Registro SENATUR"
            ayuda="El número de registro de la agencia."
            value={datos.registroSenatur}
            onChange={(e) => actualizar("registroSenatur", e.target.value)}
            error={errores.registroSenatur}
          />
          <CampoTexto
            id="direccion"
            etiqueta="Dirección"
            value={datos.direccion}
            onChange={(e) => actualizar("direccion", e.target.value)}
            error={errores.direccion}
          />
          <CampoTexto
            id="ciudad"
            etiqueta="Ciudad"
            value={datos.ciudad}
            onChange={(e) => actualizar("ciudad", e.target.value)}
            error={errores.ciudad}
          />
          <CampoTexto
            id="mapsUrl"
            etiqueta="Enlace del mapa"
            ayuda="Pegá el enlace de Google Maps de la oficina."
            value={datos.mapsUrl}
            onChange={(e) => actualizar("mapsUrl", e.target.value)}
            error={errores.mapsUrl}
          />
          <CampoTexto
            id="instagram"
            etiqueta="Instagram"
            ayuda="Solo el usuario, sin la arroba."
            value={datos.instagram}
            onChange={(e) => actualizar("instagram", e.target.value)}
            error={errores.instagram}
          />
          <CampoTexto
            id="facebook"
            etiqueta="Facebook"
            ayuda="Solo el nombre de la página."
            value={datos.facebook}
            onChange={(e) => actualizar("facebook", e.target.value)}
            error={errores.facebook}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-arena-50 p-5 md:p-7">
        <h2 className="font-display text-xl text-palma-900">
          Textos de la página de inicio
        </h2>
        <div className="mt-5 space-y-5">
          <CampoTexto
            id="heroTitulo"
            etiqueta="Título grande"
            value={datos.heroTitulo}
            onChange={(e) => actualizar("heroTitulo", e.target.value)}
            error={errores.heroTitulo}
          />
          <CampoArea
            id="heroSubtitulo"
            etiqueta="Texto de abajo"
            rows={3}
            value={datos.heroSubtitulo}
            onChange={(e) => actualizar("heroSubtitulo", e.target.value)}
            error={errores.heroSubtitulo}
          />
          <CampoTexto
            id="heroImagen"
            etiqueta="Foto de fondo"
            ayuda="Dirección de la foto. Podés subir una desde cualquier paquete y pegar acá su dirección."
            value={datos.heroImagen}
            onChange={(e) => actualizar("heroImagen", e.target.value)}
            error={errores.heroImagen}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-arena-50 p-5 md:p-7">
        <h2 className="font-display text-xl text-palma-900">Precios</h2>
        <div className="mt-5 space-y-5">
          <CampoInterruptor
            id="mostrarPrecioEnGuaranies"
            etiqueta="Mostrar también el precio en guaraníes"
            ayuda="Debajo del precio en dólares se agrega el equivalente aproximado."
            checked={datos.mostrarPrecioEnGuaranies}
            onChange={(v) => actualizar("mostrarPrecioEnGuaranies", v)}
          />
          <CampoTexto
            id="tipoCambioUsdGs"
            etiqueta="Tipo de cambio (1 dólar en guaraníes)"
            type="number"
            min={1}
            value={datos.tipoCambioUsdGs}
            onChange={(e) => actualizar("tipoCambioUsdGs", Number(e.target.value))}
            error={errores.tipoCambioUsdGs}
          />
          {datos.mostrarPrecioEnGuaranies && datos.tipoCambioUsdGs > 0 && (
            <p className="text-sm text-tinta-600">
              Así se vería un paquete de USD 1.850:{" "}
              <strong>{precioGs(1850, datos.tipoCambioUsdGs)}</strong>
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-arena-50 p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-palma-900">
              Cuestionario «Encontrá tu viaje»
            </h2>
            <p className="mt-1 max-w-xl text-sm text-tinta-600">
              Cuánto pesa cada pregunta al calcular el porcentaje de coincidencia.
              Cuanto más alto el número, más manda esa pregunta en el resultado.
            </p>
          </div>
          <Boton
            type="button"
            variante="fantasma"
            tamano="sm"
            onClick={() =>
              empezar(async () => {
                const r = await restaurarPesosMatch();
                if (r.ok) {
                  setDatos((a) => ({ ...a, pesosMatch: PESOS_MATCH_DEFAULT }));
                  setAviso({ tipo: "ok", texto: r.mensaje ?? "Restaurado." });
                  router.refresh();
                } else {
                  setAviso({ tipo: "error", texto: r.mensaje });
                }
              })
            }
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restaurar
          </Boton>
        </div>

        <div className="mt-5 space-y-4">
          {(Object.keys(NOMBRE_PESO) as (keyof PesosMatch)[]).map((clave) => (
            <div key={clave}>
              <div className="flex items-center justify-between">
                <label htmlFor={`peso-${clave}`} className="text-sm font-medium text-tinta-700">
                  {NOMBRE_PESO[clave]}
                </label>
                <span className="text-sm tabular-nums text-tinta-500">
                  {datos.pesosMatch[clave]}
                  {totalPesos > 0 && (
                    <span className="ml-1.5 text-xs text-tinta-400">
                      ({Math.round((datos.pesosMatch[clave] / totalPesos) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <input
                id={`peso-${clave}`}
                type="range"
                min={0}
                max={50}
                value={datos.pesosMatch[clave]}
                onChange={(e) => actualizarPeso(clave, Number(e.target.value))}
                className="mt-1.5 w-full accent-palma-700"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-20 flex justify-end md:bottom-6">
        <Boton type="submit" disabled={guardando} tamano="lg">
          {guardando ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          Guardar la configuración
        </Boton>
      </div>
    </form>
  );
}
