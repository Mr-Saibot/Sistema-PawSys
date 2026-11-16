import { FormularioAcceso } from '../componentes/FormularioAcceso';
import { MarcaAcceso } from '../componentes/MarcaAcceso';
import { useAcceso } from '../hooks/useAcceso';

export function PaginaAcceso() {
  const estadoAcceso = useAcceso();

  return (
    <main className="grid min-h-screen place-items-center bg-fondo px-5 py-10">
      <section className="w-full max-w-md rounded-tarjeta border border-borde
        bg-superficie p-7 shadow-sutil sm:p-9">
        <MarcaAcceso />
        <h1 className="text-2xl font-semibold tracking-tight text-texto">
          Ingresá a tu espacio
        </h1>
        <p className="mt-2 text-sm leading-6 text-texto-suave">
          Consultá la ficha clínica de tus pacientes.
        </p>
        <FormularioAcceso {...estadoAcceso} />
      </section>
    </main>
  );
}
