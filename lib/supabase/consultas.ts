import "server-only";
import type { Paquete, Propuesta, SiteConfig } from "@/lib/schema";

/* Implementado en la fase de Supabase. La capa de datos solo carga este
   módulo cuando hay variables de entorno de Supabase configuradas. */

const noConfigurado = (): never => {
  throw new Error(
    "Supabase todavía no está configurado. Revisá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local.",
  );
};

export async function leerPaquetesDeSupabase(): Promise<Paquete[]> {
  return noConfigurado();
}

export async function leerPropuestasDeSupabase(): Promise<Propuesta[]> {
  return noConfigurado();
}

export async function leerPropuestaDeSupabase(
  _slug: string,
): Promise<Propuesta | null> {
  return noConfigurado();
}

export async function leerConfigDeSupabase(): Promise<SiteConfig> {
  return noConfigurado();
}
