import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCajaDto } from './dto/create-caja.dto';

@Injectable()
export class CajaService {
  constructor(private readonly prisma: PrismaService) {}

  async abrir(dto: CreateCajaDto, usuarioId: number) {
    const cajaAbierta = await this.prisma.caja.findFirst({ where: { estado: 'ABIERTA' } });
    if (cajaAbierta) throw new BadRequestException('Ya existe una caja abierta');
    const administrador = await this.prisma.administrador.findUnique({ where: { usuarioId } });
    if (!administrador) throw new NotFoundException('No existe un perfil de administrador para este usuario');

    return this.prisma.caja.create({
      data: {
        saldoInicial: dto.saldoInicial,
        saldoActual: dto.saldoInicial,
        administradorId: administrador.id,
        estado: 'ABIERTA',
      },
    });
  }

  async cerrar(id: number) {
    const caja = await this.prisma.caja.findUnique({
      where: { id },
      include: { ingresos: true, egresos: true },
    });
    if (!caja) throw new NotFoundException(`Caja ${id} no encontrada`);
    if (caja.estado === 'CERRADA') throw new BadRequestException('La caja ya está cerrada');

    const totalIngresos = caja.ingresos.reduce((acc, curr) => acc + Number(curr.monto), 0);
    const totalEgresos = caja.egresos.reduce((acc, curr) => acc + Number(curr.monto), 0);
    const saldoFinal = Number(caja.saldoInicial) + totalIngresos - totalEgresos;

    return this.prisma.caja.update({
      where: { id },
      data: {
        estado: 'CERRADA',
        saldoActual: saldoFinal,
        fechaCierre: new Date(),
      },
    });
  }

  async reporteDiario(id: number, fechaSolicitada?: string) {
    const fecha = fechaSolicitada ?? this.fechaActualParaguay();
    const { inicio, fin } = this.rangoDelDiaParaguayo(fecha);
    const caja = await this.prisma.caja.findUnique({ where: { id } });
    if (!caja) throw new NotFoundException(`Caja ${id} no encontrada`);
    const [ingresos, egresos] = await Promise.all([
      this.prisma.ingreso.findMany({
        where: { cajaId: id, fecha: { gte: inicio, lt: fin } },
        orderBy: { fecha: 'asc' },
      }),
      this.prisma.egreso.findMany({
        where: { cajaId: id, fecha: { gte: inicio, lt: fin } },
        orderBy: { fecha: 'asc' },
      }),
    ]);

    return {
      cajaId: caja.id,
      estado: caja.estado,
      fecha,
      totalIngresos: ingresos.reduce((acc, curr) => acc + Number(curr.monto), 0),
      totalEgresos: egresos.reduce((acc, curr) => acc + Number(curr.monto), 0),
      ingresos,
      egresos,
    };
  }

  listar() {
    return this.prisma.caja.findMany({ include: { ingresos: true, egresos: true, administrador: true } });
  }

  private fechaActualParaguay(): string {
    const partes = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Asuncion',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const obtener = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value;
    return `${obtener('year')}-${obtener('month')}-${obtener('day')}`;
  }

  private rangoDelDiaParaguayo(fecha: string): { inicio: Date; fin: Date } {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BadRequestException('La fecha debe tener el formato YYYY-MM-DD y ser válida');
    }
    const inicio = new Date(`${fecha}T00:00:00-03:00`);
    if (Number.isNaN(inicio.getTime())) {
      throw new BadRequestException('La fecha debe tener el formato YYYY-MM-DD y ser válida');
    }
    const fechaParaguay = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Asuncion',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(inicio);
    if (fechaParaguay !== fecha) {
      throw new BadRequestException('La fecha debe tener el formato YYYY-MM-DD y ser válida');
    }
    const fin = new Date(inicio);
    fin.setUTCDate(fin.getUTCDate() + 1);
    return { inicio, fin };
  }
}