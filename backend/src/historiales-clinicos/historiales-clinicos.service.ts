import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistorialClinicoDto } from './dto/create-historiales-clinico.dto';
import { UpdateHistorialClinicoDto } from './dto/update-historiales-clinico.dto';

@Injectable()
export class HistorialesClinicosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHistorialClinicoDto: CreateHistorialClinicoDto) {
    const idMascota = Number(createHistorialClinicoDto.mascotaId);

    const mascotaExiste = await this.prisma.mascota.findUnique({
      where: { id: idMascota },
    });

    if (!mascotaExiste) {
      throw new NotFoundException(`La mascota con ID ${idMascota} no existe`);
    }

    const historialExiste = await this.prisma.historialClinico.findUnique({
      where: { mascotaId: idMascota },
    });

    if (historialExiste) {
      throw new BadRequestException('La mascota ya cuenta con un historial clínico registrado');
    }

    return this.prisma.historialClinico.create({
      data: {
        mascotaId: idMascota,
        observaciones: createHistorialClinicoDto.observaciones || null,
      },
      include: {
        mascota: {
          include: { cliente: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.historialClinico.findMany({
      include: {
        mascota: {
          include: { cliente: true },
        },
        consultas: true,
        vacunaciones: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const historial = await this.prisma.historialClinico.findUnique({
      where: { id },
      include: {
        mascota: {
          include: { cliente: true },
        },
        consultas: {
          include: { veterinario: true },
        },
        vacunaciones: {
          include: { veterinario: true },
        },
      },
    });

    if (!historial) {
      throw new NotFoundException(`Historial clínico con ID ${id} no encontrado`);
    }

    return historial;
  }

  async findByMascota(mascotaId: number) {
    const historial = await this.prisma.historialClinico.findUnique({
      where: { mascotaId },
      include: {
        mascota: {
          include: { cliente: true },
        },
        consultas: {
          include: { veterinario: true },
        },
        vacunaciones: {
          include: { veterinario: true },
        },
      },
    });

    if (!historial) {
      throw new NotFoundException(`No se encontró historial clínico para la mascota ID ${mascotaId}`);
    }

    return historial;
  }

  async update(id: number, updateHistorialClinicoDto: UpdateHistorialClinicoDto) {
    await this.findOne(id);

    return this.prisma.historialClinico.update({
      where: { id },
      data: {
        observaciones: updateHistorialClinicoDto.observaciones,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.historialClinico.delete({
      where: { id },
    });
  }
}