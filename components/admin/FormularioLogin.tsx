"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { Boton } from "@/components/ui/Boton";
import { CampoTexto } from "@/components/admin/Campos";

type Modo = "clave" | "enlace";

export function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const volverA = parametros.get("volverA") ?? "/admin";
  const desactivado = parametros.get("motivo") === "desactivado";

  const [modo, setModo] = useState<Modo>("clave");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setError(null);
    setAviso(null);

    const supabase = clienteNavegador();

    if (modo === "enlace") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setCargando(false);
      if (error) {
        setError(traducirError(error.message));
        return;
      }
      setAviso(
        `Te mandamos un enlace a ${email}. Abrilo desde este mismo dispositivo para entrar.`,
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
    setCargando(false);
    if (error) {
      setError(traducirError(error.message));
      return;
    }
    router.replace(volverA);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4">
      {desactivado && (
        <p role="alert" className="rounded-lg bg-coral-100 px-4 py-3 text-sm text-coral-800">
          Tu usuario está desactivado. Pedile a un administrador que lo vuelva a
          activar.
        </p>
      )}

      <CampoTexto
        id="email"
        etiqueta="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {modo === "clave" && (
        <CampoTexto
          id="clave"
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-coral-100 px-4 py-3 text-sm text-coral-800">
          {error}
        </p>
      )}
      {aviso && (
        <p role="status" className="rounded-lg bg-palma-100 px-4 py-3 text-sm text-palma-800">
          {aviso}
        </p>
      )}

      <Boton type="submit" disabled={cargando} className="w-full" tamano="lg">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {modo === "clave" ? "Entrar" : "Mandame el enlace"}
      </Boton>

      <button
        type="button"
        onClick={() => {
          setModo(modo === "clave" ? "enlace" : "clave");
          setError(null);
          setAviso(null);
        }}
        className="w-full text-center text-sm text-tinta-500 underline-offset-4 hover:text-palma-800 hover:underline"
      >
        {modo === "clave"
          ? "No me acuerdo la contraseña, mandame un enlace por email"
          : "Prefiero entrar con mi contraseña"}
      </button>
    </form>
  );
}

/** Los mensajes de Supabase vienen en inglés. */
function traducirError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "El email o la contraseña no coinciden. Probá de nuevo.";
  if (m.includes("email not confirmed"))
    return "Todavía no confirmaste tu email. Revisá tu casilla, incluida la carpeta de correo no deseado.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Hubo demasiados intentos seguidos. Esperá unos minutos y volvé a probar.";
  if (m.includes("user not found"))
    return "No encontramos ese email. Pedile a un administrador que te invite.";
  return `No pudimos entrar: ${mensaje}`;
}
