-- ===================================================================
-- Agrega la marca «últimos lugares» a los paquetes.
-- Correr en el SQL Editor de Supabase después de 0001_init.sql.
-- ===================================================================

alter table public.paquetes
  add column if not exists ultimos_lugares boolean not null default false;
