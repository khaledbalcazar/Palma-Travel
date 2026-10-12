"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  MessageCircle,
  Users,
} from "lucide-react";
import type { Paquete, SiteConfig } from "@/lib/schema";
import { fechaLarga, precioMostrable } from "@/lib/format";
import { linkWhatsApp, mensajeConsultaPaquete } from "@/lib/whatsapp";
import { registrarEvento } from "@/lib/analytics";

export function ConsultaPaquete({
  paquete,
  config,
  hoy,
}: {
  paquete: Paquete;
  config: Pick<
    SiteConfig,
    "whatsapp" | "mostrarPrecioEnGuaranies" | "tipoCambioUsdGs"
  >;
  hoy: string;
}) {
  const [fecha, setFecha] = useState("");
  const [viajeros, setViajeros] = useState("2");
  const [copiado, setCopiado] = useState(false);
  const [copiaManual, setCopiaManual] = useState(false);
  const precio = precioMostrable(paquete.precioDesde, paquete.moneda, config);
  const mensaje = mensajeConsultaPaquete(paquete, { fecha, viajeros });
  const enlace = linkWhatsApp(config, mensaje);
  const agotado = paquete.estado === "agotado";
  const proximamente = paquete.estado === "proximamente";
  const fechas =
    paquete.fechasSalida === "flexible"
      ? []
      : paquete.fechasSalida.filter((f) => f >= hoy);
  const invalidarCopia = () => {
    setCopiado(false);
    setCopiaManual(false);
  };
  async function consultar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enlace) {
      registrarEvento("click_whatsapp", {
        origen: "consulta_paquete",
        paquete: paquete.titulo,
      });
      window.open(enlace, "_blank", "noopener,noreferrer");
    } else {
      try {
        await navigator.clipboard.writeText(mensaje);
        setCopiado(true);
      } catch {
        setCopiaManual(true);
      }
    }
  }
  return (
    <>
      <aside
        id="consulta"
        className="detalle-consulta"
        aria-labelledby="consulta-titulo"
      >
        <p className="consulta-antetitulo">TU PRÓXIMO VIAJE</p>
        <h2 id="consulta-titulo">
          {agotado
            ? "Sumate a la lista de espera"
            : proximamente
              ? "Conocé la próxima salida"
              : "Empecemos a planearlo"}
        </h2>
        <div className="consulta-precio">
          <span>Desde</span>
          <strong>{precio.principal}</strong>
          {precio.equivalente && <span>≈ {precio.equivalente}</span>}
          <p>{paquete.basePrecio}</p>
        </div>
        {paquete.esEjemplo && (
          <p className="consulta-ejemplo">
            Paquete de ejemplo. Precio y fechas ilustrativos.
          </p>
        )}
        {(agotado || proximamente) && (
          <p className="consulta-estado">
            {agotado
              ? "Esta salida está completa. Consultá por nuevas fechas o una lista de espera."
              : "Salida próximamente. Consultá las condiciones y la disponibilidad con el equipo."}
          </p>
        )}
        <form onSubmit={consultar} data-print="ocultar">
          <label className="consulta-campo">
            <span>
              <CalendarDays size={15} aria-hidden="true" />
              {paquete.fechasSalida === "flexible"
                ? "Fecha que te gustaría viajar"
                : "Salida de tu interés"}
            </span>
            {paquete.fechasSalida === "flexible" ? (
              <input
                aria-label="Fecha preferida"
                type="date"
                min={hoy}
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  invalidarCopia();
                }}
              />
            ) : (
              <select
                aria-label="Salida de tu interés"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  invalidarCopia();
                }}
              >
                <option value="">Quiero consultar fechas</option>
                {fechas.map((f) => (
                  <option key={f} value={f}>
                    {fechaLarga(f)}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="consulta-campo">
            <span>
              <Users size={15} aria-hidden="true" />
              ¿Cuántas personas viajan?
            </span>
            <select
              value={viajeros}
              onChange={(e) => {
                setViajeros(e.target.value);
                invalidarCopia();
              }}
              aria-label="Cantidad de viajeros"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option value={String(i + 1)} key={i}>
                  {i + 1} {i === 0 ? "persona" : "personas"}
                </option>
              ))}
              <option value="más de 10">Más de 10 personas</option>
            </select>
          </label>
          <button className="consulta-boton" type="submit">
            {enlace ? (
              <MessageCircle size={18} aria-hidden="true" />
            ) : copiado ? (
              <Check size={18} aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
            {enlace
              ? agotado
                ? "Consultar lista de espera"
                : "Consultar por WhatsApp"
              : copiado
                ? "Consulta copiada"
                : "Copiar mi consulta"}
          </button>
          <p className="consulta-aclaracion">
            {enlace
              ? "Se abrirá WhatsApp con los datos de tu viaje. Tu consulta no confirma una reserva."
              : "Copiá los datos del viaje y compartilos con el equipo por tu canal preferido."}
          </p>
          {!enlace && (
            <Link href="/contacto" className="consulta-contacto">
              Ver canales de contacto{" "}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
          <span className="solo-lectores" role="status">
            {copiado ? "Consulta copiada al portapapeles" : ""}
          </span>
          {copiaManual && (
            <label className="consulta-manual">
              Copiá este mensaje:
              <textarea
                readOnly
                value={mensaje}
                rows={7}
                onFocus={(e) => e.target.select()}
              />
            </label>
          )}
        </form>
        <div className="consulta-confianza">
          <MessageCircle size={20} aria-hidden="true" />
          <p>
            <strong>Hablás con nuestro equipo</strong>
            <span>
              Confirmamos disponibilidad y resolvemos tus dudas antes de
              reservar.
            </span>
          </p>
        </div>
      </aside>
      <div className="detalle-barra-movil" data-print="ocultar">
        <div>
          <span>Desde</span>
          <strong>{precio.principal}</strong>
          <small>{paquete.basePrecio}</small>
        </div>
        <a href="#consulta">
          {agotado ? "Lista de espera" : "Consultar viaje"}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
