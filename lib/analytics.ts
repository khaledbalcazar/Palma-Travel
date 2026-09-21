"use client";

/* ===================================================================
   ANALÍTICA
   Los eventos se mandan a Google Analytics 4 y al píxel de Meta, si
   están configurados. Si no hay identificadores en las variables de
   entorno, no se carga nada y estas funciones no hacen nada.
   =================================================================== */

export type Evento =
  | "ver_paquete"
  | "inicio_cuestionario"
  | "fin_cuestionario"
  | "click_whatsapp"
  | "compartir";

type Datos = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function registrarEvento(evento: Evento, datos: Datos = {}) {
  if (typeof window === "undefined") return;

  const limpios = Object.fromEntries(
    Object.entries(datos).filter(([, v]) => v !== undefined),
  );

  try {
    window.gtag?.("event", evento, limpios);
  } catch {
    /* si la analítica falla, el sitio sigue funcionando igual */
  }

  try {
    window.fbq?.("trackCustom", evento, limpios);
  } catch {
    /* ídem */
  }
}
