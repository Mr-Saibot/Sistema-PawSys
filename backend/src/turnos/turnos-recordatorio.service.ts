import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CorreoTurnosService } from './correo-turnos.service';

const INTERVALO_RECORDATORIOS_MS = 5 * 60 * 1000;
const HORAS_ANTES_DEL_TURNO = 24;
const TOLERANCIA_ENVIO_HORAS = 1;

type TurnoRecordatorio = Prisma.TurnoGetPayload<{
  include: { mascota: { include: { cliente: true } } };
}>;

@Injectable()
export class TurnosRecordatorioService
implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TurnosRecordatorioService.name);
  private temporizador?: NodeJS.Timeout;
  private avisoConfiguracionMostrado = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly correo: CorreoTurnosService,
  ) {}

  onModuleInit(): void {
    this.temporizador = setInterval(() => {
      void this.procesarRecordatorios().catch((causa: unknown) => {
        this.registrarErrorGeneral(causa);
      });
    }, INTERVALO_RECORDATORIOS_MS);
    this.temporizador.unref();
    void this.procesarRecordatorios().catch((causa: unknown) => {
      this.registrarErrorGeneral(causa);
    });
  }

  onModuleDestroy(): void {
    if (this.temporizador) {
      clearInterval(this.temporizador);
    }
  }

  async procesarRecordatorios(): Promise<void> {
    if (!this.correo.configurado) {
      this.informarFaltaConfiguracion();
      return;
    }

    const ahora = new Date();
    const fechaDesde = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const fechaHasta = new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000);
    const turnos = await this.prisma.turno.findMany({
      where: {
        estado: 'PENDIENTE',
        recordatorioEnviado: false,
        fecha: { gte: fechaDesde, lte: fechaHasta },
      },
      include: {
        mascota: { include: { cliente: true } },
      },
    });

    for (const turno of turnos) {
      await this.enviarSiCorresponde(turno, ahora);
    }
  }

  private async enviarSiCorresponde(
    turno: TurnoRecordatorio,
    ahora: Date,
  ): Promise<void> {
    const inicio = this.obtenerInicioTurno(turno.fecha, turno.hora);
    if (!this.correspondeRecordatorio(inicio, ahora)) {
      return;
    }

    const correo = turno.mascota.cliente.correo;
    const enlace = this.crearEnlaceConfirmacion(turno.id);
    const fechaTexto = new Intl.DateTimeFormat('es-PY', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Asuncion',
    }).format(inicio);

    try {
      await this.correo.enviarRecordatorio(
        correo,
        turno.mascota.nombre,
        fechaTexto,
        enlace,
      );
      await this.prisma.turno.update({
        where: { id: turno.id },
        data: { recordatorioEnviado: true },
      });
    } catch (causa) {
      this.logger.error(
        `No se pudo enviar el recordatorio del turno ${turno.id}.`,
        causa instanceof Error ? causa.stack : undefined,
      );
    }
  }

  private obtenerInicioTurno(fecha: Date, hora: string): Date {
    const dia = fecha.toISOString().slice(0, 10);
    return new Date(`${dia}T${hora}:00-03:00`);
  }

  private correspondeRecordatorio(inicio: Date, ahora: Date): boolean {
    const horasRestantes = (inicio.getTime() - ahora.getTime()) / 3600000;
    const minimo = HORAS_ANTES_DEL_TURNO - TOLERANCIA_ENVIO_HORAS;

    return horasRestantes >= minimo && horasRestantes <= HORAS_ANTES_DEL_TURNO;
  }

  private crearEnlaceConfirmacion(turnoId: number): string {
    const token = this.jwt.sign(
      { sub: turnoId, tipo: 'confirmacion-turno' },
      { expiresIn: '2d' },
    );
    const base = process.env.FRONTEND_PUBLIC_URL
      ?? process.env.FRONTEND_URL?.split(',')[0]
      ?? 'http://localhost:5500';
    const enlace = new URL('ficha.html', `${base.replace(/\/$/, '')}/`);
    enlace.hash = `/confirmar-turno?token=${encodeURIComponent(token)}`;
    return enlace.toString();
  }

  private informarFaltaConfiguracion(): void {
    if (this.avisoConfiguracionMostrado) {
      return;
    }

    this.logger.warn(
      'Recordatorios por correo desactivados: configura las variables SMTP.',
    );
    this.avisoConfiguracionMostrado = true;
  }

  private registrarErrorGeneral(causa: unknown): void {
    this.logger.error(
      'No se pudieron procesar los recordatorios de turnos.',
      causa instanceof Error ? causa.stack : undefined,
    );
  }
}
