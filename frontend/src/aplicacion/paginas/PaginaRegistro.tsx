import { Link } from 'react-router-dom';
import { FormularioRegistroCliente } from '../componentes/FormularioRegistroCliente';
import { MarcaAcceso } from '../componentes/MarcaAcceso';
import { useRegistroCliente } from '../hooks/useRegistroCliente';

export function PaginaRegistro() {
  const estadoRegistro = useRegistroCliente();

  return (
    <main className="grid min-h-screen place-items-center bg-fondo px-5 py-10">
      <section className="w-full max-w-2xl rounded-tarjeta border border-borde
        bg-superficie p-7 shadow-sutil sm:p-9">
        <MarcaAcceso />
        <h1 className="text-2xl font-semibold tracking-tight text-texto">
          Creá tu cuenta
        </h1>
        <p className="mt-2 text-sm leading-6 text-texto-suave">
          Registrate para consultar y cuidar la información de tus mascotas.
        </p>
        <FormularioRegistroCliente {...estadoRegistro} />
        <div className="mt-6 text-center text-sm text-texto-suave">
          ¿Ya tenés una cuenta?{' '}
          <Link
            className="font-medium text-primario-oscuro hover:underline"
            to="/login"
          >
            Iniciá sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
