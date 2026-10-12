"use client";

import { usePathname } from "next/navigation";

export function MarcoHeader({ children }: { children: React.ReactNode }) {
  const inicio = usePathname() === "/";
  return <header data-sitio className={`cabecera-sitio${inicio ? " cabecera-inicio" : ""}`}>{children}</header>;
}
