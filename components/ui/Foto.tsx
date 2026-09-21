import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/* Envoltorio de next/image para todas las fotos del sitio.
   Centraliza el tamaño por defecto y el fondo mientras carga. */
export function Foto({
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px",
  ...props
}: ImageProps) {
  return (
    <Image
      className={cn("bg-arena-200 object-cover", className)}
      sizes={sizes}
      {...props}
    />
  );
}
