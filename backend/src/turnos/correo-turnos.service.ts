import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const PUERTO_SMTP_PREDETERMINADO = 587;

@Injectable()
export class CorreoTurnosService {
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

  async enviarRecordatorio(
    correoDestino: string,
    nombreMascota: string,
    fechaTexto: string,
    enlaceConfirmacion: string,
  ): Promise<void> {
    if (!this.transporte) {
      throw new Error('Configura SMTP_HOST, SMTP_USER, SMTP_PASSWORD y SMTP_FROM.');
    }

    await this.transporte.sendMail({
      from: this.remitente,
      to: correoDestino,
      subject: `¿Confirmás el turno de ${nombreMascota}?`,
      text: this.crearTexto(nombreMascota, fechaTexto, enlaceConfirmacion),
      html: this.crearHtml(nombreMascota, fechaTexto, enlaceConfirmacion),
    });
  }

  private crearTexto(
    nombreMascota: string,
    fechaTexto: string,
    enlaceConfirmacion: string,
  ): string {
    return [
      `¿Vas a asistir al turno de ${nombreMascota}?`,
      `Fecha y hora: ${fechaTexto}.`,
      `Confirmar asistencia: ${enlaceConfirmacion}`,
    ].join('\n');
  }

  private crearHtml(
    nombreMascota: string,
    fechaTexto: string,
    enlaceConfirmacion: string,
  ): string {
    const nombreSeguro = this.escaparHtml(nombreMascota);
    const fechaSegura = this.escaparHtml(fechaTexto);
    const enlaceSeguro = this.escaparHtml(enlaceConfirmacion);

    return `
      <main style="font-family:Arial,sans-serif;color:#1c1917">
        <h1>¿Vas a asistir al turno?</h1>
        <p>La consulta de ${nombreSeguro} está programada para ${fechaSegura}.</p>
        <p>
          <a href="${enlaceSeguro}">Confirmar asistencia</a>
        </p>
        <p>Si no puedes asistir, comunícate con la clínica.</p>
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
