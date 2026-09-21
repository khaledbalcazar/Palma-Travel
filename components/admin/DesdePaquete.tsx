"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";
import { propuestaDesdePaquete } from "@/lib/admin/acciones";
import { hoyISO } from "@/lib/format";
import { Boton } from "@/components/ui/Boton";

/* Atajo: copiar un paquete existente y ajustarlo para un cliente. */
export function DesdePaquete({
  paquetes,
}: {
  paquetes: { id: string; titulo: string; destino: string }[];
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [idPaquete, setIdPaquete] = useState(paquetes[0]?.id ?? "");
  const [cliente, setCliente] = useState("");
  const [validaHasta, setValidaHasta] = useState(enUnMes());
  const [error, setError] = useState<string | null>(null);
  const [creando, empezar] = useTransition();

  if (paquetes.length === 0) return null;

  return (
    <section className="mb-7 rounded-2xl bg-arena-50 p-5">
      {!abierto ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-palma-800 underline-offset-4 hover:underline"
        >
          <Wand2 className="size-4" aria-hidden="true" />
          Crear la propuesta a partir de un paquete que ya existe
        </button>
      ) : (
        <div>
          <h2 className="font-display text-lg text-palma-900">
            Copiar un paquete
          </h2>
          <p className="mt-1 text-sm text-tinta-600">
            Se copian el itinerario, las fotos y todo lo demás, y después lo
            ajustás para este cliente.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm">
              <span className="block font-medium text-tinta-700">Paquete</span>
              <select
                value={idPaquete}
                onChange={(e) => setIdPaquete(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-palma-900/15 bg-white px-3 py-2.5 text-[0.95rem]"
              >
                {paquetes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="block font-medium text-tinta-700">Cliente</span>
              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Familia González"
                className="mt-1.5 w-full rounded-lg border border-palma-900/15 bg-white px-3 py-2.5 text-[0.95rem] placeholder:text-tinta-300"
              />
            </label>

            <label className="text-sm">
              <span className="block font-medium text-tinta-700">Válida hasta</span>
              <input
                type="date"
                value={validaHasta}
                onChange={(e) => setValidaHasta(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-palma-900/15 bg-white px-3 py-2.5 text-[0.95rem]"
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-coral-100 px-4 py-2.5 text-sm text-coral-800">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <Boton
              type="button"
              disabled={creando}
              onClick={() =>
                empezar(async () => {
                  setError(null);
                  const r = await propuestaDesdePaquete(
                    idPaquete,
                    cliente,
                    validaHasta,
                  );
                  if (r.ok && r.id) router.push(`/admin/propuestas/${r.id}`);
                  else if (!r.ok) setError(r.mensaje);
                })
              }
            >
              {creando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Crear la copia
            </Boton>
            <Boton
              type="button"
              variante="fantasma"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </Boton>
          </div>
        </div>
      )}
    </section>
  );
}

function enUnMes(): string {
  const hoy = new Date(`${hoyISO()}T12:00:00`);
  hoy.setMonth(hoy.getMonth() + 1);
  return hoy.toISOString().slice(0, 10);
}
