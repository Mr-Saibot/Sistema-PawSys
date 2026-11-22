import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';
import { MensajeError } from './MensajeError';
import type { EstadoRegistroCliente } from '../tipos/acceso';

export function FormularioRegistroCliente({
  nombre,
  apellido,
  cedulaIdentidad,
  correo,
  clave,
  telefono,
  direccion,
  cargando,
  error,
  establecerNombre,
  establecerApellido,
  establecerCedulaIdentidad,
  establecerCorreo,
  establecerClave,
  establecerTelefono,
  establecerDireccion,
  enviarFormulario,
}: EstadoRegistroCliente) {
  return (
    <form className="mt-7 grid gap-5" onSubmit={enviarFormulario}>
      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Nombre"
          name="nombre"
          autoComplete="given-name"
          value={nombre}
          onChange={(evento) => establecerNombre(evento.target.value)}
          required
        />
        <CampoTexto
          etiqueta="Apellido"
          name="apellido"
          autoComplete="family-name"
          value={apellido}
          onChange={(evento) => establecerApellido(evento.target.value)}
          required
        />
      </div>
      <CampoTexto
        etiqueta="Cédula de identidad"
        name="cedulaIdentidad"
        autoComplete="off"
        value={cedulaIdentidad}
        onChange={(evento) => establecerCedulaIdentidad(evento.target.value)}
        required
      />
      <CampoTexto
        etiqueta="Correo electrónico"
        name="correo"
        type="email"
        autoComplete="email"
        value={correo}
        onChange={(evento) => establecerCorreo(evento.target.value)}
        required
      />
      <CampoTexto
        etiqueta="Contraseña"
        name="clave"
        type="password"
        autoComplete="new-password"
        minLength={6}
        value={clave}
        onChange={(evento) => establecerClave(evento.target.value)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Teléfono (opcional)"
          name="telefono"
          type="tel"
          autoComplete="tel"
          value={telefono}
          onChange={(evento) => establecerTelefono(evento.target.value)}
        />
        <CampoTexto
          etiqueta="Dirección (opcional)"
          name="direccion"
          autoComplete="street-address"
          value={direccion}
          onChange={(evento) => establecerDireccion(evento.target.value)}
        />
      </div>
      <MensajeError error={error} />
      <Boton className="w-full" type="submit" disabled={cargando}>
        {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
      </Boton>
    </form>
  );
}
