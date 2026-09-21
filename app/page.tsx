import { SITIO } from "@/config/site";

/* Home provisoria: la versión completa llega en la fase de la home. */
export default function Home() {
  return (
    <div className="contenedor py-24">
      <h1 className="font-display text-5xl">{SITIO.eslogan}</h1>
      <p className="mt-4 max-w-prose text-lg text-tinta-600">
        {SITIO.descripcion}
      </p>
    </div>
  );
}
