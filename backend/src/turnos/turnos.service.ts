import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto, UpdateTurnoDto } from './dto/create-turno.dto';

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTurnoDto) {
    return this.prisma.turno.create({
      data: {
        fecha: new Date(dto.fecha),
        hora: dto.hora,
        mascotaId: dto.mascotaId,
        veterinarioId: dto.veterinarioId,
        agendaId: dto.agendaId,
      },
    });
  }

  findAll() {
    return this.prisma.turno.findMany({ include: { mascota: true, veterinario: true } });
  }

  findOne(id: number) {
    return this.prisma.turno.findUnique({ where: { id }, include: { mascota: true, veterinario: true } });
  }

  update(id: number, dto: UpdateTurnoDto) {
    return this.prisma.turno.update({
      where: { id },
      data: {
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        ...(dto.hora && { hora: dto.hora }),
        ...(dto.mascotaId && { mascotaId: dto.mascotaId }),
        ...(dto.veterinarioId && { veterinarioId: dto.veterinarioId }),
        ...(dto.agendaId && { agendaId: dto.agendaId }),
      },
    });
  }

  cancelar(id: number) {
    return this.prisma.turno.update({
      where: { id },
      data: { estado: 'CANCELADO' },
    });
  }

  reprogramar(id: number, nuevaFecha: string, nuevaHora: string) {
    return this.prisma.turno.update({
      where: { id },
      data: {
        fecha: new Date(nuevaFecha),
        hora: nuevaHora,
        estado: 'PENDIENTE',
      },
    });
  }

  remove(id: number) {
    return this.prisma.turno.delete({ where: { id } });
  }
}