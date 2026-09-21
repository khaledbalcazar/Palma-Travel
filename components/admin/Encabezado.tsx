import Link from "next/link";
import type { ReactNode } from "react";

export function EncabezadoPanel({
  titulo,
  descripcion,
  volverA,
  volverEtiqueta,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  volverA?: string;
  volverEtiqueta?: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-7">
      {volverA && (
        <Link
          href={volverA}
          className="text-sm text-tinta-500 underline-offset-4 hover:text-palma-800 hover:underline"
        >
          ← {volverEtiqueta ?? "Volver"}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-palma-900 md:text-3xl">
            {titulo}
          </h1>
          {descripcion && (
            <p className="mt-1.5 max-w-2xl text-[0.95rem] text-tinta-600">
              {descripcion}
            </p>
          )}
        </div>
        {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
      </div>
    </div>
  );
}
