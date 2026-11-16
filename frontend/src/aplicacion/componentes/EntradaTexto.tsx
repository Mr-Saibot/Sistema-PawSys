import type { InputHTMLAttributes } from 'react';
import { TextoErrorCampo } from './TextoErrorCampo';

interface PropiedadesEntradaTexto
  extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function EntradaTexto({
  error,
  id,
  className = '',
  ...propiedades
}: PropiedadesEntradaTexto) {
  const identificador = id || propiedades.name;

  return (
    <>
      <input
        id={identificador}
        className={`min-h-11 rounded-control border border-borde
          bg-superficie px-3 text-texto outline-none placeholder:text-texto-suave
          focus:border-primario focus:ring-2 focus:ring-primario/15
          ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${identificador}-error` : undefined}
        {...propiedades}
      />
      <TextoErrorCampo identificador={identificador} error={error} />
    </>
  );
}
