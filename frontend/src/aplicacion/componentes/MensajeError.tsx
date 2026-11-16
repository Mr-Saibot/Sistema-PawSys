interface PropiedadesMensajeError {
  error: string;
}

export function MensajeError({ error }: PropiedadesMensajeError) {
  if (!error) {
    return null;
  }

  return (
    <p className="text-sm text-error" role="alert">
      {error}
    </p>
  );
}
