"use client";

import { createBrowserClient } from "@supabase/ssr";

/* Cliente del navegador: lo usan el login y la subida de fotos del panel. */
export function clienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
