"use client";

/* ===================================================================
   Achica y comprime las fotos ANTES de subirlas.
   Las cámaras de celular sacan fotos de 5 o 6 MB; así suben livianas,
   en WebP y de 2000 px como máximo, sin que se note la diferencia.
   =================================================================== */

export const ANCHO_MAXIMO = 2000;
export const CALIDAD = 0.82;

export type FotoComprimida = {
  blob: Blob;
  extension: string;
  ancho: number;
  alto: number;
  pesoOriginal: number;
  pesoFinal: number;
};

export async function comprimirFoto(archivo: File): Promise<FotoComprimida> {
  if (!archivo.type.startsWith("image/")) {
    throw new Error(`"${archivo.name}" no es una imagen.`);
  }

  /* Los SVG no se tocan: ya son livianos y al pasarlos por canvas se
     arruinan. */
  if (archivo.type === "image/svg+xml") {
    return {
      blob: archivo,
      extension: "svg",
      ancho: 0,
      alto: 0,
      pesoOriginal: archivo.size,
      pesoFinal: archivo.size,
    };
  }

  const bitmap = await crearBitmap(archivo);
  const escala = Math.min(1, ANCHO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const contexto = lienzo.getContext("2d");
  if (!contexto) throw new Error("El navegador no pudo procesar la imagen.");
  contexto.imageSmoothingQuality = "high";
  contexto.drawImage(bitmap, 0, 0, ancho, alto);
  if ("close" in bitmap) bitmap.close();

  const blob = await new Promise<Blob | null>((resolver) =>
    lienzo.toBlob(resolver, "image/webp", CALIDAD),
  );

  if (!blob) throw new Error("No se pudo comprimir la imagen.");

  return {
    blob,
    extension: "webp",
    ancho,
    alto,
    pesoOriginal: archivo.size,
    pesoFinal: blob.size,
  };
}

async function crearBitmap(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(archivo);
    } catch {
      /* algunos formatos no los soporta: se cae al método clásico */
    }
  }
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolver(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error(`No se pudo leer "${archivo.name}".`));
    };
    img.src = url;
  });
}

/** "2.4 MB" */
export function pesoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Nombre de archivo único y sin caracteres raros. */
export function nombreDeArchivo(slug: string, extension: string): string {
  const limpio = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "foto";
  const marca = Date.now().toString(36);
  const azar = Math.random().toString(36).slice(2, 8);
  return `${limpio}/${marca}-${azar}.${extension}`;
}
