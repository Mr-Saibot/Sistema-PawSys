import { API_PREDETERMINADA } from '../constantes.js';
import { crearDatosVacios } from '../datos/datos-iniciales.js';
import { paginaDisponibleParaRol, renderizarMarcoApp } from '../componentes/marco-app.js';
import { renderizarDetalleRegistro } from '../componentes/detalle-registro.js';
import { renderizarContenidoPanel } from '../vistas/contenido-panel.js';
import { renderizarInicioSesion } from '../vistas/inicio-sesion.js';
import { obtenerUrlApiGuardada, cargarDatosPanel, iniciarSesion, guardarUrlApi, registrarCliente, enviarApi, obtenerConfiguracionPagos, probarConexionApi } from '../servicios/api.js';
import { limpiarSesion, leerSesion, guardarSesion } from '../servicios/sesion.js';
import { obtenerMensajeError } from '../utilidades/formato-html.js';
import { renderizarFormularioRegistro } from '../vistas/registro-cliente.js';
import type { ConfiguracionPagos, DatosPanel, ReporteCaja, Sesion } from '../tipos.js';

export class ControladorApp {
  private readonly raiz: HTMLElement;
  private readonly aviso: HTMLElement;
  private sesion: Sesion | null = null;
  private datos: DatosPanel = crearDatosVacios();
  private pagina = 'Inicio';
  private temporizadorAviso = 0;
  private configuracionPagos: ConfiguracionPagos | null = null;
  private errorConfiguracionPagos = '';
  private intentoCargarConfiguracionPagos = false;
  private reporteCaja: ReporteCaja | null = null;

  constructor() {
    const raiz = document.querySelector<HTMLElement>('#app');
    const aviso = document.querySelector<HTMLElement>('#toast');
    if (!raiz || !aviso) throw new Error('No se encontraron los contenedores de PawSys.');
    this.raiz = raiz;
    this.aviso = aviso;
  }

  async iniciar(): Promise<void> {
    const sesionGuardada = leerSesion();
    if (sesionGuardada?.token) {
      this.sesion = sesionGuardada;
      await this.actualizarDatos();
      this.renderizarPanel();
      return;
    }
    this.renderizarInicioSesion();
  }

  private renderizarInicioSesion(error = '', correoInicial = ''): void {
    this.raiz.innerHTML = renderizarInicioSesion(error, obtenerUrlApiGuardada());
    const formulario = this.raiz.querySelector<HTMLFormElement>('#formulario-inicio');
    formulario?.addEventListener('submit', (evento) => void this.enviarInicioSesion(evento));
    const campoCorreo = this.raiz.querySelector<HTMLInputElement>('#correo');
    if (campoCorreo && correoInicial) campoCorreo.value = correoInicial;
    formulario?.insertAdjacentHTML('afterend', '<p class="login-bottom">¿Eres nuevo cliente? <button class="text-button" type="button" data-accion="abrir-registro">Registrarse</button></p>');
    this.raiz.querySelector('[data-accion="abrir-registro"]')?.addEventListener('click', () => this.renderizarRegistroCliente());
    this.raiz.querySelector('[data-accion="save-api"]')?.addEventListener('click', () => this.gestionarGuardadoUrlApi());
    this.raiz.querySelector('[data-accion="test-api"]')?.addEventListener('click', () => void this.gestionarPruebaConexionApi());
  }

  private renderizarRegistroCliente(): void {
    this.raiz.innerHTML = renderizarFormularioRegistro();
    this.raiz.querySelector<HTMLFormElement>('#formulario-registro')?.addEventListener('submit', (evento) => void this.enviarRegistroCliente(evento));
    this.raiz.querySelector('[data-accion="volver-acceso"]')?.addEventListener('click', () => this.renderizarInicioSesion());
  }

  private async enviarRegistroCliente(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();
    const formulario = this.raiz.querySelector<HTMLFormElement>('#formulario-registro');
    const error = this.raiz.querySelector<HTMLElement>('.login-error');
    const boton = formulario?.querySelector<HTMLButtonElement>('.login-submit');
    if (!formulario || !error || !boton) return;

    const campo = (id: string) => formulario.querySelector<HTMLInputElement>(`#${id}`)?.value.trim() || '';
    const clave = formulario.querySelector<HTMLInputElement>('#clave-registro')?.value || '';
    const repetirClave = formulario.querySelector<HTMLInputElement>('#repetir-clave')?.value || '';
    if (clave !== repetirClave) {
      error.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    boton.disabled = true;
    boton.textContent = 'Creando cuenta…';
    error.textContent = '';
    try {
      const correo = campo('correo-registro');
      await registrarCliente({
        correo,
        clave,
        cedulaIdentidad: campo('cedula'),
        nombre: campo('nombre'),
        apellido: campo('apellido'),
        telefono: campo('telefono'),
        direccion: campo('direccion'),
      });
      this.renderizarInicioSesion('', correo);
      this.mostrarAviso('Cuenta creada. Ya puedes iniciar sesión.');
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No se pudo crear la cuenta.');
      boton.disabled = false;
      boton.textContent = 'Crear cuenta';
    }
  }

  private async enviarInicioSesion(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();
    const correo = this.raiz.querySelector<HTMLInputElement>('#correo');
    const clave = this.raiz.querySelector<HTMLInputElement>('#clave');
    const boton = this.raiz.querySelector<HTMLButtonElement>('.login-submit');
    const error = this.raiz.querySelector<HTMLElement>('.login-error');
    if (!correo || !clave || !boton || !error) return;

    boton.disabled = true;
    boton.textContent = 'Conectando…';
    error.textContent = '';
    try {
      this.sesion = await iniciarSesion(correo.value, clave.value);
      guardarSesion(this.sesion);
      this.pagina = 'Inicio';
      await this.actualizarDatos();
      this.renderizarPanel();
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No fue posible conectar con el backend.');
      boton.disabled = false;
      boton.textContent = 'Iniciar sesión';
    }
  }

  private gestionarGuardadoUrlApi(): void {
    const entrada = this.raiz.querySelector<HTMLInputElement>('#api-url');
    if (!entrada) return;
    try {
      guardarUrlApi(entrada.value);
      this.mostrarAviso('Dirección del backend guardada.');
    } catch (causa) {
      this.mostrarAviso(obtenerMensajeError(causa, 'No se pudo guardar la dirección.'));
    }
  }

  private async gestionarPruebaConexionApi(): Promise<void> {
    const entrada = this.raiz.querySelector<HTMLInputElement>('#api-url');
    const estado = this.raiz.querySelector<HTMLElement>('#api-status');
    if (!entrada || !estado) return;
    try {
      guardarUrlApi(entrada.value);
      estado.textContent = 'Probando conexión…';
      const resultado = await probarConexionApi();
      estado.textContent = resultado || 'La API respondió correctamente.';
    } catch (causa) {
      estado.textContent = obtenerMensajeError(causa, 'No se pudo conectar con la API.');
    }
  }

  private async actualizarDatos(): Promise<void> {
    if (this.sesion) {
      this.datos = await cargarDatosPanel(this.sesion);
      this.reporteCaja = null;
    }
  }

  private renderizarPanel(): void {
    if (!this.sesion) return this.renderizarInicioSesion();
    const usuario = this.sesion.usuario;
    if (!paginaDisponibleParaRol(usuario.rol, this.pagina)) this.pagina = 'Inicio';
    const perfil = usuario.cliente || usuario.veterinario || usuario.administrador;
    const nombre = perfil ? `${perfil.nombre} ${perfil.apellido}` : usuario.correo.split('@')[0];
    const datos = this.datos;
    const contenido = renderizarContenidoPanel(usuario.rol, nombre, this.pagina, datos, this.sesion, this.configuracionPagos, this.errorConfiguracionPagos, this.reporteCaja);
    this.raiz.innerHTML = renderizarMarcoApp(usuario.rol, nombre, this.pagina, datos, contenido);

    this.raiz.querySelectorAll<HTMLButtonElement>('[data-pagina]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const paginaSolicitada = boton.dataset.pagina || 'Inicio';
        if (!paginaDisponibleParaRol(usuario.rol, paginaSolicitada)) return;
        this.pagina = paginaSolicitada;
        this.renderizarPanel();
      });
    });
    this.raiz.querySelector('[data-accion="logout"]')?.addEventListener('click', () => this.cerrarSesion());
    this.raiz.querySelector<HTMLButtonElement>('[data-accion="cerrar-detalle"]')?.addEventListener('click', () => {
      this.raiz.querySelector<HTMLDialogElement>('#detail-dialog')?.close();
    });
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-api-detail]').forEach((boton) => {
      boton.addEventListener('click', () => void this.mostrarDetalle(boton));
    });
    this.raiz.querySelector('[data-accion="menu"]')?.addEventListener('click', () => this.raiz.querySelector('#sidebar')?.classList.toggle('open'));
    this.raiz.querySelector('[data-accion="refresh"]')?.addEventListener('click', () => void this.gestionarActualizacion());
    this.raiz.querySelectorAll<HTMLFormElement>('[data-api-form]').forEach((formulario) => {
      formulario.addEventListener('submit', (evento) => void this.enviarFormularioApi(evento, formulario));
    });
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-api-delete]').forEach((boton) => {
      boton.addEventListener('click', () => void this.eliminarRecurso(boton));
    });
    this.raiz.querySelector<HTMLFormElement>('#cliente-admin-form')?.addEventListener('submit', (evento) => void this.crearClienteDesdeAdmin(evento));
    this.raiz.querySelector<HTMLInputElement>('#patient-search')?.addEventListener('input', (evento) => this.filtrarMascotas(evento));
    this.raiz.querySelector<HTMLFormElement>('#mascota-form')?.addEventListener('submit', (evento) => void this.crearMascota(evento));
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-eliminar-mascota]').forEach((boton) => {
      boton.addEventListener('click', () => void this.eliminarMascota(Number(boton.dataset.eliminarMascota)));
    });
    this.raiz.querySelector<HTMLFormElement>('#turno-form')?.addEventListener('submit', (evento) => void this.solicitarTurno(evento));
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-cancelar-turno]').forEach((boton) => {
      boton.addEventListener('click', () => void this.cancelarTurno(Number(boton.dataset.cancelarTurno)));
    });
    this.raiz.querySelector<HTMLFormElement>('#abrir-caja-form')?.addEventListener('submit', (evento) => void this.abrirCaja(evento));
    this.raiz.querySelector<HTMLFormElement>('#ingreso-form')?.addEventListener('submit', (evento) => void this.registrarIngreso(evento));
    this.raiz.querySelector<HTMLFormElement>('#egreso-form')?.addEventListener('submit', (evento) => void this.registrarEgreso(evento));
    this.raiz.querySelectorAll<HTMLFormElement>('[data-cobro-atencion]').forEach((formulario) => {
      formulario.addEventListener('submit', (evento) => void this.registrarCobroAtencion(evento, formulario));
    });
    this.raiz.querySelector<HTMLFormElement>('#historial-form')?.addEventListener('submit', (evento) => void this.guardarHistoria(evento));
    this.raiz.querySelector<HTMLFormElement>('#consulta-form')?.addEventListener('submit', (evento) => void this.guardarRegistroClinico(evento, '/consultas'));
    this.raiz.querySelector<HTMLFormElement>('#vacunacion-form')?.addEventListener('submit', (evento) => void this.guardarRegistroClinico(evento, '/vacunaciones'));
    this.raiz.querySelector<HTMLFormElement>('#staff-form')?.addEventListener('submit', (evento) => void this.crearMiembroEquipo(evento));
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-cerrar-caja]').forEach((boton) => {
      boton.addEventListener('click', () => void this.cerrarCaja(Number(boton.dataset.cerrarCaja)));
    });
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-reporte-caja]').forEach((boton) => {
      boton.addEventListener('click', () => void this.mostrarReporteCaja(Number(boton.dataset.reporteCaja)));
    });
    if ((this.pagina === 'Pagos' || this.pagina === 'Caja') && !this.intentoCargarConfiguracionPagos) {
      void this.cargarConfiguracionPagos();
    }
  }

  private async crearMascota(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();
    const formulario = this.raiz.querySelector<HTMLFormElement>('#mascota-form');
    const error = formulario?.querySelector<HTMLElement>('.login-error');
    const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!formulario || !error || !boton || !this.sesion?.token) return;
    const campo = (nombre: string) => String(new FormData(formulario).get(nombre) || '').trim();
    const peso = campo('peso');
    const fechaNacimiento = campo('fechaNacimiento');
    const clienteId = campo('clienteId');
    const idClienteSeleccionado = Number(clienteId);
    if (this.sesion.usuario.rol !== 'CLIENTE'
      && (!clienteId || !Number.isInteger(idClienteSeleccionado) || idClienteSeleccionado < 1)) {
      error.textContent = 'Selecciona el cliente responsable de la mascota.';
      return;
    }
    const datos = {
      nombre: campo('nombre'),
      especie: campo('especie'),
      raza: campo('raza') || undefined,
      peso: peso ? Number(peso) : undefined,
      fechaNacimiento: fechaNacimiento || undefined,
      observaciones: campo('observaciones') || undefined,
      ...(this.sesion.usuario.rol === 'CLIENTE' ? {} : { clienteId: idClienteSeleccionado }),
    };
    boton.disabled = true;
    error.textContent = '';
    try {
      await enviarApi('/mascotas', this.sesion.token, 'POST', datos);
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso('Mascota registrada correctamente.');
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No se pudo registrar la mascota.');
      boton.disabled = false;
    }
  }

  private async enviarFormularioApi(evento: SubmitEvent, formulario: HTMLFormElement): Promise<void> {
    evento.preventDefault();
    const endpoint = formulario.dataset.endpoint;
    const metodo = formulario.dataset.method;
    const boton = formulario.querySelector<HTMLButtonElement>('button[type="submit"]');
    const error = formulario.querySelector<HTMLElement>('.login-error');
    if (!endpoint || !metodo || !boton || !this.sesion?.token) return;

    const datos: Record<string, string | number | boolean | null> = {};
    for (const control of Array.from(formulario.elements)) {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) || !control.name) continue;
      if (control instanceof HTMLInputElement && control.type === 'checkbox') {
        datos[control.name] = control.checked;
      } else if (control.value.trim()) {
        datos[control.name] = control instanceof HTMLInputElement && control.type === 'number'
          ? Number(control.value)
          : control.value.trim();
      } else if (control.dataset.nullable !== undefined) {
        datos[control.name] = null;
      }
    }

    boton.disabled = true;
    if (error) error.textContent = '';
    try {
      await enviarApi(endpoint, this.sesion.token, metodo, datos);
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso('Cambios guardados correctamente.');
    } catch (causa) {
      if (error) error.textContent = obtenerMensajeError(causa, 'No se pudieron guardar los cambios.');
      boton.disabled = false;
    }
  }

  private async mostrarDetalle(boton: HTMLButtonElement): Promise<void> {
    const ruta = boton.dataset.apiDetail;
    const dialogo = this.raiz.querySelector<HTMLDialogElement>('#detail-dialog');
    const titulo = this.raiz.querySelector<HTMLElement>('#detail-title');
    const contenido = this.raiz.querySelector<HTMLElement>('#detail-content');
    if (!ruta || !dialogo || !titulo || !contenido || !this.sesion?.token) return;

    titulo.textContent = boton.dataset.detailTitle || 'Detalle del registro';
    contenido.textContent = 'Cargando información…';
    dialogo.showModal();
    try {
      const resultado = await enviarApi<unknown>(ruta, this.sesion.token);
      contenido.innerHTML = renderizarDetalleRegistro(resultado);
    } catch (causa) {
      contenido.textContent = obtenerMensajeError(causa, 'No se pudo cargar el detalle.');
    }
  }

  private async eliminarRecurso(boton: HTMLButtonElement): Promise<void> {
      const endpoint = boton.dataset.apiDelete;
      if (!endpoint || !this.sesion?.token) return;
      const confirmacion = boton.dataset.confirm || '¿Eliminar este registro?';
      if (!window.confirm(confirmacion)) return;
      boton.disabled = true;
      try {
        await enviarApi(endpoint, this.sesion.token, 'DELETE');
        await this.actualizarDatos();
        this.renderizarPanel();
        this.mostrarAviso('Registro eliminado correctamente.');
      } catch (causa) {
        this.mostrarAviso(obtenerMensajeError(causa, 'No se pudo eliminar el registro.'));
        boton.disabled = false;
      }
    }

  private async crearClienteDesdeAdmin(evento: SubmitEvent): Promise<void> {
      evento.preventDefault();
      const formulario = this.raiz.querySelector<HTMLFormElement>('#cliente-admin-form');
      const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
      const error = formulario?.querySelector<HTMLElement>('.login-error');
      if (!formulario || !boton || !error) return;
      const valores = new FormData(formulario);
      const campo = (nombre: string) => String(valores.get(nombre) || '').trim();
      boton.disabled = true;
      error.textContent = '';
      try {
        await registrarCliente({
          correo: campo('correo'),
          clave: String(valores.get('password') || ''),
          cedulaIdentidad: campo('cedulaIdentidad'),
          nombre: campo('nombre'),
          apellido: campo('apellido'),
          telefono: campo('telefono'),
          direccion: campo('direccion'),
        });
        await this.actualizarDatos();
        this.renderizarPanel();
        this.mostrarAviso('Cliente registrado correctamente.');
      } catch (causa) {
        error.textContent = obtenerMensajeError(causa, 'No se pudo registrar el cliente.');
        boton.disabled = false;
      }
    }

    private async eliminarMascota(id: number): Promise<void> {
    if (!this.sesion?.token || !Number.isInteger(id) || !window.confirm('¿Dar de baja esta mascota?')) return;
    try {
      await enviarApi(`/mascotas/${id}`, this.sesion.token, 'DELETE');
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso('Mascota dada de baja.');
    } catch (causa) {
      this.mostrarAviso(obtenerMensajeError(causa, 'No se pudo dar de baja la mascota.'));
    }
  }

  private async solicitarTurno(evento: SubmitEvent): Promise<void> {
      evento.preventDefault();
      const formulario = this.raiz.querySelector<HTMLFormElement>('#turno-form');
      const error = formulario?.querySelector<HTMLElement>('.login-error');
      const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (!formulario || !error || !boton || !this.sesion?.token) return;
      const campo = (nombre: string) => String(new FormData(formulario).get(nombre) || '').trim();
      const veterinario = this.datos.veterinarios.find((persona) => persona.usuarioId === this.sesion?.usuario.id);
      const veterinarioId = this.sesion.usuario.rol === 'VETERINARIO'
        ? veterinario?.id
        : Number(campo('veterinarioId'));
      if (!veterinarioId) {
        error.textContent = 'No hay un veterinario disponible para asignar el turno.';
        return;
      }
      boton.disabled = true;
      error.textContent = '';
      try {
        await enviarApi('/turnos', this.sesion.token, 'POST', {
          mascotaId: Number(campo('mascotaId')),
          veterinarioId,
          fecha: `${campo('fecha')}T00:00:00.000Z`,
          hora: campo('hora'),
          motivo: campo('motivo') || undefined,
        });
        await this.actualizarDatos();
        this.renderizarPanel();
        this.mostrarAviso('Solicitud de turno registrada.');
      } catch (causa) {
        error.textContent = obtenerMensajeError(causa, 'No se pudo solicitar el turno.');
        boton.disabled = false;
      }
    }

  private async cancelarTurno(id: number): Promise<void> {
      if (!this.sesion?.token || !Number.isInteger(id) || !window.confirm('¿Cancelar este turno?')) return;
      try {
        await enviarApi(`/turnos/${id}/cancelar`, this.sesion.token, 'PATCH', {});
        await this.actualizarDatos();
        this.renderizarPanel();
        this.mostrarAviso('Turno cancelado.');
      } catch (causa) {
        this.mostrarAviso(obtenerMensajeError(causa, 'No se pudo cancelar el turno.'));
      }
  }

  private async cargarConfiguracionPagos(): Promise<void> {
        this.intentoCargarConfiguracionPagos = true;
        try {
          this.configuracionPagos = await obtenerConfiguracionPagos();
        } catch (causa) {
          this.errorConfiguracionPagos = obtenerMensajeError(causa, 'No se pudo cargar la configuración de pagos.');
        }
        this.renderizarPanel();
      }

  private async abrirCaja(evento: SubmitEvent): Promise<void> {
        evento.preventDefault();
        const formulario = this.raiz.querySelector<HTMLFormElement>('#abrir-caja-form');
        const error = formulario?.querySelector<HTMLElement>('.login-error');
        const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (!formulario || !error || !boton || !this.sesion?.token) return;
        const saldoInicial = Number(new FormData(formulario).get('saldoInicial'));
        boton.disabled = true;
        try {
          await enviarApi('/caja/abrir', this.sesion.token, 'POST', { saldoInicial });
          await this.actualizarDatos();
          this.renderizarPanel();
          this.mostrarAviso('Caja abierta.');
        } catch (causa) {
          error.textContent = obtenerMensajeError(causa, 'No se pudo abrir la caja.');
          boton.disabled = false;
        }
      }

  private async cerrarCaja(id: number): Promise<void> {
        if (!this.sesion?.token || !Number.isInteger(id) || !window.confirm('¿Cerrar la caja actual?')) return;
        try {
          await enviarApi(`/caja/${id}/cerrar`, this.sesion.token, 'POST');
          await this.actualizarDatos();
          this.renderizarPanel();
          this.mostrarAviso('Caja cerrada.');
        } catch (causa) {
          this.mostrarAviso(obtenerMensajeError(causa, 'No se pudo cerrar la caja.'));
        }
  }

  private async mostrarReporteCaja(id: number): Promise<void> {
    if (!this.sesion?.token || !Number.isInteger(id)) return;
    try {
      const fecha = this.raiz.querySelector<HTMLInputElement>('#fecha-reporte-caja')?.value;
      const filtro = fecha ? `?fecha=${encodeURIComponent(fecha)}` : '';
      this.reporteCaja = await enviarApi<ReporteCaja>(`/caja/${id}/reporte-diario${filtro}`, this.sesion.token);
      this.renderizarPanel();
    } catch (causa) {
      this.mostrarAviso(obtenerMensajeError(causa, 'No se pudo cargar el reporte de caja.'));
    }
  }

  private async registrarCobroAtencion(evento: SubmitEvent, formulario: HTMLFormElement): Promise<void> {
    evento.preventDefault();
    const error = formulario.querySelector<HTMLElement>('.login-error');
    const boton = formulario.querySelector<HTMLButtonElement>('button[type="submit"]');
    const caja = this.datos.cajas.find((item) => item.estado === 'ABIERTA');
    const tipo = formulario.dataset.tipoAtencion;
    const id = Number(formulario.dataset.idAtencion);
    if (!error || !boton || !caja || !this.sesion?.token || !Number.isInteger(id)) return;
    const ruta = tipo === 'consulta' ? 'consultas' : tipo === 'vacunacion' ? 'vacunaciones' : '';
    if (!ruta) return;
    const formaPago = new FormData(formulario).get('formaPago');
    boton.disabled = true;
    error.textContent = '';
    try {
      await enviarApi(`/ingresos/${ruta}/${id}`, this.sesion.token, 'POST', {
        cajaId: caja.id,
        formaPago,
      });
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso('Cobro registrado y vinculado a la atención.');
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No se pudo registrar el cobro.');
      boton.disabled = false;
    }
  }

  private async registrarIngreso(evento: SubmitEvent): Promise<void> {
        evento.preventDefault();
        const formulario = this.raiz.querySelector<HTMLFormElement>('#ingreso-form');
        const error = formulario?.querySelector<HTMLElement>('.login-error');
        const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
        const caja = this.datos.cajas.find((item) => item.estado === 'ABIERTA');
        if (!formulario || !error || !boton || !caja || !this.sesion?.token) return;
        const valores = new FormData(formulario);
        const descripcion = String(valores.get('descripcion') || '').trim();
        boton.disabled = true;
        try {
          await enviarApi('/ingresos', this.sesion.token, 'POST', {
            monto: Number(valores.get('monto')),
            concepto: String(valores.get('concepto') || '').trim(),
            formaPago: String(valores.get('formaPago')),
            origen: 'CAJA',
            cajaId: caja.id,
            ...(descripcion ? { descripcion } : {}),
          });
          await this.actualizarDatos();
          this.renderizarPanel();
          this.mostrarAviso('Ingreso registrado.');
        } catch (causa) {
          error.textContent = obtenerMensajeError(causa, 'No se pudo registrar el ingreso.');
          boton.disabled = false;
        }
      }

  private async registrarEgreso(evento: SubmitEvent): Promise<void> {
        evento.preventDefault();
        const formulario = this.raiz.querySelector<HTMLFormElement>('#egreso-form');
        const error = formulario?.querySelector<HTMLElement>('.login-error');
        const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
        const caja = this.datos.cajas.find((item) => item.estado === 'ABIERTA');
        if (!formulario || !error || !boton || !caja || !this.sesion?.token) return;
        const valores = new FormData(formulario);
        const descripcion = String(valores.get('descripcion') || '').trim();
        const proveedor = String(valores.get('proveedor') || '').trim();
        boton.disabled = true;
        try {
          await enviarApi('/egresos', this.sesion.token, 'POST', {
            monto: Number(valores.get('monto')),
            concepto: String(valores.get('concepto') || '').trim(),
            categoria: String(valores.get('categoria') || '').trim(),
            cajaId: caja.id,
            ...(descripcion ? { descripcion } : {}),
            ...(proveedor ? { proveedor } : {}),
          });
          await this.actualizarDatos();
          this.renderizarPanel();
          this.mostrarAviso('Egreso registrado.');
        } catch (causa) {
          error.textContent = obtenerMensajeError(causa, 'No se pudo registrar el egreso.');
          boton.disabled = false;
        }
      }

  private async guardarHistoria(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();
    const formulario = this.raiz.querySelector<HTMLFormElement>('#historial-form');
    const error = formulario?.querySelector<HTMLElement>('.login-error');
    const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!formulario || !error || !boton || !this.sesion?.token) return;
    const valores = new FormData(formulario);
    const observaciones = String(valores.get('observaciones') || '').trim();
    boton.disabled = true;
    try {
      await enviarApi('/historiales-clinicos', this.sesion.token, 'POST', {
        mascotaId: Number(valores.get('mascotaId')),
        ...(observaciones ? { observaciones } : {}),
      });
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso('Historia clínica creada.');
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No se pudo crear la historia clínica.');
      boton.disabled = false;
    }
  }

  private async guardarRegistroClinico(evento: SubmitEvent, ruta: '/consultas' | '/vacunaciones'): Promise<void> {
    evento.preventDefault();
    const idFormulario = ruta === '/consultas' ? '#consulta-form' : '#vacunacion-form';
    const formulario = this.raiz.querySelector<HTMLFormElement>(idFormulario);
    const error = formulario?.querySelector<HTMLElement>('.login-error');
    const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!formulario || !error || !boton || !this.sesion?.token) return;
    const valores = new FormData(formulario);
    const veterinario = this.datos.veterinarios.find((persona) => persona.usuarioId === this.sesion?.usuario.id);
    const veterinarioId = this.sesion.usuario.rol === 'VETERINARIO'
      ? veterinario?.id
      : Number(valores.get('veterinarioId'));
    if (!veterinarioId) {
      error.textContent = 'No se encontró el perfil del veterinario.';
      return;
    }
    const numero = (campo: string) => Number(valores.get(campo));
    const texto = (campo: string) => String(valores.get(campo) || '').trim();
    const datos = ruta === '/consultas'
      ? {
        historialId: numero('historialId'),
        veterinarioId,
        motivo: texto('motivo'),
        diagnostico: texto('diagnostico') || undefined,
        tratamiento: texto('tratamiento') || undefined,
        costo: numero('costo'),
      }
      : {
        historialId: numero('historialId'),
        veterinarioId,
        vacuna: texto('vacuna'),
        proximaDosis: texto('proximaDosis') || undefined,
        costo: numero('costo'),
      };
    boton.disabled = true;
    try {
      await enviarApi(ruta, this.sesion.token, 'POST', datos);
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso(ruta === '/consultas' ? 'Consulta registrada.' : 'Vacunación registrada.');
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No se pudo guardar el registro clínico.');
      boton.disabled = false;
    }
  }

  private async crearMiembroEquipo(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();
    const formulario = this.raiz.querySelector<HTMLFormElement>('#staff-form');
    const error = formulario?.querySelector<HTMLElement>('.login-error');
    const boton = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!formulario || !error || !boton || !this.sesion?.token) return;
    const valores = new FormData(formulario);
    const texto = (campo: string) => String(valores.get(campo) || '').trim();
    const rol = texto('rol');
    const especialidad = texto('especialidad');
    const nroMatricula = texto('nroMatricula');
    const telefono = texto('telefono');
    const direccion = texto('direccion');
    const datos = {
      rol,
      correo: texto('correo'),
      password: String(valores.get('password') || ''),
      nombre: texto('nombre'),
      apellido: texto('apellido'),
      ...(telefono ? { telefono } : {}),
      ...(direccion ? { direccion } : {}),
      ...(rol === 'VETERINARIO' ? { especialidad, nroMatricula } : {}),
    };
    boton.disabled = true;
    try {
      await enviarApi('/auth/usuarios', this.sesion.token, 'POST', datos);
      await this.actualizarDatos();
      this.renderizarPanel();
      this.mostrarAviso('Cuenta del equipo creada correctamente.');
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No se pudo crear la cuenta.');
      boton.disabled = false;
    }
  }

  private async gestionarActualizacion(): Promise<void> {
    await this.actualizarDatos();
    this.renderizarPanel();
    this.mostrarAviso('Datos actualizados.');
  }

  private filtrarMascotas(evento: Event): void {
    const entrada = evento.currentTarget as HTMLInputElement;
    const termino = entrada.value.toLocaleLowerCase('es');
    this.raiz.querySelectorAll<HTMLElement>('[data-busqueda]').forEach((fila) => {
      fila.hidden = !(fila.dataset.busqueda || '').includes(termino);
    });
  }

  private cerrarSesion(): void {
    this.sesion = null;
    this.datos = crearDatosVacios();
    this.reporteCaja = null;
    this.pagina = 'Inicio';
    limpiarSesion();
    this.renderizarInicioSesion();
  }

  private mostrarAviso(mensaje: string): void {
    this.aviso.textContent = mensaje;
    this.aviso.classList.add('show');
    window.clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = window.setTimeout(() => this.aviso.classList.remove('show'), 3200);
  }
}

export function crearControlador(): ControladorApp {
  if (!obtenerUrlApiGuardada()) guardarUrlApi(API_PREDETERMINADA);
  return new ControladorApp();
}