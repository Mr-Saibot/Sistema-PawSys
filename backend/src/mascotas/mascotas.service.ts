import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';

@Injectable()
export class MascotasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMascotaDto: CreateMascotaDto) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createMascotaDto.clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`El cliente con ID ${createMascotaDto.clienteId} no existe`);
    }

    return this.prisma.mascota.create({
      data: {
        ...createMascotaDto,
        fechaNacimiento: createMascotaDto.fechaNacimiento
          ? new Date(createMascotaDto.fechaNacimiento)
          : null,
      },
      include: {
        cliente: true,
      },
    });
  }

  async findAll() {
    return this.prisma.mascota.findMany({
      include: {
        cliente: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const mascota = await this.prisma.mascota.findUnique({
      where: { id },
      include: {
        cliente: true,
        historial: true,
      },
    });

    if (!mascota) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }

    return mascota;
  }

  async update(id: number, updateMascotaDto: UpdateMascotaDto) {
    await this.findOne(id);

    return this.prisma.mascota.update({
      where: { id },
      data: {
        ...updateMascotaDto,
        fechaNacimiento: updateMascotaDto.fechaNacimiento
          ? new Date(updateMascotaDto.fechaNacimiento)
          : undefined,
      },
      include: { cliente: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.mascota.delete({
      where: { id },
    });
  }
}