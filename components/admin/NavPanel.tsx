"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Luggage,
  FileHeart,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", etiqueta: "Inicio", icono: LayoutDashboard, soloAdmin: false },
  { href: "/admin/paquetes", etiqueta: "Paquetes", icono: Luggage, soloAdmin: false },
  { href: "/admin/propuestas", etiqueta: "Propuestas", icono: FileHeart, soloAdmin: false },
  { href: "/admin/configuracion", etiqueta: "Configuración", icono: Settings, soloAdmin: true },
  { href: "/admin/usuarios", etiqueta: "Usuarios", icono: Users, soloAdmin: true },
] as const;

export function NavPanel({ esAdmin }: { esAdmin: boolean }) {
  const ruta = usePathname();
  const visibles = ITEMS.filter((i) => !i.soloAdmin || esAdmin);

  return (
    <nav aria-label="Secciones del panel">
      {/* En el celular: barra fija abajo, cómoda para el pulgar */}
      <ul className="fixed inset-x-0 bottom-0 z-30 flex border-t border-palma-900/10 bg-arena-50 md:static md:flex-col md:gap-1 md:border-0 md:bg-transparent">
        {visibles.map((item) => {
          const activo =
            item.href === "/admin" ? ruta === "/admin" : ruta.startsWith(item.href);
          const Icono = item.icono;
          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-[0.7rem] font-medium transition-colors",
                  "md:flex-row md:gap-3 md:rounded-lg md:px-3.5 md:py-2.5 md:text-[0.95rem]",
                  activo
                    ? "text-palma-800 md:bg-palma-800 md:text-arena-50"
                    : "text-tinta-500 hover:text-palma-800 md:hover:bg-palma-900/6",
                )}
              >
                <Icono className="size-5 shrink-0 md:size-4.5" aria-hidden="true" />
                {item.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
