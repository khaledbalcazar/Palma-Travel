"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { ETIQUETA_ROL, ROLES, type Perfil, type Rol } from "@/lib/schema";
import {
  cambiarActivoUsuario,
  cambiarRolUsuario,
  invitarUsuario,
} from "@/lib/admin/acciones";
import { cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";
import { CampoSelect, CampoTexto } from "@/components/admin/Campos";

export function GestionUsuarios({
  usuarios,
  idPropio,
}: {
  usuarios: Perfil[];
  idPropio: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<Rol>("editor");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [trabajando, empezar] = useTransition();

  const ejecutar = (accion: () => Promise<{ ok: boolean; mensaje?: string }>) =>
    empezar(async () => {
      const r = await accion();
      setAviso({ tipo: r.ok ? "ok" : "error", texto: r.mensaje ?? "" });
      router.refresh();
    });

  return (
    <>
      {aviso && aviso.texto && (
        <p
          role={aviso.tipo === "error" ? "alert" : "status"}
          className={cn(
            "mb-5 rounded-xl px-4 py-3 text-sm",
            aviso.tipo === "ok"
              ? "bg-palma-100 text-palma-800"
              : "bg-coral-100 text-coral-800",
          )}
        >
          {aviso.texto}
        </p>
      )}

      <section className="mb-8 rounded-2xl bg-arena-50 p-5 md:p-7">
        <h2 className="font-display text-xl text-palma-900">Invitar a alguien</h2>
        <p className="mt-1 text-sm text-tinta-600">
          Le mandamos un email con un enlace para que entre y elija su
          contraseña. No hay registro abierto: solo entra quien es invitado.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrores({});
            empezar(async () => {
              const r = await invitarUsuario({ email, nombre, rol });
              if (r.ok) {
                setEmail("");
                setNombre("");
                setAviso({ tipo: "ok", texto: r.mensaje ?? "Invitación enviada." });
                router.refresh();
              } else {
                setErrores(r.errores ?? {});
                setAviso({ tipo: "error", texto: r.mensaje });
              }
            });
          }}
          className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <CampoTexto
            id="invitar-nombre"
            etiqueta="Nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errores.nombre}
          />
          <CampoTexto
            id="invitar-email"
            etiqueta="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errores.email}
          />
          <CampoSelect
            id="invitar-rol"
            etiqueta="Permisos"
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
            opciones={ROLES.map((r) => ({ valor: r, etiqueta: ETIQUETA_ROL[r] }))}
            error={errores.rol}
          />
          <Boton type="submit" disabled={trabajando} className="sm:col-span-3 sm:w-fit">
            {trabajando ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="size-4" aria-hidden="true" />
            )}
            Mandar la invitación
          </Boton>
        </form>

        <p className="mt-4 text-xs text-tinta-500">
          <strong>Administrador</strong>: puede todo, incluida la configuración
          del sitio y los usuarios. <strong>Editor</strong>: carga y edita
          paquetes y propuestas.
        </p>
      </section>

      <h2 className="font-display text-xl text-palma-900">Equipo</h2>
      <ul className="mt-3 space-y-3">
        {usuarios.map((u) => (
          <li
            key={u.id}
            className="flex flex-col gap-3 rounded-2xl bg-arena-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-palma-900">
                {u.nombre || u.email.split("@")[0]}
                {u.id === idPropio && (
                  <span className="ml-2 text-xs font-normal text-tinta-400">
                    (vos)
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-tinta-500">{u.email}</p>
              {!u.activo && (
                <p className="mt-1 inline-block rounded-full bg-coral-100 px-2.5 py-0.5 text-xs text-coral-800">
                  Desactivado
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={u.rol}
                disabled={trabajando || u.id === idPropio}
                onChange={(e) =>
                  ejecutar(() => cambiarRolUsuario(u.id, e.target.value as Rol))
                }
                aria-label={`Permisos de ${u.email}`}
                className="rounded-full border border-palma-900/15 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ETIQUETA_ROL[r]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={trabajando || u.id === idPropio}
                onClick={() => ejecutar(() => cambiarActivoUsuario(u.id, !u.activo))}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-40",
                  u.activo
                    ? "text-coral-700 hover:bg-coral-500/12"
                    : "bg-palma-900/8 text-palma-800 hover:bg-palma-900/14",
                )}
              >
                {u.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
