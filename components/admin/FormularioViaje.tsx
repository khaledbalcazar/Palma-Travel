"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Save, TriangleAlert } from "lucide-react";
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  ETIQUETA_IDEAL_PARA,
  ETIQUETA_REGION,
  ETIQUETA_RITMO,
  ETIQUETA_TIPO_VIAJE,
  IDEAL_PARA,
  REGIONES,
  RITMOS,
  TIPOS_VIAJE,
  type Estado,
  type IdealPara,
  type Region,
  type Ritmo,
  type TipoViaje,
} from "@/lib/schema";
import { guardarPaquete, guardarPropuesta, type Resultado } from "@/lib/admin/acciones";
import {
  aDatosDeViaje,
  borradorVacio,
  type Borrador,
} from "@/lib/admin/borrador";
import { aSlug, cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";
import {
  CampoArea,
  CampoEtiquetas,
  CampoInterruptor,
  CampoSelect,
  CampoTexto,
} from "@/components/admin/Campos";
import { ListaEditable, ListaDeTextos } from "@/components/admin/ListaEditable";
import { SubidorFotos } from "@/components/admin/SubidorFotos";

/* ===================================================================
   FORMULARIO DE PAQUETES Y PROPUESTAS
   Es el mismo formulario para los dos: la propuesta suma los datos del
   cliente y la fecha de validez, y no tiene estado ni destacado.
   =================================================================== */

type Seccion =
  | "general"
  | "precio"
  | "incluye"
  | "itinerario"
  | "alojamiento"
  | "fotos"
  | "documentacion"
  | "bases"
  | "faq"
  | "etiquetas";

const SECCIONES: { id: Seccion; etiqueta: string; campos: string[] }[] = [
  {
    id: "general",
    etiqueta: "Datos generales",
    campos: ["slug", "titulo", "destino", "pais", "region", "estado", "tipoViaje",
             "idealPara", "ritmo", "duracionDias", "duracionNoches", "ultimosLugares",
             "clienteNombre", "validaHasta", "highlights"],
  },
  {
    id: "precio",
    etiqueta: "Precio y fechas",
    campos: ["precioDesde", "moneda", "basePrecio", "vigenciaPrecio",
             "fechasSalida", "salidaGrupal", "coordinadores"],
  },
  { id: "incluye", etiqueta: "Incluye / No incluye", campos: ["incluye", "noIncluye", "incluyeVuelo"] },
  { id: "itinerario", etiqueta: "Itinerario", campos: ["itinerario"] },
  { id: "alojamiento", etiqueta: "Alojamiento", campos: ["alojamiento"] },
  { id: "fotos", etiqueta: "Fotos", campos: ["imagenPortada", "galeria"] },
  { id: "documentacion", etiqueta: "Documentación", campos: ["documentacion"] },
  { id: "bases", etiqueta: "Bases y condiciones", campos: ["basesYCondiciones", "notasInternas"] },
  { id: "faq", etiqueta: "Preguntas frecuentes", campos: ["faq"] },
  { id: "etiquetas", etiqueta: "Buscador", campos: ["tags"] },
];

export function FormularioViaje({
  modo,
  inicial,
  id,
}: {
  modo: "paquete" | "propuesta";
  inicial?: Borrador;
  id?: string;
}) {
  const router = useRouter();
  const [datos, setDatos] = useState<Borrador>(inicial ?? borradorVacio());
  const [seccion, setSeccion] = useState<Seccion>("general");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [sinGuardar, setSinGuardar] = useState(false);
  const [guardando, empezarGuardado] = useTransition();
  const [slugTocado, setSlugTocado] = useState(Boolean(inicial?.slug));
  const zonaAviso = useRef<HTMLDivElement>(null);

  const actualizar = <C extends keyof Borrador>(campo: C, valor: Borrador[C]) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
    setSinGuardar(true);
  };

  /* El enlace se arma solo desde el título, hasta que alguien lo edita. */
  useEffect(() => {
    if (slugTocado) return;
    setDatos((anterior) => ({ ...anterior, slug: aSlug(anterior.titulo) }));
  }, [datos.titulo, slugTocado]);

  /* Aviso del navegador al salir con cambios sin guardar */
  useEffect(() => {
    if (!sinGuardar) return;
    const alSalir = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [sinGuardar]);

  /* Cuántos errores tiene cada pestaña, para marcarlas */
  const erroresPorSeccion = useMemo(() => {
    const cuenta: Partial<Record<Seccion, number>> = {};
    for (const clave of Object.keys(errores)) {
      const raiz = clave.split(".")[0]!;
      const s = SECCIONES.find((x) => x.campos.includes(raiz));
      if (s) cuenta[s.id] = (cuenta[s.id] ?? 0) + 1;
    }
    return cuenta;
  }, [errores]);

  function vistaPrevia() {
    try {
      sessionStorage.setItem(
        "palma:vista-previa",
        JSON.stringify({ modo, datos: aDatosDeViaje(datos, modo) }),
      );
      window.open("/admin/vista-previa", "_blank", "noopener");
    } catch {
      setAviso({
        tipo: "error",
        texto: "No se pudo abrir la vista previa en este navegador.",
      });
    }
  }

  function guardar() {
    setAviso(null);
    empezarGuardado(async () => {
      const payload = aDatosDeViaje(datos, modo);
      const resultado: Resultado =
        modo === "paquete"
          ? await guardarPaquete(payload, id)
          : await guardarPropuesta(payload, id);

      if (resultado.ok) {
        setErrores({});
        setSinGuardar(false);
        setAviso({ tipo: "ok", texto: resultado.mensaje ?? "Guardado." });
        if (!id && resultado.id) {
          router.replace(
            `/admin/${modo === "paquete" ? "paquetes" : "propuestas"}/${resultado.id}`,
          );
        }
        router.refresh();
      } else {
        setErrores(resultado.errores ?? {});
        setAviso({ tipo: "error", texto: resultado.mensaje });
        /* Saltar a la primera pestaña con problemas */
        const primera = Object.keys(resultado.errores ?? {})[0];
        if (primera) {
          const raiz = primera.split(".")[0]!;
          const s = SECCIONES.find((x) => x.campos.includes(raiz));
          if (s) setSeccion(s.id);
        }
      }
      zonaAviso.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  const esPaquete = modo === "paquete";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardar();
      }}
    >
      {/* Barra de acciones, siempre a la vista */}
      <div className="sticky top-0 z-20 -mx-5 mb-6 flex flex-wrap items-center gap-3 border-b border-palma-900/10 bg-arena-100/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-palma-900">
            {datos.titulo || (esPaquete ? "Paquete nuevo" : "Propuesta nueva")}
          </p>
          {sinGuardar && (
            <p className="text-xs text-coral-700">Tenés cambios sin guardar</p>
          )}
        </div>

        <Boton type="button" variante="secundario" onClick={vistaPrevia}>
          <Eye className="size-4" aria-hidden="true" />
          Vista previa
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          Guardar
        </Boton>
      </div>

      <div ref={zonaAviso} aria-live="polite">
        {aviso && (
          <p
            role={aviso.tipo === "error" ? "alert" : "status"}
            className={cn(
              "mb-5 rounded-xl px-4 py-3 text-sm",
              aviso.tipo === "ok"
                ? "bg-palma-100 text-palma-800"
                : "bg-coral-100 text-coral-800",
            )}
          >
            {aviso.texto}
          </p>
        )}
      </div>

      {/* Pestañas */}
      <div className="scrollbar-oculta -mx-5 mb-6 overflow-x-auto px-5 md:-mx-8 md:px-8">
        <div role="tablist" className="flex w-max gap-1.5">
          {SECCIONES.map((s) => {
            const activa = seccion === s.id;
            const conErrores = erroresPorSeccion[s.id] ?? 0;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => setSeccion(s.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  activa
                    ? "bg-palma-800 text-arena-50"
                    : "bg-arena-50 text-tinta-600 ring-1 ring-inset ring-palma-900/10 hover:bg-arena-200",
                )}
              >
                {s.etiqueta}
                {conErrores > 0 && (
                  <span
                    className="inline-flex size-5 items-center justify-center rounded-full bg-coral-600 text-[0.65rem] text-white"
                    aria-label={`${conErrores} campos con problemas`}
                  >
                    {conErrores}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-7 rounded-2xl bg-arena-50 p-5 md:p-7">
        {seccion === "general" && (
          <SeccionGeneral
            datos={datos}
            actualizar={actualizar}
            errores={errores}
            esPaquete={esPaquete}
            alTocarSlug={() => setSlugTocado(true)}
          />
        )}
        {seccion === "precio" && (
          <SeccionPrecio datos={datos} actualizar={actualizar} errores={errores} />
        )}
        {seccion === "incluye" && (
          <SeccionIncluye datos={datos} actualizar={actualizar} errores={errores} />
        )}
        {seccion === "itinerario" && (
          <ListaEditable
            titulo="Itinerario día por día"
            ayuda="Es lo que más miran los clientes. Contá qué se hace cada día."
            items={datos.itinerario}
            alCambiar={(v) => actualizar("itinerario", v)}
            itemNuevo={() => ({
              dia: datos.itinerario.length + 1,
              titulo: "",
              descripcion: "",
            })}
            textoAgregar="Agregar un día"
            error={errores.itinerario}
          >
            {(dia, actualizarDia, i) => (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={dia.dia}
                    onChange={(e) =>
                      actualizarDia({ ...dia, dia: Number(e.target.value) })
                    }
                    aria-label={`Número de día del ítem ${i + 1}`}
                    className="w-20 rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    value={dia.titulo}
                    onChange={(e) => actualizarDia({ ...dia, titulo: e.target.value })}
                    placeholder="Título del día"
                    aria-label={`Título del día ${i + 1}`}
                    className="flex-1 rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                  />
                </div>
                <textarea
                  value={dia.descripcion}
                  onChange={(e) =>
                    actualizarDia({ ...dia, descripcion: e.target.value })
                  }
                  rows={3}
                  placeholder="Qué se hace ese día"
                  aria-label={`Descripción del día ${i + 1}`}
                  className="w-full resize-y rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
              </div>
            )}
          </ListaEditable>
        )}
        {seccion === "alojamiento" && (
          <ListaEditable
            titulo="Alojamiento"
            ayuda="Un ítem por hotel. Si el viaje pasa por varias ciudades, agregá uno por cada una."
            items={datos.alojamiento}
            alCambiar={(v) => actualizar("alojamiento", v)}
            itemNuevo={() => ({ nombre: "", categoria: "", noches: 1, ciudad: "" })}
            textoAgregar="Agregar un hotel"
            error={errores.alojamiento}
          >
            {(hotel, actualizarHotel, i) => (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={hotel.nombre}
                  onChange={(e) => actualizarHotel({ ...hotel, nombre: e.target.value })}
                  placeholder="Nombre del hotel"
                  aria-label={`Nombre del hotel ${i + 1}`}
                  className="rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
                <input
                  value={hotel.ciudad}
                  onChange={(e) => actualizarHotel({ ...hotel, ciudad: e.target.value })}
                  placeholder="Ciudad"
                  aria-label={`Ciudad del hotel ${i + 1}`}
                  className="rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
                <input
                  value={hotel.categoria}
                  onChange={(e) =>
                    actualizarHotel({ ...hotel, categoria: e.target.value })
                  }
                  placeholder="Categoría (4 estrellas, all inclusive…)"
                  aria-label={`Categoría del hotel ${i + 1}`}
                  className="rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
                <input
                  type="number"
                  min={1}
                  value={hotel.noches}
                  onChange={(e) =>
                    actualizarHotel({ ...hotel, noches: Number(e.target.value) })
                  }
                  placeholder="Noches"
                  aria-label={`Noches en el hotel ${i + 1}`}
                  className="rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm"
                />
              </div>
            )}
          </ListaEditable>
        )}
        {seccion === "fotos" && (
          <SubidorFotos
            slug={datos.slug}
            portada={datos.imagenPortada}
            galeria={datos.galeria}
            alCambiarPortada={(v) => actualizar("imagenPortada", v)}
            alCambiarGaleria={(v) => actualizar("galeria", v)}
            error={errores.imagenPortada ?? errores.galeria}
          />
        )}
        {seccion === "documentacion" && (
          <ListaEditable
            titulo="Documentación necesaria"
            ayuda="Pasaporte, visas, vacunas, autorizaciones para menores…"
            items={datos.documentacion}
            alCambiar={(v) => actualizar("documentacion", v)}
            itemNuevo={() => ({ titulo: "", detalle: "" })}
            textoAgregar="Agregar un requisito"
            error={errores.documentacion}
          >
            {(doc, actualizarDoc, i) => (
              <div className="space-y-2">
                <input
                  value={doc.titulo}
                  onChange={(e) => actualizarDoc({ ...doc, titulo: e.target.value })}
                  placeholder="Pasaporte"
                  aria-label={`Título del requisito ${i + 1}`}
                  className="w-full rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
                <textarea
                  value={doc.detalle}
                  onChange={(e) => actualizarDoc({ ...doc, detalle: e.target.value })}
                  rows={2}
                  placeholder="Con validez mínima de 6 meses desde la fecha de regreso."
                  aria-label={`Detalle del requisito ${i + 1}`}
                  className="w-full resize-y rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
              </div>
            )}
          </ListaEditable>
        )}
        {seccion === "bases" && (
          <>
            <CampoArea
              id="basesYCondiciones"
              etiqueta="Bases y condiciones"
              ayuda="Señas, cancelaciones, variaciones de tarifa, responsabilidad de la agencia. Se muestra en la página, dentro de una sección que se abre y se cierra."
              rows={14}
              value={datos.basesYCondiciones}
              onChange={(e) => actualizar("basesYCondiciones", e.target.value)}
              error={errores.basesYCondiciones}
            />
            {modo === "propuesta" && (
              <CampoArea
                id="notasInternas"
                etiqueta="Notas internas"
                ayuda="Solo las ve el equipo. El cliente nunca las ve."
                rows={5}
                value={datos.notasInternas}
                onChange={(e) => actualizar("notasInternas", e.target.value)}
                error={errores.notasInternas}
              />
            )}
          </>
        )}
        {seccion === "faq" && (
          <ListaEditable
            titulo="Preguntas frecuentes"
            ayuda="Anotá acá las preguntas que más te hacen por WhatsApp: te ahorran trabajo después."
            items={datos.faq}
            alCambiar={(v) => actualizar("faq", v)}
            itemNuevo={() => ({ pregunta: "", respuesta: "" })}
            textoAgregar="Agregar una pregunta"
            error={errores.faq}
          >
            {(item, actualizarItem, i) => (
              <div className="space-y-2">
                <input
                  value={item.pregunta}
                  onChange={(e) =>
                    actualizarItem({ ...item, pregunta: e.target.value })
                  }
                  placeholder="¿El vuelo sale de Asunción?"
                  aria-label={`Pregunta ${i + 1}`}
                  className="w-full rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
                <textarea
                  value={item.respuesta}
                  onChange={(e) =>
                    actualizarItem({ ...item, respuesta: e.target.value })
                  }
                  rows={3}
                  placeholder="Sí, todas nuestras salidas son desde…"
                  aria-label={`Respuesta ${i + 1}`}
                  className="w-full resize-y rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm placeholder:text-tinta-300"
                />
              </div>
            )}
          </ListaEditable>
        )}
        {seccion === "etiquetas" && (
          <>
            <ListaDeTextos
              titulo="Etiquetas para el buscador"
              ayuda="Palabras sueltas con las que alguien podría buscar este viaje: playa, all inclusive, luna de miel, económico…"
              items={datos.tags}
              alCambiar={(v) => actualizar("tags", v)}
              placeholder="playa"
              textoAgregar="Agregar una etiqueta"
              error={errores.tags}
            />
            <CampoInterruptor
              id="esEjemplo"
              etiqueta="Es contenido de ejemplo"
              ayuda="Marcado, el sitio lo muestra con una aclaración de que es un viaje de muestra."
              checked={datos.esEjemplo}
              onChange={(v) => actualizar("esEjemplo", v)}
            />
          </>
        )}
      </div>

      {Object.keys(errores).length > 0 && (
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-coral-100 px-4 py-3 text-sm text-coral-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Quedan {Object.keys(errores).length} campos por corregir. Las pestañas
            con problemas están marcadas con un número rojo.
          </span>
        </p>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------
   Secciones
   ------------------------------------------------------------------ */

type PropsSeccion = {
  datos: Borrador;
  actualizar: <C extends keyof Borrador>(campo: C, valor: Borrador[C]) => void;
  errores: Record<string, string>;
};

function SeccionGeneral({
  datos,
  actualizar,
  errores,
  esPaquete,
  alTocarSlug,
}: PropsSeccion & { esPaquete: boolean; alTocarSlug: () => void }) {
  return (
    <div className="space-y-6">
      {!esPaquete && (
        <div className="grid gap-5 rounded-xl bg-coral-50 p-5 sm:grid-cols-2">
          <CampoTexto
            id="clienteNombre"
            etiqueta="Nombre del cliente"
            ayuda="Aparece en el saludo de la propuesta."
            required
            value={datos.clienteNombre}
            onChange={(e) => actualizar("clienteNombre", e.target.value)}
            error={errores.clienteNombre}
          />
          <CampoTexto
            id="validaHasta"
            etiqueta="Válida hasta"
            ayuda="Después de esta fecha la página avisa que la propuesta venció."
            type="date"
            required
            value={datos.validaHasta}
            onChange={(e) => actualizar("validaHasta", e.target.value)}
            error={errores.validaHasta}
          />
        </div>
      )}

      <CampoTexto
        id="titulo"
        etiqueta="Título"
        ayuda="Cómo se llama el viaje. Es lo primero que se ve."
        required
        value={datos.titulo}
        onChange={(e) => actualizar("titulo", e.target.value)}
        error={errores.titulo}
      />

      <CampoTexto
        id="slug"
        etiqueta="Enlace (slug)"
        ayuda="Se arma solo con el título. Es la parte final de la dirección web."
        required
        value={datos.slug}
        onChange={(e) => {
          alTocarSlug();
          actualizar("slug", e.target.value);
        }}
        error={errores.slug}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          id="destino"
          etiqueta="Destino"
          required
          value={datos.destino}
          onChange={(e) => actualizar("destino", e.target.value)}
          error={errores.destino}
        />
        <CampoTexto
          id="pais"
          etiqueta="País"
          required
          value={datos.pais}
          onChange={(e) => actualizar("pais", e.target.value)}
          error={errores.pais}
        />
        <CampoSelect
          id="region"
          etiqueta="Región"
          required
          value={datos.region}
          onChange={(e) => actualizar("region", e.target.value as Region)}
          error={errores.region}
          opciones={REGIONES.map((r) => ({ valor: r, etiqueta: ETIQUETA_REGION[r] }))}
        />
        {esPaquete && (
          <CampoSelect
            id="estado"
            etiqueta="Estado"
            ayuda="«Oculto» no se ve en el sitio."
            value={datos.estado}
            onChange={(e) => actualizar("estado", e.target.value as Estado)}
            error={errores.estado}
            opciones={ESTADOS.map((e) => ({ valor: e, etiqueta: ETIQUETA_ESTADO[e] }))}
          />
        )}
      </div>

      <CampoEtiquetas
        etiqueta="Tipo de viaje"
        ayuda="Pesa mucho en el cuestionario del sitio. Elegí todos los que correspondan."
        opciones={TIPOS_VIAJE.map((t) => ({ valor: t, etiqueta: ETIQUETA_TIPO_VIAJE[t] }))}
        seleccionadas={datos.tipoViaje}
        alCambiar={(v) => actualizar("tipoViaje", v as TipoViaje[])}
        error={errores.tipoViaje}
      />

      <CampoEtiquetas
        etiqueta="Ideal para"
        opciones={IDEAL_PARA.map((v) => ({ valor: v, etiqueta: ETIQUETA_IDEAL_PARA[v] }))}
        seleccionadas={datos.idealPara}
        alCambiar={(v) => actualizar("idealPara", v as IdealPara[])}
        error={errores.idealPara}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <CampoSelect
          id="ritmo"
          etiqueta="Ritmo"
          value={datos.ritmo}
          onChange={(e) => actualizar("ritmo", e.target.value as Ritmo)}
          error={errores.ritmo}
          opciones={RITMOS.map((r) => ({ valor: r, etiqueta: ETIQUETA_RITMO[r] }))}
        />
        <CampoTexto
          id="duracionDias"
          etiqueta="Días"
          type="number"
          min={1}
          required
          value={datos.duracionDias}
          onChange={(e) => actualizar("duracionDias", e.target.value)}
          error={errores.duracionDias}
        />
        <CampoTexto
          id="duracionNoches"
          etiqueta="Noches"
          type="number"
          min={0}
          required
          value={datos.duracionNoches}
          onChange={(e) => actualizar("duracionNoches", e.target.value)}
          error={errores.duracionNoches}
        />
      </div>

      <ListaDeTextos
        titulo="Frases destacadas"
        ayuda="Entre 3 y 6 frases cortas con lo mejor del viaje. Van arriba de todo en la página."
        items={datos.highlights}
        alCambiar={(v) => actualizar("highlights", v)}
        placeholder="Cristo Redentor y Pan de Azúcar en un solo día"
        textoAgregar="Agregar una frase"
        error={errores.highlights}
      />

      {esPaquete && (
        <div className="space-y-4">
          <CampoInterruptor
            id="destacado"
            etiqueta="Destacado"
            ayuda="Los destacados aparecen primero en el catálogo y en la página de inicio."
            checked={datos.destacado}
            onChange={(v) => actualizar("destacado", v)}
          />
          <CampoInterruptor
            id="ultimosLugares"
            etiqueta="Últimos lugares"
            ayuda="Marcalo cuando queden pocos cupos: el catálogo lo muestra con un cartelito que apura la consulta."
            checked={datos.ultimosLugares}
            onChange={(v) => actualizar("ultimosLugares", v)}
          />
        </div>
      )}
    </div>
  );
}

function SeccionPrecio({ datos, actualizar, errores }: PropsSeccion) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          id="precioDesde"
          etiqueta="Precio desde"
          ayuda="Solo el número, sin símbolos ni puntos."
          type="number"
          min={0}
          required
          value={datos.precioDesde}
          onChange={(e) => actualizar("precioDesde", e.target.value)}
          error={errores.precioDesde}
        />
        <CampoSelect
          id="moneda"
          etiqueta="Moneda"
          value={datos.moneda}
          onChange={(e) => actualizar("moneda", e.target.value as "USD" | "PYG")}
          error={errores.moneda}
          opciones={[
            { valor: "USD", etiqueta: "Dólares (USD)" },
            { valor: "PYG", etiqueta: "Guaraníes (Gs.)" },
          ]}
        />
        <CampoTexto
          id="basePrecio"
          etiqueta="Base del precio"
          ayuda="Por ejemplo: por persona en base doble."
          required
          value={datos.basePrecio}
          onChange={(e) => actualizar("basePrecio", e.target.value)}
          error={errores.basePrecio}
        />
        <CampoTexto
          id="vigenciaPrecio"
          etiqueta="El precio vale hasta"
          ayuda="Opcional. Sirve para que el panel te avise cuando está por vencer."
          type="date"
          value={datos.vigenciaPrecio}
          onChange={(e) => actualizar("vigenciaPrecio", e.target.value)}
          error={errores.vigenciaPrecio}
        />
      </div>

      <fieldset className="rounded-xl bg-arena-100 p-5">
        <legend className="px-1 text-sm font-medium text-tinta-700">
          Fechas de salida
        </legend>

        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="tipoSalida"
              checked={datos.salidaFlexible}
              onChange={() => actualizar("salidaFlexible", true)}
              className="size-4 accent-palma-700"
            />
            Salida flexible (se arma con la fecha que el cliente quiera)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="tipoSalida"
              checked={!datos.salidaFlexible}
              onChange={() => actualizar("salidaFlexible", false)}
              className="size-4 accent-palma-700"
            />
            Fechas concretas
          </label>
        </div>

        {!datos.salidaFlexible && (
          <div className="mt-5">
            <ListaEditable
              titulo="Fechas"
              items={datos.fechas}
              alCambiar={(v) => actualizar("fechas", v)}
              itemNuevo={() => ""}
              textoAgregar="Agregar una fecha"
              error={errores.fechasSalida}
            >
              {(fecha, actualizarFecha, i) => (
                <>
                  <label className="solo-lectores" htmlFor={`fecha-${i}`}>
                    Fecha de salida {i + 1}
                  </label>
                  <input
                    id={`fecha-${i}`}
                    type="date"
                    value={fecha}
                    onChange={(e) => actualizarFecha(e.target.value)}
                    className="w-full rounded-lg border border-palma-900/15 bg-white px-3 py-2 text-sm"
                  />
                </>
              )}
            </ListaEditable>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <CampoInterruptor
            id="salidaGrupal"
            etiqueta="Es salida grupal"
            ayuda="Con acompañamiento del equipo. Necesita fechas concretas."
            checked={datos.salidaGrupal}
            onChange={(v) => actualizar("salidaGrupal", v)}
          />
          {datos.salidaGrupal && (
            <ListaDeTextos
              titulo="Coordinadores"
              ayuda="Quiénes acompañan al grupo."
              items={datos.coordinadores}
              alCambiar={(v) => actualizar("coordinadores", v)}
              placeholder="Silvia Ayala"
              textoAgregar="Agregar un coordinador"
              error={errores.coordinadores}
            />
          )}
        </div>
      </fieldset>
    </div>
  );
}

function SeccionIncluye({ datos, actualizar, errores }: PropsSeccion) {
  return (
    <div className="space-y-7">
      <div
        className={cn(
          "rounded-xl p-5",
          datos.incluyeVuelo ? "bg-palma-50" : "bg-coral-50",
        )}
      >
        <CampoInterruptor
          id="incluyeVuelo"
          etiqueta="El paquete incluye el vuelo"
          ayuda={
            datos.incluyeVuelo
              ? "Se muestra como «Vuelo incluido» en el catálogo y en la página."
              : "Atención: se va a mostrar bien grande que NO incluye vuelo, para que nadie se confunda."
          }
          checked={datos.incluyeVuelo}
          onChange={(v) => actualizar("incluyeVuelo", v)}
        />
      </div>

      <ListaDeTextos
        titulo="Qué incluye"
        ayuda="Un ítem por línea. Cuanto más claro, menos preguntas después."
        items={datos.incluye}
        alCambiar={(v) => actualizar("incluye", v)}
        placeholder="Pasaje aéreo Asunción – Río de Janeiro – Asunción con equipaje de 23 kg"
        textoAgregar="Agregar un ítem"
        error={errores.incluye}
      />

      <ListaDeTextos
        titulo="Qué NO incluye"
        ayuda="Igual de importante que lo anterior: evita malentendidos."
        items={datos.noIncluye}
        alCambiar={(v) => actualizar("noIncluye", v)}
        placeholder="Almuerzos y cenas"
        textoAgregar="Agregar un ítem"
        error={errores.noIncluye}
      />
    </div>
  );
}
