import { Boton } from './Boton';
import { CamposAcceso } from './CamposAcceso';
import type { EstadoAcceso } from '../tipos/acceso';
import { MensajeError } from './MensajeError';

export function FormularioAcceso({
  correo,
  clave,
  cargando,
  error,
  establecerCorreo,
  establecerClave,
  enviarFormulario,
}: EstadoAcceso) {
  return (
    <form className="mt-7 grid gap-5" onSubmit={enviarFormulario}>
      <CamposAcceso
        correo={correo}
        clave={clave}
        establecerCorreo={establecerCorreo}
        establecerClave={establecerClave}
      />
      <MensajeError error={error} />
      <Boton className="w-full" type="submit" disabled={cargando}>
        {cargando ? 'Ingresando…' : 'Iniciar sesión'}
      </Boton>
    </form>
  );
}
