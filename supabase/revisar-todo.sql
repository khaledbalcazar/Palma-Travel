-- ===================================================================
-- Palma Travel — revisión de la base de datos
-- -------------------------------------------------------------------
-- Pegá TODO esto en el SQL Editor de Supabase y apretá Run.
-- Devuelve una tabla con una fila por cosa revisada.
--
-- En la columna "estado":
--   OK        → está bien
--   REVISAR   → falta algo, mirá el detalle
--   PROBLEMA  → hay que arreglarlo antes de publicar
--
-- No modifica nada: solo mira.
-- ===================================================================

with revisiones as (

  -- 1. ¿Están todas las tablas?
  select 1 as orden, 'Tablas creadas' as revision,
    case when count(*) = 4 then 'OK' else 'PROBLEMA' end as estado,
    case when count(*) = 4
      then 'Están las 4 tablas'
      else 'Faltan tablas. Volvé a correr setup-completo.sql'
    end as detalle
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('paquetes','propuestas','perfiles','site_config')

  union all

  -- 2. ¿Está activa la seguridad por filas en todas?
  select 2, 'Seguridad por filas (RLS)',
    case when count(*) filter (where not rowsecurity) = 0 then 'OK' else 'PROBLEMA' end,
    case when count(*) filter (where not rowsecurity) = 0
      then 'Activa en las 4 tablas'
      else 'Hay tablas sin protección: ' ||
           coalesce(string_agg(tablename, ', ') filter (where not rowsecurity), '')
    end
  from pg_tables
  where schemaname = 'public'
    and tablename in ('paquetes','propuestas','perfiles','site_config')

  union all

  -- 3. Los paquetes ocultos no se pueden ver desde afuera
  select 3, 'Paquetes ocultos protegidos',
    case when count(*) = 1 then 'OK' else 'PROBLEMA' end,
    case when count(*) = 1
      then 'Una persona sin cuenta solo ve los paquetes publicados'
      else 'Falta la política de lectura pública de paquetes. Volvé a correr setup-completo.sql'
    end
  from pg_policies
  where schemaname = 'public' and tablename = 'paquetes'
    and cmd = 'SELECT' and 'anon' = any(roles)

  union all

  -- 4. Las propuestas NO se pueden listar desde afuera
  select 4, 'Propuestas no listables',
    case when count(*) = 0 then 'OK' else 'PROBLEMA' end,
    case when count(*) = 0
      then 'Nadie de afuera puede listar las propuestas'
      else '¡Atención! Hay una política que deja listar las propuestas públicamente'
    end
  from pg_policies
  where schemaname = 'public' and tablename = 'propuestas'
    and cmd = 'SELECT' and 'anon' = any(roles)

  union all

  -- 5. Se puede abrir una propuesta por su enlace
  select 5, 'Propuestas se abren por enlace',
    case when count(*) = 1 then 'OK' else 'PROBLEMA' end,
    case when count(*) = 1
      then 'La función propuesta_por_slug existe'
      else 'Falta la función propuesta_por_slug. Volvé a correr setup-completo.sql'
    end
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'propuesta_por_slug'

  union all

  -- 6. Esa función no puede devolver las notas internas
  select 6, 'Notas internas protegidas',
    case when count(*) = 0 then 'OK' else 'PROBLEMA' end,
    case when count(*) = 0
      then 'Las notas internas nunca salen en la propuesta pública'
      else '¡Atención! La función devuelve notas_internas. Volvé a correr setup-completo.sql'
    end
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'propuesta_por_slug'
    and pg_get_function_result(p.oid) ilike '%notas_internas%'

  union all

  -- 7. Carpeta de fotos
  select 7, 'Carpeta de fotos',
    case when count(*) = 1 then 'OK' else 'PROBLEMA' end,
    case when count(*) = 1
      then 'La carpeta «paquetes» existe y es pública'
      else 'Falta la carpeta «paquetes» o no es pública. Volvé a correr setup-completo.sql'
    end
  from storage.buckets
  where id = 'paquetes' and public

  union all

  -- 8. Contenido cargado
  select 8, 'Paquetes cargados',
    case when count(*) > 0 then 'OK' else 'REVISAR' end,
    count(*) || ' paquetes en la base' ||
      case when count(*) = 0 then '. Corré datos-de-ejemplo.sql' else '' end
  from public.paquetes

  union all

  select 9, 'Propuestas cargadas', 'OK',
    count(*) || ' propuestas en la base'
  from public.propuestas

  union all

  -- 10. Configuración del sitio
  select 10, 'Configuración del sitio',
    case when count(*) = 1 then 'OK' else 'REVISAR' end,
    case when count(*) = 1
      then 'Cargada'
      else 'Vacía. Corré datos-de-ejemplo.sql, o cargala desde el panel'
    end
  from public.site_config
  where id = 1 and datos is not null and datos <> '{}'::jsonb

  union all

  -- 11. ¿Hay alguien que pueda entrar al panel?
  select 11, 'Administrador del panel',
    case when count(*) > 0 then 'OK' else 'REVISAR' end,
    case when count(*) > 0
      then 'Administradores activos: ' || string_agg(email, ', ')
      else 'Todavía no hay ninguno. Creá el usuario en Authentication → Users y después corré hacer-admin.sql'
    end
  from public.perfiles
  where rol = 'admin' and activo

)
select revision as "Qué se revisó",
       estado   as "Estado",
       detalle  as "Detalle"
from revisiones
order by orden;
