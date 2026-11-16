interface EstadoPin {
  configurado: boolean;
}

interface DatosPin {
  pin?: string;
  pinNuevo?: string;
  pinActual?: string;
  password?: string;
}

const LONGITUD_PIN = 6;
const FORMATO_PIN = /^\d{6}$/;

export async function solicitarPinAdmin(
  urlApi: string,
  token: string,
): Promise<string> {
  const estado = await obtenerEstadoPin(urlApi, token);
  const datos = await abrirDialogoPin(estado.configurado);

  if (!estado.configurado) {
    await guardarPin(urlApi, token, datos);
    return datos.pinNuevo || '';
  }

  return datos.pin || '';
}

async function obtenerEstadoPin(
  urlApi: string,
  token: string,
): Promise<EstadoPin> {
  const respuesta = await fetch(`${urlApi}/auth/admin/pin/estado`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const resultado: unknown = await leerRespuesta(respuesta);
  const configurado = resultado
    && typeof resultado === 'object'
    && Reflect.get(resultado, 'configurado');
  return { configurado: Boolean(configurado) };
}

async function guardarPin(
  urlApi: string,
  token: string,
  datos: DatosPin,
): Promise<void> {
  await fetch(`${urlApi}/auth/admin/pin`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: datos.password,
      pinNuevo: datos.pinNuevo,
      pinActual: datos.pinActual,
    }),
  }).then(leerRespuesta);
}

function abrirDialogoPin(configurado: boolean): Promise<DatosPin> {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'record-dialog';
  dialogo.innerHTML = crearContenidoDialogo(configurado);
  document.body.append(dialogo);

  return new Promise((resolver, rechazar) => {
    configurarDialogo(dialogo, configurado, resolver);
    dialogo.addEventListener('close', () => {
      dialogo.remove();
      rechazar(new Error('Acción cancelada.'));
    }, { once: true });
    dialogo.showModal();
  });
}

function crearContenidoDialogo(configurado: boolean): string {
  const contenidoConfiguracion = configurado
    ? ''
    : crearCamposConfiguracion();
  const etiquetaPin = configurado
    ? 'PIN de administrador'
    : 'Nuevo PIN de administrador';

  return `
    <form class="form-grid" data-formulario-pin novalidate>
      <div class="section-heading">
        <h2>
          ${configurado ? 'Confirmar acción' : 'Configurar PIN de administrador'}
        </h2>
      </div>
      <p class="api-hint">
        ${configurado
          ? 'Ingresá tu PIN para autorizar esta modificación.'
          : 'Elegí un PIN de exactamente 6 dígitos numéricos (0 al 9).'}
      </p>
      ${contenidoConfiguracion}
      <label class="field">
        ${etiquetaPin}
        <input
          name="${configurado ? 'pin' : 'pinNuevo'}"
          type="password"
          inputmode="numeric"
          pattern="[0-9]{${LONGITUD_PIN}}"
          minlength="${LONGITUD_PIN}"
          maxlength="${LONGITUD_PIN}"
          aria-describedby="ayuda-pin"
          autocomplete="off"
          required
        />
      </label>
      <p class="api-hint" id="ayuda-pin">
        Usá solo números, sin letras, espacios ni símbolos.
        Necesitarás este PIN para autorizar cada modificación administrativa.
        Tras 5 intentos incorrectos, el acceso se bloquea por 15 minutos.
      </p>
      ${configurado ? '' : crearCampoConfirmacionPin()}
      <p class="login-error" role="alert"></p>
      <div class="form-actions">
        <button class="primary-button" type="submit">
          ${configurado ? 'Autorizar' : 'Guardar PIN y continuar'}
        </button>
        <button class="secondary-button" type="button" data-cancelar-pin>
          Cancelar
        </button>
      </div>
    </form>
  `;
}

function crearCamposConfiguracion(): string {
  return `
    <label class="field">
      Contraseña actual de tu cuenta
      <input
        name="password"
        type="password"
        autocomplete="current-password"
        required
      />
    </label>
    <p class="api-hint">
      La contraseña confirma tu identidad; no es el PIN.
    </p>
  `;
}

function crearCampoConfirmacionPin(): string {
  return `
    <label class="field">
      Repetí el nuevo PIN
      <input
        name="pinConfirmacion"
        type="password"
        inputmode="numeric"
        pattern="[0-9]{${LONGITUD_PIN}}"
        minlength="${LONGITUD_PIN}"
        maxlength="${LONGITUD_PIN}"
        autocomplete="off"
        required
      />
    </label>
  `;
}

function configurarDialogo(
  dialogo: HTMLDialogElement,
  configurado: boolean,
  resolver: (datos: DatosPin) => void,
): void {
  const formulario = dialogo.querySelector<HTMLFormElement>(
    '[data-formulario-pin]',
  );
  const error = dialogo.querySelector<HTMLElement>('.login-error');
  const botonCancelar = dialogo.querySelector<HTMLButtonElement>(
    '[data-cancelar-pin]',
  );
  if (!formulario || !error || !botonCancelar) {
    throw new Error('No se pudo preparar la solicitud de PIN.');
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    resolverFormulario(formulario, error, configurado, resolver);
    if (!error.textContent) {
      dialogo.close();
    }
  });
  botonCancelar.addEventListener('click', () => dialogo.close());
}

function resolverFormulario(
  formulario: HTMLFormElement,
  error: HTMLElement,
  configurado: boolean,
  resolver: (datos: DatosPin) => void,
): void {
  const datos = leerDatosPin(formulario);
  const pin = configurado ? datos.pin : datos.pinNuevo;
  if (!pin || !FORMATO_PIN.test(pin)) {
    error.textContent =
      'El PIN debe tener exactamente 6 dígitos numéricos, sin espacios.';
    return;
  }
  if (!configurado && !datos.password?.trim()) {
    error.textContent = 'Ingresá la contraseña actual de tu cuenta.';
    return;
  }
  if (!configurado && datos.pinNuevo !== datos.pinActual) {
    error.textContent = 'Los PIN no coinciden. Revisá los 6 dígitos.';
    return;
  }

  error.textContent = '';
  resolver(datos);
}

function leerDatosPin(formulario: HTMLFormElement): DatosPin {
  const valores = new FormData(formulario);
  return {
    pin: String(valores.get('pin') || ''),
    pinNuevo: String(valores.get('pinNuevo') || ''),
    pinActual: String(valores.get('pinConfirmacion') || ''),
    password: String(valores.get('password') || ''),
  };
}

async function leerRespuesta(respuesta: Response): Promise<unknown> {
  const resultado: unknown = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const mensaje = resultado && typeof resultado === 'object'
      ? Reflect.get(resultado, 'message')
      : undefined;
    const texto = Array.isArray(mensaje) ? mensaje.join(', ') : mensaje;
    throw new Error(
      typeof texto === 'string' ? texto : 'No se pudo validar el PIN.',
    );
  }
  return resultado;
}
