"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Campos de formulario del panel. Todos muestran el error abajo, en
   español, y quedan conectados por aria para los lectores de pantalla. */

const baseCampo =
  "w-full rounded-lg border border-palma-900/15 bg-white px-3.5 py-2.5 text-[0.95rem] text-tinta-800 placeholder:text-tinta-300 transition-colors focus:border-palma-600 disabled:bg-arena-100 disabled:text-tinta-400";

function Envoltura({
  id,
  etiqueta,
  ayuda,
  error,
  requerido,
  children,
  className,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  requerido?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-tinta-700">
        {etiqueta}
        {requerido && (
          <span className="text-coral-600" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>
      {ayuda && <p className="mt-1 text-xs text-tinta-500">{ayuda}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-coral-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function CampoTexto({
  id,
  etiqueta,
  ayuda,
  error,
  className,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
}) {
  return (
    <Envoltura
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      requerido={props.required}
      className={className}
    >
      <input
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseCampo, error && "border-coral-500")}
        {...props}
      />
    </Envoltura>
  );
}

export function CampoArea({
  id,
  etiqueta,
  ayuda,
  error,
  className,
  ...props
}: ComponentProps<"textarea"> & {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
}) {
  return (
    <Envoltura
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      requerido={props.required}
      className={className}
    >
      <textarea
        id={id}
        name={props.name ?? id}
        rows={props.rows ?? 4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseCampo, "resize-y", error && "border-coral-500")}
        {...props}
      />
    </Envoltura>
  );
}

export function CampoSelect({
  id,
  etiqueta,
  ayuda,
  error,
  opciones,
  className,
  ...props
}: ComponentProps<"select"> & {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opciones: { valor: string; etiqueta: string }[];
}) {
  return (
    <Envoltura
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      requerido={props.required}
      className={className}
    >
      <select
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseCampo, error && "border-coral-500")}
        {...props}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </Envoltura>
  );
}

export function CampoInterruptor({
  id,
  etiqueta,
  ayuda,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-palma-700" : "bg-tinta-200",
        )}
      >
        <span
          className={cn(
            "size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer text-sm text-tinta-700">
        <span className="font-medium">{etiqueta}</span>
        {ayuda && <span className="block text-xs text-tinta-500">{ayuda}</span>}
      </label>
    </div>
  );
}

/** Selección múltiple con tarjetitas, para tipo de viaje / ideal para. */
export function CampoEtiquetas({
  etiqueta,
  ayuda,
  error,
  opciones,
  seleccionadas,
  alCambiar,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opciones: { valor: string; etiqueta: string }[];
  seleccionadas: string[];
  alCambiar: (valores: string[]) => void;
}) {
  const alternar = (valor: string) =>
    alCambiar(
      seleccionadas.includes(valor)
        ? seleccionadas.filter((v) => v !== valor)
        : [...seleccionadas, valor],
    );

  return (
    <fieldset>
      <legend className="text-sm font-medium text-tinta-700">{etiqueta}</legend>
      {ayuda && <p className="mt-1 text-xs text-tinta-500">{ayuda}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activa = seleccionadas.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={activa}
              onClick={() => alternar(o.valor)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                activa
                  ? "bg-palma-800 text-arena-50"
                  : "bg-arena-100 text-tinta-600 ring-1 ring-inset ring-palma-900/12 hover:bg-arena-200",
              )}
            >
              {o.etiqueta}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-coral-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
