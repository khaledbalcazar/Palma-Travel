"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import {
  ESTADOS,
  invitacionSchema,
  paqueteValidadoSchema,
  propuestaValidadaSchema,
  siteConfigSchema,
  type Estado,
  type Paquete,
  type Propuesta,
  type Rol,
} from "@/lib/schema";
import { CONFIG_POR_DEFECTO } from "@/config/site";
import { exigirAdmin, exigirSesion, firmaDe } from "@/lib/admin/sesion";
import { clienteServidor } from "@/lib/supabase/servidor";
import { clienteAdmin } from "@/lib/supabase/admin";
import { paqueteAFila, propuestaAFila } from "@/lib/supabase/mapeo";
import {
  ETIQUETA_CONFIG,
  ETIQUETA_PAQUETES,
  ETIQUETA_PROPUESTAS,
} from "@/lib/supabase/consultas";
import { aSlug } from "@/lib/utils";

/* ===================================================================
   ACCIONES DEL PANEL
   Todo lo que guarda o borra pasa por acá. Cada acción:
     1. verifica quién es la persona que la ejecuta,
     2. valida los datos con el mismo schema que usa el sitio público,
     3. guarda,
     4. refresca las páginas afectadas para que el cambio se vea enseguida.
   =================================================================== */

export type Resultado =
  | { ok: true; id?: string; slug?: string; mensaje?: string }
  | { ok: false; mensaje: string; errores?: Record<string, string> };

/** Convierte los errores de Zod en un mapa campo → mensaje en español. */
function aErrores(error: z.ZodError): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const issue of error.issues) {
    const clave = issue.path.join(".") || "_";
    mapa[clave] ??= issue.message;
  }
  return mapa;
}

function refrescarPaquetes(slug?: string) {
  revalidateTag(ETIQUETA_PAQUETES);
  revalidatePath("/");
  revalidatePath("/paquetes");
  revalidatePath("/encontra-tu-viaje");
  if (slug) revalidatePath(`/paquetes/${slug}`);
  revalidatePath("/sitemap.xml");
}

function refrescarPropuestas(slug?: string) {
  revalidateTag(ETIQUETA_PROPUESTAS);
  if (slug) revalidatePath(`/propuesta/${slug}`);
}

/* ------------------------------------------------------------------
   Paquetes
   ------------------------------------------------------------------ */

export async function guardarPaquete(
  datos: unknown,
  id?: string,
): Promise<Resultado> {
  const usuario = await exigirSesion();

  const validado = paqueteValidadoSchema.safeParse(datos);
  if (!validado.success) {
    return {
      ok: false,
      mensaje: "Hay campos con errores. Revisá lo que está marcado en rojo.",
      errores: aErrores(validado.error),
    };
  }

  const paquete = validado.data as Paquete;
  const supabase = await clienteServidor();
  const fila = paqueteAFila(paquete, firmaDe(usuario));

  const { data, error } = id
    ? await supabase.from("paquetes").update(fila).eq("id", id).select("id").single()
    : await supabase.from("paquetes").insert(fila).select("id").single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };

  refrescarPaquetes(paquete.slug);
  return {
    ok: true,
    id: data.id as string,
    slug: paquete.slug,
    mensaje: "Paquete guardado.",
  };
}

export async function cambiarEstadoPaquete(
  id: string,
  estado: Estado,
): Promise<Resultado> {
  const usuario = await exigirSesion();
  if (!ESTADOS.includes(estado)) {
    return { ok: false, mensaje: "Ese estado no existe." };
  }

  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("paquetes")
    .update({
      estado,
      actualizado_por: usuario.id,
      actualizado_por_nombre: usuario.nombreVisible,
    })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPaquetes(data.slug as string);
  return { ok: true, mensaje: "Estado actualizado." };
}

export async function alternarDestacado(
  id: string,
  destacado: boolean,
): Promise<Resultado> {
  const usuario = await exigirSesion();
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("paquetes")
    .update({
      destacado,
      actualizado_por: usuario.id,
      actualizado_por_nombre: usuario.nombreVisible,
    })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPaquetes(data.slug as string);
  return { ok: true, mensaje: destacado ? "Marcado como destacado." : "Ya no es destacado." };
}

export async function duplicarPaquete(id: string): Promise<Resultado> {
  const usuario = await exigirSesion();
  const supabase = await clienteServidor();

  const { data: original, error: errorLectura } = await supabase
    .from("paquetes")
    .select("*")
    .eq("id", id)
    .single();

  if (errorLectura) return { ok: false, mensaje: traducirErrorBase(errorLectura.message) };

  const {
    id: _id,
    creado_en: _creado,
    actualizado_en: _actualizado,
    ...resto
  } = original as Record<string, unknown> & { id: string };

  const copia = {
    ...resto,
    slug: await slugLibre(supabase, "paquetes", `${resto.slug as string}-copia`),
    titulo: `${resto.titulo as string} (copia)`,
    estado: "oculto",
    destacado: false,
    actualizado_por: usuario.id,
    actualizado_por_nombre: usuario.nombreVisible,
  };

  const { data, error } = await supabase
    .from("paquetes")
    .insert(copia)
    .select("id")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPaquetes();
  return {
    ok: true,
    id: data.id as string,
    mensaje: "Se creó una copia, oculta y lista para editar.",
  };
}

export async function borrarPaquete(id: string): Promise<Resultado> {
  await exigirSesion();
  const supabase = await clienteServidor();

  const { data, error } = await supabase
    .from("paquetes")
    .delete()
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPaquetes(data.slug as string);
  return { ok: true, mensaje: "Paquete eliminado." };
}

/* ------------------------------------------------------------------
   Propuestas personalizadas
   ------------------------------------------------------------------ */

export async function guardarPropuesta(
  datos: unknown,
  id?: string,
): Promise<Resultado> {
  const usuario = await exigirSesion();

  const validado = propuestaValidadaSchema.safeParse(datos);
  if (!validado.success) {
    return {
      ok: false,
      mensaje: "Hay campos con errores. Revisá lo que está marcado en rojo.",
      errores: aErrores(validado.error),
    };
  }

  const propuesta = validado.data as Propuesta;
  const supabase = await clienteServidor();
  const fila = propuestaAFila(propuesta, firmaDe(usuario));

  const { data, error } = id
    ? await supabase.from("propuestas").update(fila).eq("id", id).select("id").single()
    : await supabase.from("propuestas").insert(fila).select("id").single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };

  refrescarPropuestas(propuesta.slug);
  return {
    ok: true,
    id: data.id as string,
    slug: propuesta.slug,
    mensaje: "Propuesta guardada.",
  };
}

export async function borrarPropuesta(id: string): Promise<Resultado> {
  await exigirSesion();
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("propuestas")
    .delete()
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPropuestas(data.slug as string);
  return { ok: true, mensaje: "Propuesta eliminada." };
}

export async function duplicarPropuesta(id: string): Promise<Resultado> {
  const usuario = await exigirSesion();
  const supabase = await clienteServidor();

  const { data: original, error: errorLectura } = await supabase
    .from("propuestas")
    .select("*")
    .eq("id", id)
    .single();

  if (errorLectura) return { ok: false, mensaje: traducirErrorBase(errorLectura.message) };

  const {
    id: _id,
    creado_en: _creado,
    actualizado_en: _actualizado,
    ...resto
  } = original as Record<string, unknown> & { id: string };

  const { data, error } = await supabase
    .from("propuestas")
    .insert({
      ...resto,
      slug: await slugLibre(supabase, "propuestas", `${resto.slug as string}-copia`),
      actualizado_por: usuario.id,
      actualizado_por_nombre: usuario.nombreVisible,
    })
    .select("id")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPropuestas();
  return { ok: true, id: data.id as string, mensaje: "Se creó una copia." };
}

/** Arranca una propuesta nueva copiando todos los datos de un paquete. */
export async function propuestaDesdePaquete(
  idPaquete: string,
  clienteNombre: string,
  validaHasta: string,
): Promise<Resultado> {
  const usuario = await exigirSesion();

  const datosCliente = z
    .object({
      clienteNombre: z.string().trim().min(1, "Escribí el nombre del cliente."),
      validaHasta: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Elegí hasta cuándo vale la propuesta."),
    })
    .safeParse({ clienteNombre, validaHasta });

  if (!datosCliente.success) {
    return {
      ok: false,
      mensaje: "Faltan datos del cliente.",
      errores: aErrores(datosCliente.error),
    };
  }

  const supabase = await clienteServidor();
  const { data: paquete, error: errorLectura } = await supabase
    .from("paquetes")
    .select("*")
    .eq("id", idPaquete)
    .single();

  if (errorLectura) return { ok: false, mensaje: traducirErrorBase(errorLectura.message) };

  const {
    id: _id,
    creado_en: _creado,
    actualizado_en: _actualizado,
    estado: _estado,
    destacado: _destacado,
    ...resto
  } = paquete as Record<string, unknown> & { id: string };

  const base = aSlug(`${datosCliente.data.clienteNombre}-${resto.destino as string}`);

  const { data, error } = await supabase
    .from("propuestas")
    .insert({
      ...resto,
      slug: await slugLibre(supabase, "propuestas", base),
      cliente_nombre: datosCliente.data.clienteNombre,
      valida_hasta: datosCliente.data.validaHasta,
      notas_internas: `Armada a partir del paquete "${resto.titulo as string}".`,
      actualizado_por: usuario.id,
      actualizado_por_nombre: usuario.nombreVisible,
    })
    .select("id")
    .single();

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };
  refrescarPropuestas();
  return {
    ok: true,
    id: data.id as string,
    mensaje: "Propuesta creada a partir del paquete.",
  };
}

/* ------------------------------------------------------------------
   Configuración del sitio (solo admin)
   ------------------------------------------------------------------ */

export async function guardarConfig(datos: unknown): Promise<Resultado> {
  const usuario = await exigirAdmin();

  const validado = siteConfigSchema.safeParse(datos);
  if (!validado.success) {
    return {
      ok: false,
      mensaje: "Hay campos con errores. Revisá lo que está marcado en rojo.",
      errores: aErrores(validado.error),
    };
  }

  const supabase = await clienteServidor();
  const { error } = await supabase
    .from("site_config")
    .update({ datos: validado.data, actualizado_por: usuario.id })
    .eq("id", 1);

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };

  revalidateTag(ETIQUETA_CONFIG);
  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Configuración guardada." };
}

export async function restaurarPesosMatch(): Promise<Resultado> {
  await exigirAdmin();
  const supabase = await clienteServidor();

  const { data } = await supabase
    .from("site_config")
    .select("datos")
    .eq("id", 1)
    .maybeSingle();

  const actuales = (data?.datos as Record<string, unknown>) ?? {};
  const { error } = await supabase
    .from("site_config")
    .update({ datos: { ...actuales, pesosMatch: CONFIG_POR_DEFECTO.pesosMatch } })
    .eq("id", 1);

  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };

  revalidateTag(ETIQUETA_CONFIG);
  revalidatePath("/encontra-tu-viaje");
  return { ok: true, mensaje: "Se restauraron los valores originales." };
}

/* ------------------------------------------------------------------
   Usuarios (solo admin)
   ------------------------------------------------------------------ */

export async function invitarUsuario(datos: unknown): Promise<Resultado> {
  await exigirAdmin();

  const validado = invitacionSchema.safeParse(datos);
  if (!validado.success) {
    return {
      ok: false,
      mensaje: "Revisá los datos de la invitación.",
      errores: aErrores(validado.error),
    };
  }

  const { email, nombre, rol } = validado.data;
  const admin = clienteAdmin();

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { nombre, rol },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin`,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already been registered")) {
      return { ok: false, mensaje: "Ese email ya tiene usuario en el panel." };
    }
    return { ok: false, mensaje: `No se pudo invitar: ${error.message}` };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true, mensaje: `Le mandamos la invitación a ${email}.` };
}

export async function cambiarRolUsuario(id: string, rol: Rol): Promise<Resultado> {
  const admin = await exigirAdmin();
  if (id === admin.id && rol !== "admin") {
    return {
      ok: false,
      mensaje: "No podés sacarte a vos mismo los permisos de administrador.",
    };
  }

  const supabase = await clienteServidor();
  const { error } = await supabase.from("perfiles").update({ rol }).eq("id", id);
  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };

  revalidatePath("/admin/usuarios");
  return { ok: true, mensaje: "Permisos actualizados." };
}

export async function cambiarActivoUsuario(
  id: string,
  activo: boolean,
): Promise<Resultado> {
  const admin = await exigirAdmin();
  if (id === admin.id && !activo) {
    return { ok: false, mensaje: "No podés desactivar tu propio usuario." };
  }

  const supabase = await clienteServidor();
  const { error } = await supabase.from("perfiles").update({ activo }).eq("id", id);
  if (error) return { ok: false, mensaje: traducirErrorBase(error.message) };

  revalidatePath("/admin/usuarios");
  return {
    ok: true,
    mensaje: activo ? "Usuario activado." : "Usuario desactivado.",
  };
}

/* ------------------------------------------------------------------
   Ayudas
   ------------------------------------------------------------------ */

/** Busca un slug que no esté usado, agregando -2, -3… si hace falta. */
async function slugLibre(
  supabase: Awaited<ReturnType<typeof clienteServidor>>,
  tabla: "paquetes" | "propuestas",
  base: string,
): Promise<string> {
  const limpio = aSlug(base) || "copia";
  for (let n = 0; n < 50; n++) {
    const candidato = n === 0 ? limpio : `${limpio}-${n + 1}`;
    const { data } = await supabase
      .from(tabla)
      .select("id")
      .eq("slug", candidato)
      .maybeSingle();
    if (!data) return candidato;
  }
  return `${limpio}-${Date.now().toString(36)}`;
}

/** Los errores de Postgres vienen en inglés y no le dicen nada a nadie. */
function traducirErrorBase(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("duplicate key") && m.includes("slug"))
    return "Ya existe otro con ese mismo enlace (slug). Cambiá el enlace y probá de nuevo.";
  if (m.includes("row-level security") || m.includes("violates row-level"))
    return "Tu usuario no tiene permiso para hacer esto. Pedile a un administrador que revise tus permisos.";
  if (m.includes("jwt") || m.includes("expired"))
    return "Se venció tu sesión. Volvé a entrar y probá otra vez.";
  return `No se pudo guardar: ${mensaje}`;
}
