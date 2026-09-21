import { cn } from "@/lib/utils";

/* Logo provisorio de Palma Travel.
   Para reemplazarlo por el logo real: cambiá el contenido del <svg>.
   Usa `currentColor`, así toma el color del texto donde esté puesto. */
export function Logo({
  className,
  soloSimbolo = false,
}: {
  className?: string;
  soloSimbolo?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="h-9 w-9 shrink-0"
        fill="none"
      >
        <circle cx="20" cy="20" r="19" className="fill-current opacity-10" />
        {/* Tronco */}
        <path
          d="M20 33c0-6.5.6-11.2 1.9-14.7"
          className="stroke-current"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Hojas de palmera */}
        <path
          d="M22 17c3.2-3.4 7-4.4 10.4-2.8M22 17c4.3-.9 7.8.6 9.6 4M22 17c-3.9-3-8-3.3-11 .3M22 17c-4.2-.2-7.3 2-8.3 5.7M22 17c.3-4.3-1.3-7.6-4.6-9.3"
          className="stroke-current"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="21.8" cy="16.6" r="2.1" className="fill-current" />
      </svg>
      {!soloSimbolo && (
        <span className="font-display text-xl leading-none font-semibold tracking-tight">
          Palma<span className="font-normal italic"> Travel</span>
        </span>
      )}
    </span>
  );
}
