/* ===================================================================
   VERIFICAR LA CONEXIÓN CON SUPABASE
   Revisa, una por una, todas las cosas que tienen que estar bien para
   que el sitio y el panel funcionen, y dice exactamente cuál falla.

     npm run verificar
   =================================================================== */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

/* ---------- Leer .env.local ---------- */

function cargarEnv() {
  for (const archivo of [".env.local", ".env"]) {
    try {
      const texto = readFileSync(join(process.cwd(), archivo), "utf8");
      for (const linea of texto.split("\n")) {
        const limpia = linea.trim();
        if (!limpia || limpia.startsWith("#")) continue;
        const i = limpia.indexOf("=");
        if (i === -1) continue;
        const clave = limpia.slice(0, i).trim();
        const valor = limpia.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[clave]) process.env[clave] = valor;
      }
    } catch {
      /* no existe, se sigue */
    }
  }
}

cargarEnv();

/* ---------- Ayudas de salida ---------- */

let fallas = 0;
let avisos = 0;

const ok = (texto: string) => console.log(`  ✓ ${texto}`);
const mal = (texto: string, comoArreglar: string) => {
  fallas++;
  console.log(`  ✗ ${texto}`);
  console.log(`      → ${comoArreglar}`);
};
const aviso = (texto: string, detalle: string) => {
  avisos++;
  console.log(`  ! ${texto}`);
  console.log(`      → ${detalle}`);
};
const titulo = (texto: string) => console.log(`\n${texto}`);

/* ---------- Revisiones ---------- */

async function principal() {
  console.log("\nRevisando la conexión con Supabase…");

  /* 1. Variables de entorno */
  titulo("1. Variables de entorno");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sitio = process.env.NEXT_PUBLIC_SITE_URL;

  if (!url) {
    mal(
      "Falta NEXT_PUBLIC_SUPABASE_URL",
      "Está en Supabase → Project Settings → API → Project URL. Copiala en .env.local",
    );
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
    aviso(
      `NEXT_PUBLIC_SUPABASE_URL tiene una forma rara: ${url}`,
      "Tiene que ser algo como https://abcdefghij.supabase.co (sin barra al final)",
    );
  } else {
    ok(`NEXT_PUBLIC_SUPABASE_URL = ${url}`);
  }

  if (!anon) {
    mal(
      "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "Está en Supabase → Project Settings → API → Project API keys → anon public",
    );
  } else {
    ok(`NEXT_PUBLIC_SUPABASE_ANON_KEY cargada (${anon.length} caracteres)`);
  }

  if (!servicio) {
    mal(
      "Falta SUPABASE_SERVICE_ROLE_KEY",
      "Está en Supabase → Project Settings → API → service_role. Es SECRETA: nunca la compartas",
    );
  } else if (servicio === anon) {
    mal(
      "SUPABASE_SERVICE_ROLE_KEY y la clave anon son la misma",
      "Copiaste dos veces la misma. La service_role es la otra, la que dice «secret»",
    );
  } else {
    ok(`SUPABASE_SERVICE_ROLE_KEY cargada (${servicio.length} caracteres)`);
  }

  if (!sitio) {
    aviso(
      "Falta NEXT_PUBLIC_SITE_URL",
      "Sin esto, los enlaces que se mandan por WhatsApp van a apuntar al dominio de ejemplo",
    );
  } else if (sitio.endsWith("/")) {
    aviso(
      `NEXT_PUBLIC_SITE_URL termina en barra: ${sitio}`,
      "Sacale la barra del final",
    );
  } else {
    ok(`NEXT_PUBLIC_SITE_URL = ${sitio}`);
  }

  if (!url || !anon || !servicio) {
    console.log(
      "\nFaltan datos básicos para poder seguir revisando. Completá .env.local y volvé a correr esto.\n",
    );
    process.exit(1);
  }

  /* 2. Conexión */
  titulo("2. Conexión con el proyecto");

  const publico = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(url, servicio, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: errorConexion } = await admin.from("paquetes").select("id").limit(1);

  if (errorConexion) {
    const m = errorConexion.message.toLowerCase();
    if (m.includes("fetch failed") || m.includes("enotfound")) {
      mal(
        "No se llega al proyecto de Supabase",
        "Revisá que la URL esté bien escrita y que tengas internet",
      );
    } else if (m.includes("invalid api key") || m.includes("jwt")) {
      mal(
        "Las claves no son válidas para este proyecto",
        "Volvé a copiarlas de Project Settings → API. Ojo de no mezclar claves de dos proyectos distintos",
      );
    } else if (
      m.includes("does not exist") ||
      m.includes("could not find the table") ||
      m.includes("schema cache")
    ) {
      mal(
        "El proyecto responde, pero las tablas todavía no existen",
        "Entrá a Supabase → SQL Editor, pegá todo supabase/setup-completo.sql y apretá Run",
      );
    } else {
      mal(`No se pudo consultar la base: ${errorConexion.message}`, "Revisá el mensaje de arriba");
    }
    console.log("");
    process.exit(1);
  }
  ok("El proyecto responde y las tablas existen");

  /* 3. Tablas y contenido */
  titulo("3. Contenido cargado");

  for (const tabla of ["paquetes", "propuestas", "perfiles", "site_config"] as const) {
    const { count, error } = await admin
      .from(tabla)
      .select("*", { count: "exact", head: true });

    if (error) {
      mal(`No existe la tabla «${tabla}»`, "Volvé a correr supabase/setup-completo.sql");
    } else {
      const n = count ?? 0;
      if (tabla === "paquetes" && n === 0) {
        aviso("No hay ningún paquete cargado", "Corré: npm run seed");
      } else if (tabla === "perfiles" && n === 0) {
        aviso(
          "No hay ningún usuario del panel",
          "Creá uno en Supabase → Authentication → Users, y después corré: npm run seed -- --admin=tu@email.com",
        );
      } else {
        ok(`Tabla «${tabla}»: ${n} ${n === 1 ? "fila" : "filas"}`);
      }
    }
  }

  /* 4. Permisos (RLS) — lo más importante */
  titulo("4. Permisos de seguridad (RLS)");

  const { data: ocultos } = await admin
    .from("paquetes")
    .select("slug")
    .eq("estado", "oculto");

  const { data: visiblesParaCualquiera, error: errorPublico } = await publico
    .from("paquetes")
    .select("slug, estado");

  if (errorPublico) {
    mal(
      `Una persona sin cuenta no puede leer los paquetes: ${errorPublico.message}`,
      "Volvé a correr supabase/setup-completo.sql: faltan las políticas de lectura pública",
    );
  } else {
    const filtrados = (visiblesParaCualquiera ?? []).filter(
      (p) => p.estado === "oculto",
    );
    if (filtrados.length > 0) {
      mal(
        `¡Atención! Los paquetes ocultos se ven desde afuera (${filtrados.length})`,
        "Volvé a correr supabase/setup-completo.sql: la seguridad por filas no quedó aplicada",
      );
    } else {
      ok(
        `Los paquetes publicados se ven (${visiblesParaCualquiera?.length ?? 0}) y los ocultos no (${ocultos?.length ?? 0})`,
      );
    }
  }

  const { data: propuestasDesdeAfuera, error: errorPropuestas } = await publico
    .from("propuestas")
    .select("slug");

  if (!errorPropuestas && (propuestasDesdeAfuera?.length ?? 0) > 0) {
    mal(
      `¡Atención! Las propuestas personalizadas se pueden listar desde afuera (${propuestasDesdeAfuera!.length})`,
      "Volvé a correr supabase/setup-completo.sql: no tiene que haber política de lectura pública sobre «propuestas»",
    );
  } else {
    ok("Las propuestas no se pueden listar desde afuera");
  }

  /* Y que sí se puedan leer de a una, por enlace */
  const { data: algunaPropuesta } = await admin
    .from("propuestas")
    .select("slug")
    .limit(1);

  if (algunaPropuesta?.[0]) {
    const slug = algunaPropuesta[0].slug as string;
    const { data: porSlug, error: errorRpc } = await publico.rpc(
      "propuesta_por_slug",
      { p_slug: slug },
    );

    if (errorRpc) {
      mal(
        `No se puede abrir una propuesta por su enlace: ${errorRpc.message}`,
        "Volvé a correr supabase/setup-completo.sql: falta la función propuesta_por_slug",
      );
    } else if (!porSlug || (porSlug as unknown[]).length === 0) {
      mal(
        `La propuesta «${slug}» no se abre desde su enlace`,
        "Revisá la función propuesta_por_slug en supabase/setup-completo.sql",
      );
    } else {
      const fila = (porSlug as Record<string, unknown>[])[0]!;
      if ("notas_internas" in fila) {
        mal(
          "¡Atención! Las notas internas salen en la propuesta pública",
          "Volvé a correr supabase/setup-completo.sql: la función no debe devolver notas_internas",
        );
      } else {
        ok("Una propuesta se abre por su enlace y sin exponer las notas internas");
      }
    }
  }

  /* 5. Fotos */
  titulo("5. Carpeta de fotos");

  const { data: buckets, error: errorBuckets } = await admin.storage.listBuckets();
  const bucket = buckets?.find((b) => b.id === "paquetes");

  if (errorBuckets) {
    aviso(`No se pudo revisar el almacenamiento: ${errorBuckets.message}`, "Revisalo a mano en Supabase → Storage");
  } else if (!bucket) {
    mal(
      "Falta la carpeta «paquetes» para las fotos",
      "Volvé a correr supabase/setup-completo.sql",
    );
  } else if (!bucket.public) {
    mal(
      "La carpeta «paquetes» no es pública: las fotos no se van a ver en el sitio",
      "En Supabase → Storage → paquetes → Settings, marcala como pública",
    );
  } else {
    ok("La carpeta «paquetes» existe y es pública");
  }

  /* 6. Usuarios del panel */
  titulo("6. Usuarios del panel");

  const { data: admins } = await admin
    .from("perfiles")
    .select("email, rol, activo")
    .eq("rol", "admin")
    .eq("activo", true);

  if (!admins || admins.length === 0) {
    aviso(
      "No hay ningún administrador activo",
      "Creá el usuario en Supabase → Authentication → Users y después corré: npm run seed -- --admin=tu@email.com",
    );
  } else {
    ok(
      `Administradores activos: ${admins.map((a) => a.email).join(", ")}`,
    );
  }

  /* 7. Recordatorio de configuración de Auth */
  titulo("7. Para que anden las invitaciones por email");
  console.log(
    `  ! Esto no se puede revisar desde acá, pero es importante:
      En Supabase → Authentication → URL Configuration, cargá:
        Site URL:       ${sitio ?? "https://tudominio.com"}
        Redirect URLs:  ${sitio ?? "https://tudominio.com"}/admin
                        http://localhost:3000/admin
      Sin esto, los enlaces de invitación y de "entrar con enlace" no funcionan.`,
  );

  /* ---------- Resumen ---------- */

  console.log("\n" + "─".repeat(60));
  if (fallas === 0 && avisos === 0) {
    console.log("Todo en orden. Ya podés levantar el sitio con: npm run dev\n");
  } else if (fallas === 0) {
    console.log(
      `Sin errores graves. Hay ${avisos} ${avisos === 1 ? "cosa" : "cosas"} para revisar, marcadas con «!».\n`,
    );
  } else {
    console.log(
      `${fallas} ${fallas === 1 ? "problema" : "problemas"} para resolver, ${avisos} aviso(s). Arriba dice cómo arreglar cada uno.\n`,
    );
    process.exit(1);
  }
}

principal().catch((error) => {
  console.error("\nFalló la verificación:\n", error);
  process.exit(1);
});
