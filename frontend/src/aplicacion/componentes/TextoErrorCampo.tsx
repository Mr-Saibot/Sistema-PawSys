interface PropiedadesTextoError {
  identificador: string | undefined;
  error?: string;
}

export function TextoErrorCampo({
  identificador,
  error,
}: PropiedadesTextoError) {
  if (!error) {
    return null;
  }

  return (
    <span
      id={`${identificador}-error`}
      className="text-xs font-normal text-error"
    >
      {error}
    </span>
  );
}
