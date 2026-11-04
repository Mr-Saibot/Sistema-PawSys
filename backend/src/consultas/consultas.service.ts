import { Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Injectable()
export class ConsultasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConsultaDto: CreateConsultaDto, usuario: { id: number; rol: Rol }) {
    const historialId = Number(createConsultaDto.historialId);
    let veterinarioId = Number(createConsultaDto.veterinarioId);
    if (usuario.rol === Rol.VETERINARIO) {
      const perfil = await this.prisma.veterinario.findUnique({ where: { usuarioId: usuario.id } });
      if (!perfil) throw new NotFoundException('No existe un perfil veterinario para este usuario');
      veterinarioId = perfil.id;
    }

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

    return this.prisma.consulta.create({
      data: {
        motivo: createConsultaDto.motivo,
        diagnostico: createConsultaDto.diagnostico || null,
        tratamiento: createConsultaDto.tratamiento || null,
        costo: createConsultaDto.costo,
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
    return this.prisma.consulta.findMany({
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
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: {
        historial: {
          include: { mascota: true },
        },
        veterinario: true,
      },
    });

    if (!consulta) {
      throw new NotFoundException(`Consulta médica con ID ${id} no encontrada`);
    }

    return consulta;
  }

  async update(id: number, updateConsultaDto: UpdateConsultaDto) {
    await this.findOne(id);

    return this.prisma.consulta.update({
      where: { id },
      data: {
        motivo: updateConsultaDto.motivo,
        diagnostico: updateConsultaDto.diagnostico,
        tratamiento: updateConsultaDto.tratamiento,
        costo: updateConsultaDto.costo,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.consulta.delete({
      where: { id },
    });
  }
}