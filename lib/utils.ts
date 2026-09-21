import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta clases de Tailwind resolviendo las que se pisan entre sí. */
export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}

/** Convierte un título en un enlace corto: "Río de Janeiro!" → "rio-de-janeiro" */
export function aSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
