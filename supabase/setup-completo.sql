-- ===================================================================
-- Palma Travel — TODO el SQL de la base de datos, en un solo archivo
-- -------------------------------------------------------------------
-- Este archivo se genera solo: es la suma de supabase/migrations/*.sql
-- No lo edites a mano. Si hay que cambiar algo, agregá una migración
-- nueva en supabase/migrations y corré: npm run armar-sql
--
-- CÓMO USARLO
--   1. Entrá a tu proyecto en supabase.com
--   2. Menú de la izquierda → SQL Editor → New query
--   3. Copiá TODO este archivo, pegalo y apretá Run
--   4. Tiene que decir "Success"
--
-- Se puede correr las veces que haga falta: no borra ni duplica nada.
-- ===================================================================

-- ▼▼▼ 0001_init.sql ▼▼▼

-- ===================================================================
-- Palma Travel — estructura inicial de la base de datos
-- -------------------------------------------------------------------
-- Cómo usarlo: entrá a tu proyecto de Supabase → SQL Editor → New query,
-- pegá TODO este archivo y apretá Run. Se puede correr una sola vez.
-- ===================================================================

-- ---------- Tipos ----------

do $$ begin
  create type region_viaje as enum
    ('paraguay','sudamerica','caribe','norteamerica','europa','otros');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_paquete as enum ('activo','agotado','proximamente','oculto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ritmo_viaje as enum ('tranquilo','moderado','intenso');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rol_usuario as enum ('admin','editor');
exception when duplicate_object then null; end $$;

-- ---------- Usuarios del panel ----------
-- Cada fila corresponde a un usuario de Supabase Auth. No hay registro
-- público: los usuarios se crean por invitación desde el panel.

create table if not exists public.perfiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  nombre       text not null default '',
  rol          rol_usuario not null default 'editor',
  activo       boolean not null default true,
  creado_en    timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ---------- Funciones de permisos ----------
-- Van con SECURITY DEFINER para que al consultarlas desde una política
-- de otra tabla no vuelvan a disparar las políticas de `perfiles`.

create or replace function public.es_miembro_activo()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and activo
  );
$$;

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and activo and rol = 'admin'
  );
$$;

-- ---------- Paquetes ----------

create table if not exists public.paquetes (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  titulo             text not null,
  destino            text not null,
  pais               text not null,
  region             region_viaje not null,
  estado             estado_paquete not null default 'oculto',

  tipo_viaje         text[] not null default '{}',
  ideal_para         text[] not null default '{}',
  ritmo              ritmo_viaje not null default 'moderado',

  duracion_dias      integer not null check (duracion_dias between 1 and 120),
  duracion_noches    integer not null check (duracion_noches between 0 and 120),

  -- "flexible" o una lista de fechas: ["2027-04-10", ...]
  fechas_salida      jsonb not null default '"flexible"'::jsonb,
  salida_grupal      boolean not null default false,
  coordinadores      text[] not null default '{}',

  precio_desde       numeric(10,2) not null check (precio_desde >= 0),
  moneda             text not null default 'USD',
  base_precio        text not null default 'por persona en base doble',
  vigencia_precio    date,

  incluye_vuelo      boolean not null default true,
  incluye            jsonb not null default '[]'::jsonb,
  no_incluye         jsonb not null default '[]'::jsonb,

  itinerario         jsonb not null default '[]'::jsonb,
  alojamiento        jsonb not null default '[]'::jsonb,
  highlights         jsonb not null default '[]'::jsonb,

  imagen_portada     jsonb not null,
  galeria            jsonb not null default '[]'::jsonb,

  documentacion      jsonb not null default '[]'::jsonb,
  bases_y_condiciones text not null default '',
  faq                jsonb not null default '[]'::jsonb,

  tags               text[] not null default '{}',
  destacado          boolean not null default false,
  es_ejemplo         boolean not null default false,

  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now(),
  actualizado_por    uuid references public.perfiles(id) on delete set null,
  actualizado_por_nombre text not null default ''
);

create index if not exists paquetes_estado_idx on public.paquetes (estado);
create index if not exists paquetes_destacado_idx on public.paquetes (destacado);
create index if not exists paquetes_actualizado_idx on public.paquetes (actualizado_en desc);

-- ---------- Propuestas personalizadas ----------
-- Mismos campos que un paquete, más los datos del cliente.
-- No tienen estado ni destacado: nunca aparecen en el catálogo.

create table if not exists public.propuestas (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  cliente_nombre     text not null,
  valida_hasta       date not null,
  notas_internas     text not null default '',

  titulo             text not null,
  destino            text not null,
  pais               text not null,
  region             region_viaje not null,

  tipo_viaje         text[] not null default '{}',
  ideal_para         text[] not null default '{}',
  ritmo              ritmo_viaje not null default 'moderado',

  duracion_dias      integer not null check (duracion_dias between 1 and 120),
  duracion_noches    integer not null check (duracion_noches between 0 and 120),

  fechas_salida      jsonb not null default '"flexible"'::jsonb,
  salida_grupal      boolean not null default false,
  coordinadores      text[] not null default '{}',

  precio_desde       numeric(10,2) not null check (precio_desde >= 0),
  moneda             text not null default 'USD',
  base_precio        text not null default 'por persona en base doble',
  vigencia_precio    date,

  incluye_vuelo      boolean not null default true,
  incluye            jsonb not null default '[]'::jsonb,
  no_incluye         jsonb not null default '[]'::jsonb,

  itinerario         jsonb not null default '[]'::jsonb,
  alojamiento        jsonb not null default '[]'::jsonb,
  highlights         jsonb not null default '[]'::jsonb,

  imagen_portada     jsonb not null,
  galeria            jsonb not null default '[]'::jsonb,

  documentacion      jsonb not null default '[]'::jsonb,
  bases_y_condiciones text not null default '',
  faq                jsonb not null default '[]'::jsonb,

  tags               text[] not null default '{}',
  es_ejemplo         boolean not null default false,

  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now(),
  actualizado_por    uuid references public.perfiles(id) on delete set null,
  actualizado_por_nombre text not null default ''
);

create index if not exists propuestas_valida_idx on public.propuestas (valida_hasta);
create index if not exists propuestas_actualizado_idx on public.propuestas (actualizado_en desc);

-- ---------- Configuración del sitio ----------
-- Una sola fila. Los datos van en un jsonb validado por el mismo schema
-- Zod del panel, así agregar un ajuste nuevo no obliga a migrar la base.

create table if not exists public.site_config (
  id             smallint primary key default 1 check (id = 1),
  datos          jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references public.perfiles(id) on delete set null
);

insert into public.site_config (id, datos)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- ---------- Marca de tiempo automática ----------

create or replace function public.tocar_actualizado_en()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end $$;

drop trigger if exists paquetes_tocar on public.paquetes;
create trigger paquetes_tocar before update on public.paquetes
  for each row execute function public.tocar_actualizado_en();

drop trigger if exists propuestas_tocar on public.propuestas;
create trigger propuestas_tocar before update on public.propuestas
  for each row execute function public.tocar_actualizado_en();

drop trigger if exists perfiles_tocar on public.perfiles;
create trigger perfiles_tocar before update on public.perfiles
  for each row execute function public.tocar_actualizado_en();

drop trigger if exists site_config_tocar on public.site_config;
create trigger site_config_tocar before update on public.site_config
  for each row execute function public.tocar_actualizado_en();

-- ---------- Perfil automático al crear un usuario ----------
-- Cuando se invita a alguien desde el panel, Supabase crea el usuario en
-- auth.users y este trigger le arma el perfil con el rol de la invitación.

create or replace function public.crear_perfil_de_usuario()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce((new.raw_user_meta_data->>'rol')::rol_usuario, 'editor')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil_de_usuario();

-- ===================================================================
-- SEGURIDAD A NIVEL DE FILA (RLS)
-- ===================================================================

alter table public.perfiles     enable row level security;
alter table public.paquetes     enable row level security;
alter table public.propuestas   enable row level security;
alter table public.site_config  enable row level security;

-- ---------- Perfiles ----------

drop policy if exists "perfil propio o admin" on public.perfiles;
create policy "perfil propio o admin" on public.perfiles
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

drop policy if exists "solo admin crea perfiles" on public.perfiles;
create policy "solo admin crea perfiles" on public.perfiles
  for insert to authenticated
  with check (public.es_admin());

drop policy if exists "solo admin edita perfiles" on public.perfiles;
create policy "solo admin edita perfiles" on public.perfiles
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists "solo admin borra perfiles" on public.perfiles;
create policy "solo admin borra perfiles" on public.perfiles
  for delete to authenticated
  using (public.es_admin());

-- ---------- Paquetes ----------
-- Cualquiera puede LEER los paquetes publicados. Los "oculto" solo los
-- ve el equipo. Escribir, solo el equipo.

drop policy if exists "paquetes publicados son publicos" on public.paquetes;
create policy "paquetes publicados son publicos" on public.paquetes
  for select to anon, authenticated
  using (estado <> 'oculto');

drop policy if exists "el equipo ve todos los paquetes" on public.paquetes;
create policy "el equipo ve todos los paquetes" on public.paquetes
  for select to authenticated
  using (public.es_miembro_activo());

drop policy if exists "el equipo crea paquetes" on public.paquetes;
create policy "el equipo crea paquetes" on public.paquetes
  for insert to authenticated
  with check (public.es_miembro_activo());

drop policy if exists "el equipo edita paquetes" on public.paquetes;
create policy "el equipo edita paquetes" on public.paquetes
  for update to authenticated
  using (public.es_miembro_activo()) with check (public.es_miembro_activo());

drop policy if exists "el equipo borra paquetes" on public.paquetes;
create policy "el equipo borra paquetes" on public.paquetes
  for delete to authenticated
  using (public.es_miembro_activo());

-- ---------- Propuestas ----------
-- IMPORTANTE: no hay ninguna política de lectura pública. Nadie de afuera
-- puede listar las propuestas. El sitio público las lee de a una, por
-- slug exacto, a través de la función de abajo.

drop policy if exists "el equipo ve las propuestas" on public.propuestas;
create policy "el equipo ve las propuestas" on public.propuestas
  for select to authenticated
  using (public.es_miembro_activo());

drop policy if exists "el equipo crea propuestas" on public.propuestas;
create policy "el equipo crea propuestas" on public.propuestas
  for insert to authenticated
  with check (public.es_miembro_activo());

drop policy if exists "el equipo edita propuestas" on public.propuestas;
create policy "el equipo edita propuestas" on public.propuestas
  for update to authenticated
  using (public.es_miembro_activo()) with check (public.es_miembro_activo());

drop policy if exists "el equipo borra propuestas" on public.propuestas;
create policy "el equipo borra propuestas" on public.propuestas
  for delete to authenticated
  using (public.es_miembro_activo());

-- Lectura pública de UNA propuesta, solo si se sabe el slug exacto.
-- No devuelve las notas internas.
create or replace function public.propuesta_por_slug(p_slug text)
returns table (
  id uuid, slug text, cliente_nombre text, valida_hasta date,
  titulo text, destino text, pais text, region region_viaje,
  tipo_viaje text[], ideal_para text[], ritmo ritmo_viaje,
  duracion_dias integer, duracion_noches integer,
  fechas_salida jsonb, salida_grupal boolean, coordinadores text[],
  precio_desde numeric, moneda text, base_precio text, vigencia_precio date,
  incluye_vuelo boolean, incluye jsonb, no_incluye jsonb,
  itinerario jsonb, alojamiento jsonb, highlights jsonb,
  imagen_portada jsonb, galeria jsonb,
  documentacion jsonb, bases_y_condiciones text, faq jsonb,
  tags text[], es_ejemplo boolean,
  creado_en timestamptz, actualizado_en timestamptz,
  actualizado_por_nombre text
)
language sql stable security definer set search_path = public
as $$
  select
    p.id, p.slug, p.cliente_nombre, p.valida_hasta,
    p.titulo, p.destino, p.pais, p.region,
    p.tipo_viaje, p.ideal_para, p.ritmo,
    p.duracion_dias, p.duracion_noches,
    p.fechas_salida, p.salida_grupal, p.coordinadores,
    p.precio_desde, p.moneda, p.base_precio, p.vigencia_precio,
    p.incluye_vuelo, p.incluye, p.no_incluye,
    p.itinerario, p.alojamiento, p.highlights,
    p.imagen_portada, p.galeria,
    p.documentacion, p.bases_y_condiciones, p.faq,
    p.tags, p.es_ejemplo,
    p.creado_en, p.actualizado_en,
    p.actualizado_por_nombre
  from public.propuestas p
  where p.slug = p_slug
  limit 1;
$$;

grant execute on function public.propuesta_por_slug(text) to anon, authenticated;

-- ---------- Configuración del sitio ----------

drop policy if exists "la configuracion es publica" on public.site_config;
create policy "la configuracion es publica" on public.site_config
  for select to anon, authenticated using (true);

drop policy if exists "solo admin edita la configuracion" on public.site_config;
create policy "solo admin edita la configuracion" on public.site_config
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ===================================================================
-- FOTOS (Storage)
-- ===================================================================

insert into storage.buckets (id, name, public)
values ('paquetes', 'paquetes', true)
on conflict (id) do nothing;

drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'paquetes');

drop policy if exists "el equipo sube fotos" on storage.objects;
create policy "el equipo sube fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'paquetes' and public.es_miembro_activo());

drop policy if exists "el equipo reemplaza fotos" on storage.objects;
create policy "el equipo reemplaza fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'paquetes' and public.es_miembro_activo());

drop policy if exists "el equipo borra fotos" on storage.objects;
create policy "el equipo borra fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'paquetes' and public.es_miembro_activo());


-- ▼▼▼ 0002_ultimos_lugares.sql ▼▼▼

-- ===================================================================
-- Agrega la marca «últimos lugares» a los paquetes.
-- Correr en el SQL Editor de Supabase después de 0001_init.sql.
-- ===================================================================

alter table public.paquetes
  add column if not exists ultimos_lugares boolean not null default false;
