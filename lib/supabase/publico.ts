import { createClient } from "@supabase/supabase-js";

/* Cliente para leer el contenido público del sitio.
   No usa cookies a propósito: así las páginas se siguen generando de
   forma estática y cargan instantáneo. Solo ve lo que las políticas de
   seguridad (RLS) dejan ver a cualquiera. */
export function clientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisá tu archivo .env.local.",
    );
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
