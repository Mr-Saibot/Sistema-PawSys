import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCobroAtencionDto } from './dto/create-cobro-atencion.dto';
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

  async cobrarConsulta(consultaId: number, dto: CreateCobroAtencionDto, usuarioId: number) {
    const administrador = await this.obtenerAdministrador(usuarioId);
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const consulta = await transaction.consulta.findUnique({
          where: { id: consultaId },
          include: { ingreso: true, historial: { include: { mascota: true } } },
        });
        if (!consulta) throw new NotFoundException(`Consulta médica con ID ${consultaId} no encontrada`);
        if (consulta.ingreso) throw new ConflictException('Esta consulta ya tiene un cobro registrado');
        if (Number(consulta.costo) <= 0) throw new BadRequestException('La consulta debe tener un costo mayor a cero');

        await this.incrementarCaja(transaction, dto.cajaId, consulta.costo);
        return transaction.ingreso.create({
          data: {
            monto: consulta.costo,
            concepto: `Consulta: ${consulta.motivo}`,
            formaPago: dto.formaPago,
            origen: 'CONSULTA',
            cajaId: dto.cajaId,
            consultaId,
            responsable: `${administrador.nombre} ${administrador.apellido}`,
            descripcion: `Cobro confirmado para la consulta de ${consulta.historial.mascota.nombre}`,
          },
        });
      });
    } catch (error) {
      this.lanzarErrorDeCobroDuplicado(error);
    }
  }

  async cobrarVacunacion(vacunacionId: number, dto: CreateCobroAtencionDto, usuarioId: number) {
    const administrador = await this.obtenerAdministrador(usuarioId);
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const vacunacion = await transaction.vacunacion.findUnique({
          where: { id: vacunacionId },
          include: { ingreso: true, historial: { include: { mascota: true } } },
        });
        if (!vacunacion) throw new NotFoundException(`Vacunación con ID ${vacunacionId} no encontrada`);
        if (vacunacion.ingreso) throw new ConflictException('Esta vacunación ya tiene un cobro registrado');
        if (Number(vacunacion.costo) <= 0) throw new BadRequestException('La vacunación debe tener un costo mayor a cero');

        await this.incrementarCaja(transaction, dto.cajaId, vacunacion.costo);
        return transaction.ingreso.create({
          data: {
            monto: vacunacion.costo,
            concepto: `Vacunación: ${vacunacion.vacuna}`,
            formaPago: dto.formaPago,
            origen: 'VACUNACION',
            cajaId: dto.cajaId,
            vacunacionId,
            responsable: `${administrador.nombre} ${administrador.apellido}`,
            descripcion: `Cobro confirmado para la vacunación de ${vacunacion.historial.mascota.nombre}`,
          },
        });
      });
    } catch (error) {
      this.lanzarErrorDeCobroDuplicado(error);
    }
  }

  async findAll() {
    return this.prisma.ingreso.findMany({ include: { caja: true } });
  }

  private async obtenerAdministrador(usuarioId: number) {
    const administrador = await this.prisma.administrador.findUnique({ where: { usuarioId } });
    if (!administrador) throw new NotFoundException('No existe un perfil de administrador para este usuario');
    return administrador;
  }

  private async incrementarCaja(
    transaction: Prisma.TransactionClient,
    cajaId: number,
    monto: Prisma.Decimal,
  ): Promise<void> {
    const cajaAbierta = await transaction.caja.updateMany({
      where: { id: cajaId, estado: 'ABIERTA' },
      data: { saldoActual: { increment: monto } },
    });
    if (cajaAbierta.count !== 1) throw new BadRequestException('La caja no existe o está cerrada');
  }

  private lanzarErrorDeCobroDuplicado(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Esta atención ya tiene un cobro registrado');
    }
    throw error;
  }
}