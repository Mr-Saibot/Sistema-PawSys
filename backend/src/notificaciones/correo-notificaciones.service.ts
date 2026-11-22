import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const PUERTO_SMTP_PREDETERMINADO = 587;

@Injectable()
export class CorreoNotificacionesService {
  private readonly transporte: Transporter | null;
  private readonly remitente: string;

  constructor() {
    const servidor = process.env.SMTP_HOST;
    const usuario = process.env.SMTP_USER;
    const clave = process.env.SMTP_PASSWORD;
    this.remitente = process.env.SMTP_FROM ?? '';

    if (!servidor || !usuario || !clave || !this.remitente) {
      this.transporte = null;
      return;
    }

    this.transporte = nodemailer.createTransport({
      host: servidor,
      port: Number(process.env.SMTP_PORT ?? PUERTO_SMTP_PREDETERMINADO),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: usuario, pass: clave },
    });
  }

  get configurado(): boolean {
    return this.transporte !== null;
  }

  async enviarBienvenida(
    correoDestino: string,
    nombre: string,
  ): Promise<void> {
    await this.enviar({
      to: correoDestino,
      subject: 'Bienvenido a PawSys',
      text: [
        `Hola ${nombre},`,
        '',
        'Tu cuenta de PawSys fue creada correctamente.',
        'Ya podés ingresar para gestionar la información de tus mascotas.',
      ].join('\n'),
      html: this.crearHtmlBase(
        `Hola ${this.escaparHtml(nombre)}`,
        '<p>Tu cuenta de PawSys fue creada correctamente.</p>'
          + '<p>Ya podés ingresar para gestionar la información de tus mascotas.</p>',
      ),
    });
  }

  async enviarAvisoInicioSesion(
    correoDestino: string,
    nombre: string,
    fechaHora: string,
  ): Promise<void> {
    await this.enviar({
      to: correoDestino,
      subject: 'Nuevo inicio de sesión en PawSys',
      text: [
        `Hola ${nombre},`,
        '',
        `Se inició sesión en tu cuenta de PawSys el ${fechaHora}.`,
        'Si no reconocés este acceso, cambiá tu contraseña y contactá a la clínica.',
      ].join('\n'),
      html: this.crearHtmlBase(
        `Nuevo inicio de sesión`,
        `<p>Se inició sesión en tu cuenta el ${this.escaparHtml(fechaHora)}.</p>`
          + '<p>Si no reconocés este acceso, cambiá tu contraseña y contactá a la clínica.</p>',
      ),
    });
  }

  async enviarRecordatorio(
    correoDestino: string,
    nombreMascota: string,
    fechaTexto: string,
    enlaceConfirmacion: string,
  ): Promise<void> {
    await this.enviar({
      to: correoDestino,
      subject: `¿Confirmás el turno de ${nombreMascota}?`,
      text: [
        `¿Vas a asistir al turno de ${nombreMascota}?`,
        `Fecha y hora: ${fechaTexto}.`,
        `Confirmar asistencia: ${enlaceConfirmacion}`,
      ].join('\n'),
      html: this.crearHtmlBase(
        '¿Vas a asistir al turno?',
        `<p>La consulta de ${this.escaparHtml(nombreMascota)} está programada para `
          + `${this.escaparHtml(fechaTexto)}.</p>`
          + `<p><a href="${this.escaparHtml(enlaceConfirmacion)}">`
          + 'Confirmar asistencia</a></p>'
          + '<p>Si no podés asistir, comunicate con la clínica.</p>',
      ),
    });
  }

  private async enviar(datos: DatosCorreo): Promise<void> {
    if (!this.transporte) {
      throw new Error('Configura SMTP_HOST, SMTP_USER, SMTP_PASSWORD y SMTP_FROM.');
    }

    await this.transporte.sendMail({
      from: this.remitente,
      to: datos.to,
      subject: datos.subject,
      text: datos.text,
      html: datos.html,
    });
  }

  private crearHtmlBase(titulo: string, contenido: string): string {
    return `
      <main style="font-family:Arial,sans-serif;color:#1c1917">
        <h1>${titulo}</h1>
        ${contenido}
        <p>Equipo PawSys</p>
      </main>
    `;
  }

  private escaparHtml(valor: string): string {
    return valor.replace(/[&<>"']/g, (caracter) => {
      const entidades: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entidades[caracter];
    });
  }
}

interface DatosCorreo {
  to: string;
  subject: string;
  text: string;
  html: string;
}
