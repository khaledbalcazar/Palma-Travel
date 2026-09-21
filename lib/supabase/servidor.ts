import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* Cliente del servidor con la sesión del usuario logueado.
   Es el que usa todo el panel /admin: cada consulta viaja con el usuario,
   así las políticas de seguridad de la base deciden qué puede hacer. */
export async function clienteServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisá tu archivo .env.local; en /admin/configurar está el paso a paso.",
    );
  }

  const almacenCookies = await cookies();

  return createServerClient(
    url,
    anon,
    {
      cookies: {
        getAll: () => almacenCookies.getAll(),
        setAll: (nuevas) => {
          try {
            for (const { name, value, options } of nuevas) {
              almacenCookies.set(name, value, options);
            }
          } catch {
            /* Pasa cuando se llama desde un Server Component: el refresco
               de la sesión lo hace el middleware, así que se puede ignorar. */
          }
        },
      },
    },
  );
}
