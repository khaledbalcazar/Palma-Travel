import "server-only";
import { clienteServidor } from "@/lib/supabase/servidor";
import { paqueteDeFila, propuestaDeFila } from "@/lib/supabase/mapeo";
import type { FilaPaquete, FilaPropuesta } from "@/lib/supabase/tipos";
import { perfilSchema, type PaqueteRegistro, type Perfil, type PropuestaRegistro } from "@/lib/schema";

/* Lecturas del panel: van con la sesión del usuario, así las políticas
   de seguridad de la base deciden qué puede ver cada uno. */

export async function listarPaquetes(): Promise<PaqueteRegistro[]> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .order("actualizado_en", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los paquetes: ${error.message}`);
  return (data as FilaPaquete[]).flatMap((f) => {
    try {
      return [paqueteDeFila(f)];
    } catch (e) {
      console.error(`[panel] El paquete "${f.slug}" tiene datos inválidos:`, e);
      return [];
    }
  });
}

export async function obtenerPaquete(id: string): Promise<PaqueteRegistro | null> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el paquete: ${error.message}`);
  return data ? paqueteDeFila(data as FilaPaquete) : null;
}

export async function listarPropuestas(): Promise<PropuestaRegistro[]> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("propuestas")
    .select("*")
    .order("actualizado_en", { ascending: false });

  if (error) throw new Error(`No se pudieron leer las propuestas: ${error.message}`);
  return (data as FilaPropuesta[]).flatMap((f) => {
    try {
      return [propuestaDeFila(f)];
    } catch (e) {
      console.error(`[panel] La propuesta "${f.slug}" tiene datos inválidos:`, e);
      return [];
    }
  });
}

export async function obtenerPropuesta(id: string): Promise<PropuestaRegistro | null> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("propuestas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la propuesta: ${error.message}`);
  return data ? propuestaDeFila(data as FilaPropuesta) : null;
}

export async function listarPerfiles(): Promise<Perfil[]> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from("perfiles")
    .select("id, email, nombre, rol, activo")
    .order("creado_en", { ascending: true });

  if (error) throw new Error(`No se pudieron leer los usuarios: ${error.message}`);
  return (data ?? []).flatMap((fila) => {
    const r = perfilSchema.safeParse(fila);
    return r.success ? [r.data] : [];
  });
}
