import { FormularioAcceso } from '../componentes/FormularioAcceso';
import { MarcaAcceso } from '../componentes/MarcaAcceso';
import { useAcceso } from '../hooks/useAcceso';
import { Link, useLocation } from 'react-router-dom';

export function PaginaAcceso() {
  const estadoAcceso = useAcceso();
  const ubicacion = useLocation();
  const aviso = obtenerAviso(ubicacion.state);

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
        {aviso && <p className="mt-4 text-sm text-exito" role="status">{aviso}</p>}
        <FormularioAcceso {...estadoAcceso} />
        <p className="mt-6 text-center text-sm text-texto-suave">
          ¿Sos nuevo?{' '}
          <Link
            className="font-medium text-primario-oscuro hover:underline"
            to="/registro"
          >
            Creá tu cuenta
          </Link>
        </p>
      </section>
    </main>
  );
}

function obtenerAviso(estado: unknown): string {
  if (!estado || typeof estado !== 'object') {
    return '';
  }

  const aviso = Reflect.get(estado, 'aviso');
  return typeof aviso === 'string' ? aviso : '';
}
