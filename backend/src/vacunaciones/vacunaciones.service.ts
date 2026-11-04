import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacunacionDto } from './dto/create-vacunacione.dto';
import { UpdateVacunacionDto } from './dto/update-vacunacione.dto';

@Injectable()
export class VacunacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVacunacionDto: CreateVacunacionDto) {
    const historialId = Number(createVacunacionDto.historialId);
    const veterinarioId = Number(createVacunacionDto.veterinarioId);

    const historialExiste = await this.prisma.historialClinico.findUnique({
      where: { id: historialId },
    });

    if (!historialExiste) {
      throw new NotFoundException(`El historial clínico ID ${historialId} no existe`);
    }

    const veterinarioExiste = await this.prisma.veterinario.findUnique({
      where: { id: veterinarioId },
    });

    if (!veterinarioExiste) {
      throw new NotFoundException(`El veterinario ID ${veterinarioId} no existe`);
    }

    return this.prisma.vacunacion.create({
      data: {
        vacuna: createVacunacionDto.vacuna,
        proximaDosis: createVacunacionDto.proximaDosis ? new Date(createVacunacionDto.proximaDosis) : null,
        costo: createVacunacionDto.costo,
        historialId: historialId,
        veterinarioId: veterinarioId,
      },
      include: {
        historial: {
          include: { mascota: true },
        },
        veterinario: true,
      },
    });
  }

  async findAll() {
    return this.prisma.vacunacion.findMany({
      include: {
        historial: {
          include: { mascota: true },
        },
        veterinario: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const vacunacion = await this.prisma.vacunacion.findUnique({
      where: { id },
      include: {
        historial: {
          include: { mascota: true },
        },
        veterinario: true,
      },
    });

    if (!vacunacion) {
      throw new NotFoundException(`Vacunación con ID ${id} no encontrada`);
    }

    return vacunacion;
  }

  async update(id: number, updateVacunacionDto: UpdateVacunacionDto) {
    await this.findOne(id);

    return this.prisma.vacunacion.update({
      where: { id },
      data: {
        vacuna: updateVacunacionDto.vacuna,
        proximaDosis: updateVacunacionDto.proximaDosis ? new Date(updateVacunacionDto.proximaDosis) : undefined,
        costo: updateVacunacionDto.costo,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.vacunacion.delete({
      where: { id },
    });
  }
}