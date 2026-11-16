import { CampoTexto } from './CampoTexto';

interface PropiedadesCamposAcceso {
  correo: string;
  clave: string;
  establecerCorreo: (correo: string) => void;
  establecerClave: (clave: string) => void;
}

export function CamposAcceso({
  correo,
  clave,
  establecerCorreo,
  establecerClave,
}: PropiedadesCamposAcceso) {
  return (
    <>
      <CampoTexto
        etiqueta="Correo electrónico"
        name="correo"
        type="email"
        autoComplete="username"
        value={correo}
        onChange={(evento) => establecerCorreo(evento.target.value)}
        required
      />
      <CampoTexto
        etiqueta="Contraseña"
        name="clave"
        type="password"
        autoComplete="current-password"
        value={clave}
        onChange={(evento) => establecerClave(evento.target.value)}
        required
      />
    </>
  );
}
