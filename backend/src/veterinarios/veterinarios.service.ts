import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarioDto } from './dto/create-veterinario.dto';
import { UpdateVeterinarioDto } from './dto/update-veterinario.dto';

@Injectable()
export class VeterinariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVeterinarioDto: CreateVeterinarioDto) {
    const matriculaExiste = await this.prisma.veterinario.findUnique({
      where: { nroMatricula: createVeterinarioDto.nroMatricula },
    });

    if (matriculaExiste) {
      throw new BadRequestException('Ya existe un veterinario registrado con esta matrícula');
    }

    const correoExiste = await this.prisma.veterinario.findUnique({
      where: { correo: createVeterinarioDto.correo },
    });

    if (correoExiste) {
      throw new BadRequestException('Ya existe un veterinario registrado con este correo');
    }

    return this.prisma.veterinario.create({
      data: createVeterinarioDto,
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.veterinario.findMany({
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const veterinario = await this.prisma.veterinario.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
        consultas: true,
        vacunaciones: true,
      },
    });

    if (!veterinario) {
      throw new NotFoundException(`Veterinario con ID ${id} no encontrado`);
    }

    return veterinario;
  }

  async update(id: number, updateVeterinarioDto: UpdateVeterinarioDto) {
    await this.findOne(id);

    return this.prisma.veterinario.update({
      where: { id },
      data: updateVeterinarioDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.veterinario.delete({
      where: { id },
    });
  }
}