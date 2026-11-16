export function ContenidoPanelConsulta() {
  return (
    <>
      <p className="text-sm leading-6 text-texto-suave">
        El formulario clínico forma parte de la siguiente etapa de
        implementación. Los registros existentes siguen disponibles en la
        interfaz actual.
      </p>
      <a
        className="mt-5 inline-flex min-h-10 items-center rounded-control
          bg-primario px-4 text-sm font-medium text-white
          hover:bg-primario-oscuro"
        href="/index.html"
      >
        Ir al registro clínico actual
      </a>
    </>
  );
}
