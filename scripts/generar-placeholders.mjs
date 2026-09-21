/* Genera las fotos de muestra (SVG) de los paquetes de ejemplo.
   Son livianas, siempre cargan y usan la paleta de la marca.
   Cuando el equipo suba fotos reales desde el panel, estas desaparecen. */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SALIDA = join(process.cwd(), "public", "muestra");
mkdirSync(SALIDA, { recursive: true });

const PALETAS = {
  playa: ["#0e7490", "#22b8cf", "#f2e6d4", "#e56b4e"],
  caribe: ["#0c6b7a", "#2dd4bf", "#fdf6e8", "#f5a28c"],
  ciudad: ["#1d2825", "#52635e", "#e7d3b6", "#e56b4e"],
  montania: ["#0f3d33", "#46937c", "#f2e6d4", "#d8bc94"],
  selva: ["#0a2b24", "#2b7563", "#a7d3c4", "#e7d3b6"],
  nieve: ["#2c3835", "#9caaa6", "#f6f7f7", "#c5cecb"],
  templo: ["#43372a", "#a8865a", "#faf3e8", "#e56b4e"],
  rio: ["#164a3f", "#72b6a1", "#f2e6d4", "#c5a273"],
};

/* Silueta de horizonte según el tema. Devuelve un path SVG. */
function horizonte(tema, semilla) {
  const r = mutador(semilla);
  const ancho = 1600;
  const base = 900;
  switch (tema) {
    case "montania":
    case "nieve": {
      let d = `M0,${base} L0,620 `;
      let x = 0;
      while (x < ancho) {
        const paso = 180 + r() * 220;
        const alto = 300 + r() * 260;
        d += `L${x + paso / 2},${base - alto} L${x + paso},${base - 120 - r() * 120} `;
        x += paso;
      }
      return d + `L${ancho},${base} Z`;
    }
    case "ciudad": {
      let d = `M0,${base} L0,700 `;
      let x = 0;
      while (x < ancho) {
        const ancho_e = 60 + r() * 110;
        const alto = 160 + r() * 420;
        d += `L${x},${base - alto} L${x + ancho_e},${base - alto} `;
        x += ancho_e;
      }
      return d + `L${ancho},${base} Z`;
    }
    case "templo": {
      const cx = 800;
      return (
        `M0,${base} L0,760 L560,760 L560,600 L${cx - 120},600 ` +
        `L${cx},380 L${cx + 120},600 L1040,600 L1040,760 L${ancho},760 L${ancho},${base} Z`
      );
    }
    case "selva":
    case "rio": {
      let d = `M0,${base} L0,660 `;
      let x = 0;
      while (x < ancho) {
        const paso = 90 + r() * 130;
        d += `Q${x + paso / 2},${520 + r() * 120} ${x + paso},${640 + r() * 80} `;
        x += paso;
      }
      return d + `L${ancho},${base} Z`;
    }
    default: {
      /* playa / caribe: línea de costa suave */
      return `M0,${base} L0,700 Q400,${660 + r() * 40} 800,700 T1600,690 L${ancho},${base} Z`;
    }
  }
}

/* Generador pseudoaleatorio determinístico: la misma semilla da la misma foto. */
function mutador(semilla) {
  let s = 0;
  for (const c of semilla) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function svg(tema, semilla) {
  const [oscuro, medio, claro, acento] = PALETAS[tema] ?? PALETAS.playa;
  const r = mutador(semilla + "sol");
  const solX = 300 + r() * 1000;
  const solY = 180 + r() * 180;
  const id = semilla.replace(/[^a-z0-9]/gi, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
  <defs>
    <linearGradient id="cielo${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${claro}"/>
      <stop offset="55%" stop-color="${medio}"/>
      <stop offset="100%" stop-color="${oscuro}"/>
    </linearGradient>
    <linearGradient id="tierra${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${oscuro}"/>
      <stop offset="100%" stop-color="${oscuro}" stop-opacity="0.82"/>
    </linearGradient>
    <radialGradient id="sol${id}">
      <stop offset="0%" stop-color="${acento}" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="${acento}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${acento}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cielo${id})"/>
  <circle cx="${solX.toFixed(0)}" cy="${solY.toFixed(0)}" r="260" fill="url(#sol${id})"/>
  <circle cx="${solX.toFixed(0)}" cy="${solY.toFixed(0)}" r="58" fill="${acento}" opacity="0.9"/>
  <path d="${horizonte(tema, semilla)}" fill="url(#tierra${id})"/>
  <rect y="820" width="1600" height="80" fill="${oscuro}" opacity="0.35"/>
</svg>`;
}

const FOTOS = JSON.parse(process.argv[2] ?? "[]");
for (const { archivo, tema } of FOTOS) {
  writeFileSync(join(SALIDA, `${archivo}.svg`), svg(tema, archivo), "utf8");
}
console.log(`${FOTOS.length} fotos de muestra generadas en public/muestra/`);
