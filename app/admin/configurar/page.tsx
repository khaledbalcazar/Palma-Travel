import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurar la base de datos",
  robots: { index: false, follow: false },
};

/* Se muestra cuando todavía no se cargaron las claves de Supabase.
   Explica qué falta, en lugar de tirar un error técnico. */
export default function Configurar() {
  return (
    <div className="contenedor max-w-2xl py-20">
      <h1 className="font-display text-3xl">Falta conectar la base de datos</h1>
      <p className="mt-4 text-tinta-600">
        El panel de administración necesita Supabase para funcionar. Todavía no
        están cargadas las claves de conexión.
      </p>

      <ol className="mt-8 space-y-5 text-[0.95rem] text-tinta-700">
        <li className="rounded-lg bg-arena-100 p-5">
          <strong className="font-semibold text-palma-900">1. Creá el proyecto</strong>
          <p className="mt-1.5">
            Entrá a supabase.com, creá una cuenta gratis y después un proyecto
            nuevo. Elegí la región más cercana (por ejemplo São Paulo).
          </p>
        </li>
        <li className="rounded-lg bg-arena-100 p-5">
          <strong className="font-semibold text-palma-900">2. Creá las tablas</strong>
          <p className="mt-1.5">
            En el menú lateral entrá a <em>SQL Editor</em>, pegá todo el contenido
            del archivo{" "}
            <code className="rounded bg-arena-200 px-1.5 py-0.5">
              supabase/setup-completo.sql
            </code>{" "}
            y apretá <em>Run</em>. Tiene que decir <em>Success</em>.
          </p>
        </li>
        <li className="rounded-lg bg-arena-100 p-5">
          <strong className="font-semibold text-palma-900">
            3. Configurá las direcciones
          </strong>
          <p className="mt-1.5">
            En <em>Authentication → URL Configuration</em> cargá la dirección del
            sitio y, en <em>Redirect URLs</em>, agregá{" "}
            <code className="rounded bg-arena-200 px-1.5 py-0.5">
              http://localhost:3000/admin
            </code>{" "}
            y la del sitio publicado. Sin esto, las invitaciones por email no
            funcionan.
          </p>
        </li>
        <li className="rounded-lg bg-arena-100 p-5">
          <strong className="font-semibold text-palma-900">4. Copiá las claves</strong>
          <p className="mt-1.5">
            En <em>Project Settings → API</em> vas a encontrar la URL del proyecto
            y las claves. Copialas en un archivo llamado{" "}
            <code className="rounded bg-arena-200 px-1.5 py-0.5">.env.local</code>{" "}
            en la raíz del proyecto, siguiendo el ejemplo de{" "}
            <code className="rounded bg-arena-200 px-1.5 py-0.5">.env.example</code>.
          </p>
        </li>
        <li className="rounded-lg bg-arena-100 p-5">
          <strong className="font-semibold text-palma-900">5. Cargá el contenido</strong>
          <p className="mt-1.5">
            Desde la terminal, corré{" "}
            <code className="rounded bg-arena-200 px-1.5 py-0.5">npm run seed</code>{" "}
            para subir los paquetes de ejemplo, y volvé a levantar el sitio.
            Después, <code className="rounded bg-arena-200 px-1.5 py-0.5">
              npm run verificar
            </code>{" "}
            te dice si quedó todo bien.
          </p>
        </li>
      </ol>

      <p className="mt-8 text-sm text-tinta-500">
        En el README del proyecto está la guía completa, paso a paso y con más
        detalle.
      </p>
    </div>
  );
}
