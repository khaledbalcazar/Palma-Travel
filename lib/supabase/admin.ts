import "server-only";
import { createClient } from "@supabase/supabase-js";

/* ⚠️ Cliente con permisos totales: saltea todas las políticas de seguridad.
   Se usa SOLO para invitar usuarios y para la carga inicial de datos.
   Nunca debe llegar al navegador. */
export function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !servicio) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Se saca del panel de Supabase, en Project Settings → API. Es secreta.",
    );
  }
  return createClient(url, servicio, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
