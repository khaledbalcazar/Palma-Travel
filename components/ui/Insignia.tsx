import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tono = "neutro" | "palma" | "coral" | "arena" | "oscuro" | "aviso";

const TONOS: Record<Tono, string> = {
  neutro: "bg-tinta-100 text-tinta-700",
  palma: "bg-palma-100 text-palma-800",
  coral: "bg-coral-100 text-coral-800",
  arena: "bg-arena-200 text-arena-900",
  oscuro: "bg-palma-900/85 text-arena-50 backdrop-blur-sm",
  aviso: "bg-coral-600 text-white",
};

export function Insignia({
  tono = "neutro",
  children,
  className,
  icono,
}: {
  tono?: Tono;
  children: ReactNode;
  className?: string;
  icono?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONOS[tono],
        className,
      )}
    >
      {icono}
      {children}
    </span>
  );
}
