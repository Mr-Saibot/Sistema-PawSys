import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCajaDto } from './dto/create-caja.dto';

@Injectable()
export class CajaService {
  constructor(private readonly prisma: PrismaService) {}

  async abrir(dto: CreateCajaDto) {
    const cajaAbierta = await this.prisma.caja.findFirst({ where: { estado: 'ABIERTA' } });
    if (cajaAbierta) throw new BadRequestException('Ya existe una caja abierta');

    return this.prisma.caja.create({
      data: {
        saldoInicial: dto.saldoInicial,
        saldoActual: dto.saldoInicial,
        administradorId: dto.administradorId,
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

  async reporteDiario(id: number) {
    const caja = await this.prisma.caja.findUnique({
      where: { id },
      include: { ingresos: true, egresos: true },
    });
    if (!caja) throw new NotFoundException(`Caja ${id} no encontrada`);

    return {
      cajaId: caja.id,
      estado: caja.estado,
      totalIngresos: caja.ingresos.reduce((acc, curr) => acc + Number(curr.monto), 0),
      totalEgresos: caja.egresos.reduce((acc, curr) => acc + Number(curr.monto), 0),
      ingresos: caja.ingresos,
      egresos: caja.egresos,
    };
  }

  listar() {
    return this.prisma.caja.findMany({ include: { ingresos: true, egresos: true, administrador: true } });
  }
}