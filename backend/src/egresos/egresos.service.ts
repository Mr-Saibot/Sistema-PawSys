import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';

@Injectable()
export class EgresosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEgresoDto, usuarioId: number) {
    const administrador = await this.prisma.administrador.findUnique({ where: { usuarioId } });
    if (!administrador) throw new NotFoundException('No existe un perfil de administrador para este usuario');
    return this.prisma.$transaction(async (transaction) => {
      const cajaAbierta = await transaction.caja.updateMany({
        where: { id: dto.cajaId, estado: 'ABIERTA' },
        data: { saldoActual: { decrement: dto.monto } },
      });
      if (cajaAbierta.count !== 1) throw new BadRequestException('La caja no existe o está cerrada');
      return transaction.egreso.create({
        data: { ...dto, responsable: `${administrador.nombre} ${administrador.apellido}` },
      });
    });
  }

  async findAll() {
    return this.prisma.egreso.findMany({ include: { caja: true } });
  }
}