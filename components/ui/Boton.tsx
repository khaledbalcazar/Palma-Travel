import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "fantasma" | "whatsapp";
type Tamano = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-palma-800 text-arena-50 hover:bg-palma-700 active:bg-palma-900 shadow-suave",
  secundario:
    "bg-arena-100 text-palma-900 ring-1 ring-inset ring-palma-900/12 hover:bg-arena-200",
  fantasma:
    "bg-transparent text-palma-900 ring-1 ring-inset ring-palma-900/20 hover:bg-palma-900/5",
  whatsapp:
    "bg-whatsapp text-white hover:bg-whatsapp-dark shadow-suave font-semibold",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

export function estiloBoton({
  variante = "primario",
  tamano = "md",
  className,
}: {
  variante?: Variante;
  tamano?: Tamano;
  className?: string;
} = {}) {
  return cn(base, VARIANTES[variante], TAMANOS[tamano], className);
}

export function Boton({
  variante,
  tamano,
  className,
  children,
  ...props
}: ComponentProps<"button"> & {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
}) {
  return (
    <button className={estiloBoton({ variante, tamano, className })} {...props}>
      {children}
    </button>
  );
}

export function BotonLink({
  variante,
  tamano,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
}) {
  return (
    <Link className={estiloBoton({ variante, tamano, className })} {...props}>
      {children}
    </Link>
  );
}
