import type { InputHTMLAttributes } from 'react';
import { EntradaTexto } from './EntradaTexto';

interface PropiedadesCampoTexto extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
}

export function CampoTexto({
  etiqueta,
  error,
  id,
  className = '',
  ...propiedades
}: PropiedadesCampoTexto) {
  const identificador = id || propiedades.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-texto">
      {etiqueta}
      <EntradaTexto
        id={identificador}
        error={error}
        className={className}
        {...propiedades}
      />
    </label>
  );
}
