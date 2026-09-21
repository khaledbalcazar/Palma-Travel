"use client";

import { useEffect } from "react";
import { registrarEvento } from "@/lib/analytics";

/* Avisa a la analítica que alguien abrió la página de un viaje. */
export function RegistrarVista({
  paquete,
  destino,
  precio,
}: {
  paquete: string;
  destino: string;
  precio: number;
}) {
  useEffect(() => {
    registrarEvento("ver_paquete", { paquete, destino, precio });
  }, [paquete, destino, precio]);

  return null;
}
