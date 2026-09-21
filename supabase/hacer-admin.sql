-- ===================================================================
-- Palma Travel — dar permisos de administrador
-- -------------------------------------------------------------------
-- ANTES de correr esto:
--   1. Entrá a Supabase → Authentication → Users → Add user
--      → "Create new user"
--   2. Poné tu email y una contraseña
--   3. MARCÁ la casilla "Auto Confirm User"
--   4. Create user
--
-- DESPUÉS:
--   · Cambiá el email de abajo por el tuyo (en los DOS lugares)
--   · Pegá todo esto en SQL Editor → New query → Run
-- ===================================================================

-- 👇 CAMBIÁ ESTE EMAIL POR EL TUYO 👇
update public.perfiles
   set rol = 'admin',
       activo = true
 where email = 'cambiame@ejemplo.com';

-- Y revisamos que haya funcionado:
select email,
       rol,
       activo,
       case
         when rol = 'admin' and activo
           then 'Listo: ya podés entrar al panel con este usuario'
         else 'Algo salió mal, fijate abajo'
       end as resultado
  from public.perfiles
 -- 👇 Y ESTE TAMBIÉN 👇
 where email = 'cambiame@ejemplo.com';

-- Si la consulta de arriba no devuelve NINGUNA fila, quiere decir que el
-- usuario todavía no existe en Authentication → Users, o que el email
-- está escrito distinto (fijate mayúsculas y espacios).
-- Para ver todos los usuarios que sí existen:
--
--   select email, rol, activo from public.perfiles order by creado_en;
