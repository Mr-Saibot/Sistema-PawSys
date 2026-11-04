import { API_PREDETERMINADA } from '../constantes.js';
import { crearDatosDemo, crearSesionDemo, crearDatosVacios } from '../datos/datos-demostracion.js';
import { renderizarMarcoApp } from '../componentes/marco-app.js';
import { renderizarContenidoPanel } from '../vistas/contenido-panel.js';
import { renderizarInicioSesion } from '../vistas/inicio-sesion.js';
import { obtenerUrlApiGuardada, esRol, cargarDatosPanel, iniciarSesion, guardarUrlApi, registrarCliente } from '../servicios/api.js';
import { limpiarSesion, leerSesion, guardarSesion } from '../servicios/sesion.js';
import { obtenerMensajeError } from '../utilidades/formato-html.js';
import { renderizarFormularioRegistro } from '../vistas/registro-cliente.js';
import type { DatosPanel, Rol, Sesion } from '../tipos.js';

export class ControladorApp {
  private readonly raiz: HTMLElement;
  private readonly aviso: HTMLElement;
  private sesion: Sesion | null = null;
  private datos: DatosPanel = crearDatosVacios();
  private pagina = 'Inicio';
  private temporizadorAviso = 0;

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
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-rol]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const rol = boton.dataset.rol;
        if (esRol(rol)) this.entrarDemo(rol);
      });
    });
    this.raiz.querySelector('[data-accion="forgot"]')?.addEventListener('click', () => this.mostrarAviso('Solicita el restablecimiento de contraseña a la clínica.'));
    this.raiz.querySelector('[data-accion="save-api"]')?.addEventListener('click', () => this.gestionarGuardadoUrlApi());
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
      await this.actualizarDatos();
      this.renderizarPanel();
    } catch (causa) {
      error.textContent = obtenerMensajeError(causa, 'No fue posible conectar con el backend.');
      boton.disabled = false;
      boton.textContent = 'Iniciar sesión';
    }
  }

  private entrarDemo(rol: Rol): void {
    this.sesion = crearSesionDemo(rol);
    this.datos = { ...crearDatosDemo(), demostracion: true };
    this.pagina = 'Inicio';
    this.renderizarPanel();
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

  private async actualizarDatos(): Promise<void> {
    if (this.sesion) this.datos = await cargarDatosPanel(this.sesion);
  }

  private renderizarPanel(): void {
    if (!this.sesion) return this.renderizarInicioSesion();
    const usuario = this.sesion.usuario;
    const perfil = usuario.cliente || usuario.veterinario || usuario.administrador;
    const nombre = usuario.nombreDemostracion || (perfil ? `${perfil.nombre} ${perfil.apellido}` : usuario.correo.split('@')[0]);
    const datos = { ...this.datos, demostracion: this.sesion.demostracion };
    const contenido = renderizarContenidoPanel(usuario.rol, nombre, this.pagina, datos, this.sesion);
    this.raiz.innerHTML = renderizarMarcoApp(usuario.rol, nombre, this.pagina, datos, contenido);

    this.raiz.querySelectorAll<HTMLButtonElement>('[data-pagina]').forEach((boton) => {
      boton.addEventListener('click', () => {
        this.pagina = boton.dataset.pagina || 'Inicio';
        this.renderizarPanel();
      });
    });
    this.raiz.querySelector('[data-accion="logout"]')?.addEventListener('click', () => this.cerrarSesion());
    this.raiz.querySelector('[data-accion="menu"]')?.addEventListener('click', () => this.raiz.querySelector('#sidebar')?.classList.toggle('open'));
    this.raiz.querySelector('[data-accion="refresh"]')?.addEventListener('click', () => void this.gestionarActualizacion());
    this.raiz.querySelector<HTMLInputElement>('#buscar-mascotas')?.addEventListener('input', (evento) => this.filtrarMascotas(evento));
  }

  private async gestionarActualizacion(): Promise<void> {
    if (this.sesion?.demostracion) {
      this.mostrarAviso('Los datos de demostración ya están actualizados.');
      return;
    }
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