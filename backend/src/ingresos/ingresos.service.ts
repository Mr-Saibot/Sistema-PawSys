import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';

@Injectable()
export class IngresosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIngresoDto, usuarioId: number) {
    const administrador = await this.prisma.administrador.findUnique({ where: { usuarioId } });
    if (!administrador) throw new NotFoundException('No existe un perfil de administrador para este usuario');
    return this.prisma.$transaction(async (transaction) => {
      const cajaAbierta = await transaction.caja.updateMany({
        where: { id: dto.cajaId, estado: 'ABIERTA' },
        data: { saldoActual: { increment: dto.monto } },
      });
      if (cajaAbierta.count !== 1) throw new BadRequestException('La caja no existe o está cerrada');
      return transaction.ingreso.create({
        data: { ...dto, responsable: `${administrador.nombre} ${administrador.apellido}` },
      });
    });
  }

  async findAll() {
    return this.prisma.ingreso.findMany({ include: { caja: true } });
  }
}