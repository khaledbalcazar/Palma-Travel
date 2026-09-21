import { describe, expect, it, vi } from "vitest";
import { normalizarUrlSitio, URL_POR_DEFECTO } from "@/lib/url-sitio";

/* Esta función existe por un build que se cayó en Vercel: la variable
   llegó como texto vacío y `new URL("")` tiró abajo toda la compilación.
   Estos tests están para que no vuelva a pasar. */

describe("normalizarUrlSitio", () => {
  it("acepta una dirección bien escrita", () => {
    expect(normalizarUrlSitio("https://palmatravel.com.py")).toBe(
      "https://palmatravel.com.py",
    );
  });

  describe("no se rompe con lo que puede llegar de Vercel", () => {
    const casosQueCaenAlPorDefecto = [
      ["texto vacío", ""],
      ["solo espacios", "   "],
      ["no definida", undefined],
      ["nula", null],
      ["basura", "no soy una url"],
      ["solo el protocolo", "https://"],
      ["un protocolo raro", "javascript:alert(1)"],
      ["un dominio sin punto", "https://localhost-mal"],
    ] as const;

    for (const [nombre, entrada] of casosQueCaenAlPorDefecto) {
      it(nombre, () => {
        const avisar = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(normalizarUrlSitio(entrada)).toBe(URL_POR_DEFECTO);
        avisar.mockRestore();
      });
    }
  });

  describe("arregla los errores de tipeo más comunes", () => {
    it("le agrega https:// si falta", () => {
      expect(normalizarUrlSitio("palma-travel.vercel.app")).toBe(
        "https://palma-travel.vercel.app",
      );
    });

    it("saca la barra del final", () => {
      expect(normalizarUrlSitio("https://palmatravel.com.py/")).toBe(
        "https://palmatravel.com.py",
      );
    });

    it("saca los espacios de los costados", () => {
      expect(normalizarUrlSitio("  https://palmatravel.com.py  ")).toBe(
        "https://palmatravel.com.py",
      );
    });

    it("se queda solo con el origen", () => {
      expect(normalizarUrlSitio("https://palmatravel.com.py/paquetes?x=1")).toBe(
        "https://palmatravel.com.py",
      );
    });
  });

  it("deja pasar localhost, para poder probar", () => {
    expect(normalizarUrlSitio("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
  });

  it("lo que devuelve siempre sirve para construir una URL", () => {
    const avisar = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const entrada of ["", "  ", "basura", "https://", undefined]) {
      expect(() => new URL(normalizarUrlSitio(entrada))).not.toThrow();
    }
    avisar.mockRestore();
  });
});
