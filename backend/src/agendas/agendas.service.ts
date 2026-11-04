import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaDto, UpdateAgendaDto } from './dto/create-agenda.dto';

@Injectable()
export class AgendasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAgendaDto) {
    return this.prisma.agenda.create({
      data: {
        fecha: new Date(dto.fecha),
        horario: dto.horario,
      },
    });
  }

  findAll() {
    return this.prisma.agenda.findMany({ include: { turnos: true } });
  }

  findOne(id: number) {
    return this.prisma.agenda.findUnique({ where: { id }, include: { turnos: true } });
  }

  update(id: number, dto: UpdateAgendaDto) {
    return this.prisma.agenda.update({
      where: { id },
      data: {
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        ...(dto.horario && { horario: dto.horario }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.agenda.delete({ where: { id } });
  }
}