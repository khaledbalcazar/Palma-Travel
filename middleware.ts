import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/* ===================================================================
   Protege el panel /admin y mantiene viva la sesión.
   Si no hay sesión, manda al login. Si la hay, refresca el token.
   =================================================================== */

const RUTAS_LIBRES = ["/admin/login", "/admin/configurar"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let respuesta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Todavía no hay base configurada: se explica qué falta en vez de
     mostrar un error feo. */
  if (!url || !anon) {
    if (pathname === "/admin/configurar") return respuesta;
    return NextResponse.redirect(new URL("/admin/configurar", request.url));
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (nuevas) => {
        for (const { name, value } of nuevas) {
          request.cookies.set(name, value);
        }
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of nuevas) {
          respuesta.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esRutaLibre = RUTAS_LIBRES.some((r) => pathname.startsWith(r));

  if (!user && !esRutaLibre) {
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("volverA", pathname);
    return NextResponse.redirect(login);
  }

  if (user && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return respuesta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
