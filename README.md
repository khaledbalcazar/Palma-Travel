# Palma Travel — sitio web

Sitio de **Palma Travel**, agencia de viajes paraguaya registrada en SENATUR.
Cada paquete y cada propuesta tienen su propia página, pensada para compartirse
por WhatsApp e Instagram y para reemplazar al PDF que se mandaba antes.

> **Eslogan:** *Cada viaje, a tu medida.*

---

## Índice

1. [Lo que hay que completar antes de publicar](#1-lo-que-hay-que-completar-antes-de-publicar)
2. [Cómo agregar un paquete nuevo](#2-cómo-agregar-un-paquete-nuevo)
3. [Cómo crear una propuesta personalizada](#3-cómo-crear-una-propuesta-personalizada)
4. [Cómo cambiar el número de WhatsApp y los datos de contacto](#4-cómo-cambiar-el-número-de-whatsapp-y-los-datos-de-contacto)
5. [Cómo publicar el sitio](#5-cómo-publicar-el-sitio)
6. [Preparar Supabase paso a paso](#6-preparar-supabase-paso-a-paso)
7. [Guía de cada pantalla del panel](#7-guía-de-cada-pantalla-del-panel)
8. [Preguntas frecuentes del equipo](#8-preguntas-frecuentes-del-equipo)
9. [Para quien programa](#9-para-quien-programa)

---

## 1. Lo que hay que completar antes de publicar

El sitio está terminado, pero hay cosas que **nadie más que ustedes puede
completar**. Mientras estén vacías, el sitio las esconde en vez de mostrar un
dato inventado.

| Qué falta | Dónde se carga |
|---|---|
| Número de WhatsApp | Panel → Configuración del sitio |
| Email de contacto | Panel → Configuración del sitio |
| Dirección de la oficina y enlace del mapa | Panel → Configuración del sitio |
| Número de registro SENATUR | Panel → Configuración del sitio |
| Fotos reales de los paquetes | Panel → Paquetes → pestaña Fotos |
| Testimonios reales de clientes | Los de la página de inicio son de ejemplo |
| Dominio definitivo | Variable `NEXT_PUBLIC_SITE_URL` |

**Sobre las fotos:** los seis paquetes de ejemplo vienen con ilustraciones
propias, no con fotos reales. Están para que se vea cómo queda la página; hay
que reemplazarlas por fotos de verdad desde el panel. También se puede pegar la
dirección de una foto de Unsplash: ya está habilitado.

**Sobre los paquetes de ejemplo:** los seis vienen marcados como «ejemplo» y el
sitio lo aclara abajo de la página. Cuando carguen los paquetes reales, borren
los de ejemplo o desmarquen esa casilla (pestaña *Buscador* del formulario).

---

## 2. Cómo agregar un paquete nuevo

Todo se hace desde el panel, sin tocar código, y se puede hacer desde el celular.

1. Entrá a **tudominio.com/admin** con tu email y contraseña.
2. En el menú, tocá **Paquetes** y después **Paquete nuevo**.
3. Completá el formulario. Está dividido en pestañas; podés ir y venir entre
   ellas y guardar a medio hacer.

| Pestaña | Qué va ahí |
|---|---|
| **Datos generales** | Título, destino, país, región, tipo de viaje, para quién es, ritmo, duración y las frases destacadas |
| **Precio y fechas** | Precio desde, la base (*por persona en base doble*), hasta cuándo vale ese precio, y las fechas de salida |
| **Incluye / No incluye** | El interruptor de vuelo y las dos listas |
| **Itinerario** | Día por día |
| **Alojamiento** | Un ítem por hotel |
| **Fotos** | Arrastrá las fotos y escribí el texto alternativo de cada una |
| **Documentación** | Pasaporte, visas, vacunas, autorizaciones de menores |
| **Bases y condiciones** | El texto largo de siempre |
| **Preguntas frecuentes** | Lo que más te preguntan por WhatsApp |
| **Buscador** | Etiquetas para que el cuestionario lo encuentre |

4. Tocá **Vista previa** para ver la página tal como la va a ver el cliente.
5. Tocá **Guardar**.
6. Cuando esté listo para salir, poné el estado en **Activo**. Lo podés hacer
   desde el listado, sin entrar a editar.

### Cosas que conviene saber

- **El enlace se arma solo** con el título (*Río de Janeiro: playa y samba* →
  `rio-de-janeiro-playa-y-samba`). Se puede editar, pero **una vez publicado no
  conviene cambiarlo**: los enlaces que ya mandaste por WhatsApp dejan de andar.
- **Los cuatro estados**:
  - *Activo*: se ve y se puede consultar.
  - *Agotado*: se ve, con el cartel de agotado, y el botón invita a la lista de espera.
  - *Próximamente*: se ve, avisando que todavía no abrió la venta.
  - *Oculto*: no se ve en ningún lado. Es el estado con el que nace todo paquete nuevo.
- **Destacado**: aparece primero en el catálogo y en la página de inicio.
- **Últimos lugares**: pone un cartelito naranja que apura la consulta. Marcalo
  solo cuando de verdad queden pocos cupos.
- **Duplicar**: el ícono de las dos hojitas en el listado copia todo el paquete.
  Es la forma más rápida de armar «Punta Cana julio» a partir de «Punta Cana enero».
- **Las fotos se achican solas** antes de subirse: podés mandar la foto tal cual
  sale del celular.
- **El texto alternativo de las fotos es obligatorio.** Describí en pocas palabras
  qué se ve («pareja caminando por la playa al atardecer»). Es lo que leen las
  personas ciegas y lo que lee Google.
- **El cambio se ve en el sitio en unos segundos.** No hace falta avisarle a nadie
  ni volver a publicar.

---

## 3. Cómo crear una propuesta personalizada

Una propuesta es un viaje armado para un cliente puntual. **No aparece en el
catálogo, no aparece en Google y no se puede encontrar buscando**: se llega solo
con el enlace que vos le mandás.

1. Panel → **Propuestas** → **Propuesta nueva**.
2. Si se parece a un paquete que ya existe, usá **«Crear la propuesta a partir de
   un paquete»**: copia el itinerario, las fotos y todo lo demás, y después lo
   ajustás. Es lo más rápido.
3. Además de lo de siempre, completá:
   - **Nombre del cliente** → aparece en el saludo: *«Propuesta de viaje para
     Familia González»*.
   - **Válida hasta** → la fecha en que se vencen los precios.
   - **Notas internas** → lo que necesites recordar. **El cliente nunca las ve.**
4. Guardá.
5. En el listado, tocá **Copiar link** o **Enviar por WhatsApp** (este último abre
   WhatsApp con el mensaje ya escrito).

**Cuando la propuesta vence**, la página sigue abriendo pero arriba de todo
aparece un aviso grande de que venció, con un botón para pedir la actualizada.
En el inicio del panel vas a ver cuáles están vencidas.

---

## 4. Cómo cambiar el número de WhatsApp y los datos de contacto

### La forma normal: desde el panel

1. Entrá al panel (necesitás permisos de **administrador**).
2. Menú → **Configuración**.
3. Cambiá lo que necesites y tocá **Guardar la configuración**.

El número de WhatsApp va **solo con números, con código de país y sin el 0**:

| Número real | Cómo se escribe |
|---|---|
| 0981 123 456 | `595981123456` |
| 0971 555 777 | `595971555777` |

Todos los botones de WhatsApp del sitio salen de ahí. Si el campo está vacío, el
sitio esconde los botones en vez de llevar a una conversación rota.

Desde la misma pantalla también se cambian: email, teléfono, dirección, mapa,
redes, registro SENATUR, los textos de la portada, el tipo de cambio a guaraníes
y el peso de cada pregunta del cuestionario.

### La forma de respaldo: en el código

Si todavía no hay base de datos, los valores salen de `config/site.ts`. Es un
solo archivo y está comentado. Cada vez que se compila el sitio avisa qué datos
siguen faltando.

---

## 5. Cómo publicar el sitio

El sitio está pensado para **Vercel**, que tiene un plan gratis más que
suficiente.

1. Entrá a [vercel.com](https://vercel.com) y creá una cuenta con GitHub.
2. **Add New → Project** y elegí este repositorio.
3. Vercel reconoce solo que es Next.js. No toques nada de la configuración.
4. Antes de darle *Deploy*, abrí **Environment Variables** y cargá:

   | Variable | De dónde sale |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | El dominio final, sin barra al final |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (**secreta**) |
   | `NEXT_PUBLIC_GA4_ID` | Opcional, Google Analytics |
   | `NEXT_PUBLIC_META_PIXEL_ID` | Opcional, píxel de Meta |

5. **Deploy**. En un par de minutos está en línea.
6. Para usar el dominio propio: **Settings → Domains**, agregalo y seguí las
   instrucciones para apuntar el DNS.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` es una llave maestra: da acceso total a la base
> saltándose todos los permisos. Va solo en Vercel y en tu `.env.local`. Nunca en
> un mensaje, nunca en GitHub, nunca en el navegador.

**De ahí en más no hace falta volver a publicar nada.** Los paquetes, las
propuestas y la configuración se cargan desde el panel y se ven en segundos.
Solo hay que volver a publicar si alguien cambia el código.

---

## 6. Preparar Supabase paso a paso

Supabase es donde viven los datos, los usuarios y las fotos. Se hace una sola
vez, y lleva unos veinte minutos.

### 6.1. Crear el proyecto

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta.
2. **New project**.
3. Ponele un nombre (*palma-travel*), elegí una contraseña para la base de datos
   y **guardala en algún lado**.
4. En *Region* elegí **South America (São Paulo)**: es la más cercana a Paraguay
   y hace que el sitio cargue más rápido.
5. Esperá un par de minutos a que termine de armarse.

### 6.2. Crear las tablas

1. En el menú de la izquierda, entrá a **SQL Editor** → **New query**.
2. Abrí el archivo **`supabase/setup-completo.sql`** de este proyecto, copiá
   **todo** el contenido y pegalo ahí.
3. Tocá **Run**. Tiene que decir *Success*.

Eso crea las tablas, los permisos y la carpeta de fotos. Se puede volver a
correr las veces que haga falta: no borra ni duplica nada.

> `setup-completo.sql` se arma solo juntando todo lo que hay en
> `supabase/migrations/`. Si alguien agrega una migración nueva, hay que correr
> `npm run armar-sql` para regenerarlo.

### 6.3. Configurar las direcciones de Auth

**Este paso es fácil de saltear y, si se saltea, las invitaciones por email y el
«entrar con enlace» no funcionan.**

1. Menú → **Authentication** → **URL Configuration**.
2. En **Site URL** poné la dirección final del sitio
   (por ejemplo `https://palmatravel.com.py`).
3. En **Redirect URLs** agregá estas dos, una por línea:

   ```
   https://palmatravel.com.py/admin
   http://localhost:3000/admin
   ```

   (La segunda es para poder probar desde tu computadora.)

4. **Save**.

Si todavía no tenés el dominio definitivo, poné la dirección que te dé Vercel
(algo como `palma-travel.vercel.app`) y cambialo después.

> **Ojo con los emails:** el servidor de correo que trae Supabase de fábrica
> está limitado a unos pocos mails por hora, y sirve para probar. Si vas a
> invitar a varias personas seguidas, conviene conectar un servicio de email
> propio en **Authentication → Emails → SMTP Settings**.

### 6.4. Copiar las claves

1. **Project Settings** (el engranaje) → **API**.
2. Copiá:
   - *Project URL*
   - *anon public* key
   - *service_role* key (la secreta)
3. En la computadora, copiá el archivo `.env.example` y llamalo `.env.local`.
   Pegá ahí los tres valores.

### 6.5. Cargar el contenido de ejemplo

Desde la terminal, en la carpeta del proyecto:

```bash
npm install
npm run seed
```

Eso sube los 6 paquetes y la propuesta de ejemplo. Se puede correr las veces que
haga falta: actualiza en vez de duplicar.

### 6.6. Crear el primer usuario administrador

1. En Supabase: **Authentication** → **Users** → **Add user** → *Create new user*.
2. Poné tu email y una contraseña. Marcá **Auto Confirm User**.
3. Volvé a la terminal y corré:

   ```bash
   npm run seed -- --admin=tu@email.com
   ```

4. Listo: entrá a `/admin` con ese email y esa contraseña.

A partir de ahí, **al resto del equipo lo invitás desde el panel**, en la pantalla
de Usuarios. No hace falta volver a Supabase nunca más.

### 6.7. Revisar que quedó todo bien

Corré esto y te dice, una por una, si falta algo:

```bash
npm run verificar
```

Revisa las claves, que el proyecto responda, que estén las tablas, que el
contenido esté cargado, que los permisos funcionen de verdad (incluido que las
propuestas no se puedan listar desde afuera ni filtren las notas internas), que
la carpeta de fotos sea pública y que haya un administrador. Cuando algo está
mal, dice exactamente qué hacer.

Con los permisos puestos:

- Cualquiera puede ver los paquetes publicados.
- Nadie de afuera puede ver los paquetes ocultos.
- **Nadie de afuera puede listar las propuestas.** Solo se puede abrir una si se
  sabe el enlace exacto, y las notas internas no salen ni siquiera así.
- Solo el equipo puede cargar y editar.
- Solo los administradores tocan la configuración y los usuarios.

---

## 7. Guía de cada pantalla del panel

### Entrar (`/admin/login`)

Email y contraseña. Si te olvidaste la contraseña, tocá **«mandame un enlace por
email»** y entrás desde el mail, sin contraseña.

### Inicio (`/admin`)

Tres números arriba:

- **Paquetes activos**: los que se están vendiendo hoy.
- **Propuestas vigentes**: las que todavía no vencieron.
- **Para revisar**: paquetes cuyo precio vence o que salen dentro de 15 días.
  Si este número está en naranja, hay algo que mirar.

Abajo, la lista de lo que hay que revisar y las propuestas vencidas.

### Paquetes (`/admin/paquetes`)

El listado, con buscador y filtro por estado. En cada fila:

- El menú desplegable cambia el estado al instante.
- La estrella lo marca como destacado.
- Las dos hojitas lo duplican.
- La flecha lo abre en el sitio.
- El tacho lo elimina (pide confirmación).

Cada fila dice quién lo editó último y cuándo.

### Formulario de paquete

- Las pestañas con un **número rojo** tienen campos con problemas.
- Los errores se explican en español, abajo del campo.
- En las listas se agrega, se quita y se reordena: arrastrando en la computadora,
  o con las flechitas en el celular.
- **Vista previa** abre una pestaña con la página tal como va a quedar.
- Si te vas con cambios sin guardar, el navegador te avisa.

### Propuestas (`/admin/propuestas`)

Igual que paquetes, más el filtro entre vigentes y vencidas, y los botones de
**Copiar link** y **Enviar por WhatsApp**.

### Configuración (`/admin/configuracion`) — solo administradores

Datos de contacto, textos de la portada, precios en guaraníes y los pesos del
cuestionario.

**Los pesos del cuestionario** son cuánto manda cada pregunta en el resultado.
Por defecto, el tipo de viaje y el presupuesto son los que más pesan. Si te
parece que las recomendaciones no dan en el clavo, movelos y probá el
cuestionario. El botón **Restaurar** vuelve todo como estaba.

### Usuarios (`/admin/usuarios`) — solo administradores

- **Invitar**: le llega un mail con un enlace para elegir su contraseña.
- **Administrador**: puede todo, incluidos la configuración y los usuarios.
- **Editor**: carga y edita paquetes y propuestas.
- **Desactivar**: le corta el acceso sin borrarle nada de lo que hizo.

No hay registro abierto: al panel solo entra quien fue invitado.

---

## 8. Preguntas frecuentes del equipo

**Cargué un paquete y no lo veo en el sitio.**
Fijate el estado: los paquetes nuevos nacen en *Oculto*. Ponelo en *Activo*.

**Cambié algo y el sitio sigue igual.**
Esperá unos segundos y recargá con `Ctrl + Shift + R` (o `Cmd + Shift + R`).

**¿Puedo cargar todo desde el celular?**
Sí. El panel entero está pensado para el celular, incluida la subida de fotos.

**Borré un paquete sin querer.**
No se puede deshacer. Por eso, si solo querés sacarlo del sitio, usá *Oculto* en
vez de eliminarlo.

**Mandé un enlace de propuesta y el cliente dice que no abre.**
Revisá que la propuesta esté guardada y que el enlace esté completo. Si venció,
igual abre, pero con el aviso de vencida.

**¿Los clientes pueden ver las notas internas?**
No. No salen en la página, ni en el código de la página.

**Quiero cambiar los colores de la marca.**
Están todos en un solo archivo, `styles/tokens.css`. Que lo toque quien programa.

**El cuestionario me recomienda cosas raras.**
Revisá que los paquetes tengan bien cargados el tipo de viaje, el ideal para y el
ritmo. Después, si hace falta, ajustá los pesos en Configuración.

---

## 9. Para quien programa

### Instalar y levantar

```bash
npm install
cp .env.example .env.local   # y completar
npm run dev                  # http://localhost:3000
```

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en modo desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Levanta lo compilado |
| `npm test` | Corre los tests del algoritmo de coincidencia |
| `npm run typecheck` | Revisa los tipos |
| `npm run validar-contenido` | Valida los JSON de ejemplo contra el schema |
| `npm run seed` | Carga el contenido de ejemplo en Supabase |
| `npm run verificar` | Revisa que Supabase esté bien conectado y con los permisos puestos |
| `npm run armar-sql` | Regenera `supabase/setup-completo.sql` desde las migraciones |

### Cómo está armado

```
app/
  (sitio)/            Sitio público (home, paquetes, cuestionario, contacto, propuesta)
  admin/              Panel, protegido por middleware
  sitemap.ts robots.ts
components/
  ui/ site/ paquete/ cuestionario/ admin/
lib/
  schema.ts           Schema Zod: la fuente de verdad de los datos
  data.ts             Capa de datos (getPaquetes, getPaquete, getPropuesta, getConfig)
  match.ts            Algoritmo del cuestionario (función pura) + match.test.ts
  filtros.ts          Filtros del catálogo, sincronizados con la URL
  supabase/           Clientes, consultas y traducción fila ↔ objeto
  admin/              Sesión, acciones del panel y modelo del formulario
config/site.ts        Datos de contacto y de marca (respaldo del panel)
content/seed/         Los 6 paquetes y la propuesta de ejemplo
supabase/migrations/  SQL de la base y los permisos
styles/tokens.css     Paleta y tipografía de la marca
```

### Decisiones que conviene conocer

- **Un solo schema Zod** valida los formularios del panel, lo que sale de la base
  y los archivos de ejemplo. Si agregás un campo ahí, lo tenés en los dos lados.
- **La capa de datos está detrás de funciones.** Hoy leen de Supabase, y si no
  hay variables de entorno caen a los archivos de `content/seed`. Cambiar de
  origen no obliga a tocar ninguna página.
- **Las propuestas no son listables.** No hay política de lectura pública sobre la
  tabla: el sitio las lee de a una con una función `security definer` que filtra
  por slug exacto y no devuelve las notas internas.
- **El catálogo se genera estático** y filtra en el navegador, con los filtros
  guardados en la URL. Las landings de paquete son estáticas con revalidación de
  una hora, más `revalidateTag` al guardar desde el panel.
- **El algoritmo de coincidencia es una función pura y determinística**, sin IA.
  El presupuesto funciona como filtro blando: el puntaje cae rápido pero nunca se
  corta, así entre dos viajes fuera de presupuesto siempre gana el menos caro.
- **La paleta y la tipografía son tokens** en `styles/tokens.css`. Cambiar la
  marca es cambiar ese archivo.
- **El logo** es un SVG en `components/site/Logo.tsx`, pensado para reemplazarse.

### Accesibilidad y rendimiento

- Contraste AA, `alt` obligatorio en las fotos, navegación por teclado y foco
  visible en todo el sitio.
- Todas las fotos pasan por `next/image`.
- Sin scripts de terceros si no se configuran GA4 ni el píxel de Meta.
- Hoja de estilos de impresión: *Guardar como PDF* deja una página prolija, sin
  menú ni botones y con los acordeones abiertos.
