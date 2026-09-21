import "server-only";
import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/servidor";
import { perfilSchema, type Perfil } from "@/lib/schema";

/* ===================================================================
   QUIÉN ESTÁ USANDO EL PANEL
   =================================================================== */

export type UsuarioPanel = Perfil & { nombreVisible: string };

/** ¿Están cargadas las claves de Supabase? */
export const hayBaseConfigurada = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

/** Devuelve el usuario logueado, o null.
 *  Si todavía no hay base configurada devuelve null en vez de romperse:
 *  así la pantalla que explica cómo configurarla se puede mostrar. */
export async function usuarioActual(): Promise<UsuarioPanel | null> {
  if (!hayBaseConfigurada()) return null;

  const supabase = await clienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("id, email, nombre, rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  const resultado = perfilSchema.safeParse(
    data ?? { id: user.id, email: user.email, nombre: "", rol: "editor", activo: false },
  );
  if (!resultado.success) return null;

  const perfil = resultado.data;
  return {
    ...perfil,
    nombreVisible: perfil.nombre || perfil.email.split("@")[0]!,
  };
}

/** Exige que haya alguien logueado y activo. Si no, manda al login. */
export async function exigirSesion(): Promise<UsuarioPanel> {
  if (!hayBaseConfigurada()) redirect("/admin/configurar");
  const usuario = await usuarioActual();
  if (!usuario) redirect("/admin/login");
  if (!usuario.activo) redirect("/admin/login?motivo=desactivado");
  return usuario;
}

/** Exige rol de administrador. */
export async function exigirAdmin(): Promise<UsuarioPanel> {
  const usuario = await exigirSesion();
  if (usuario.rol !== "admin") redirect("/admin?motivo=sin-permiso");
  return usuario;
}

/** Datos de quién edita, para dejar registrado en cada paquete. */
export const firmaDe = (u: UsuarioPanel) => ({ id: u.id, nombre: u.nombreVisible });
