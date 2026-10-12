import { describe, expect, it } from "vitest";
import { linkWhatsApp, mensajeConsultaPaquete } from "@/lib/whatsapp";

const paquete = {
  titulo: "Río: playa y ciudad",
  slug: "rio",
  destino: "Río de Janeiro",
  estado: "activo",
};

describe("Consulta personalizada de un paquete", () => {
  it("incluye fecha, viajeros y un enlace al viaje sin confirmar una reserva", () => {
    const mensaje = mensajeConsultaPaquete(paquete, {
      fecha: "2027-01-15",
      viajeros: "3",
    });
    expect(mensaje).toContain("15 de enero de 2027");
    expect(mensaje).toContain("Cantidad de viajeros: 3");
    expect(mensaje).toContain("/paquetes/rio");
    expect(mensaje).toContain("confirmar las opciones y el precio final");
    expect(mensaje).not.toContain("reserva confirmada");
  });
  it("permite una consulta flexible y distingue la lista de espera", () => {
    const mensaje = mensajeConsultaPaquete(
      { ...paquete, estado: "agotado" },
      { fecha: "", viajeros: "más de 10" },
    );
    expect(mensaje).toContain("lista de espera");
    expect(mensaje).toContain("Fecha preferida: a coordinar");
    expect(mensaje).toContain("más de 10");
  });
  it("no crea un contacto inexistente y conserva el mensaje al codificar el enlace", () => {
    const mensaje = mensajeConsultaPaquete(paquete, {
      fecha: "",
      viajeros: "2",
    });
    expect(linkWhatsApp({ whatsapp: "" }, mensaje)).toBeNull();
    const enlace = linkWhatsApp({ whatsapp: "595 000 000 000" }, mensaje)!;
    expect(new URL(enlace).searchParams.get("text")).toBe(mensaje);
  });
});
