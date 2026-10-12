"use client";

import { useEffect, useState } from "react";

export function NavegacionViaje({
  secciones,
}: {
  secciones: { id: string; titulo: string }[];
}) {
  const [activa, setActiva] = useState(secciones[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.find((entrada) => entrada.isIntersecting);
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-160px 0px -55% 0px", threshold: 0 },
    );
    secciones.forEach(({ id }) => {
      const elemento = document.getElementById(id);
      if (elemento) observer.observe(elemento);
    });
    const alVolverArriba = () => {
      const primera = document.getElementById(secciones[0]?.id ?? "");
      if (primera && primera.getBoundingClientRect().top > window.innerHeight * 0.45) {
        setActiva(primera.id);
      }
    };
    window.addEventListener("scroll", alVolverArriba, { passive: true });
    alVolverArriba();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", alVolverArriba);
    };
  }, [secciones]);
  return (
    <nav
      className="detalle-navegacion"
      aria-label="En este viaje"
      data-print="ocultar"
    >
      {secciones.map(({ id, titulo }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={activa === id ? "location" : undefined}
          onClick={() => setActiva(id)}
        >
          {titulo}
        </a>
      ))}
    </nav>
  );
}
