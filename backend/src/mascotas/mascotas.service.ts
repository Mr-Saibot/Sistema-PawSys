import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';

@Injectable()
export class MascotasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMascotaDto: CreateMascotaDto, usuario: { id: number; rol: Rol }) {
    let clienteId = createMascotaDto.clienteId;
    if (usuario.rol === Rol.CLIENTE) {
      const cliente = await this.prisma.cliente.findUnique({ where: { usuarioId: usuario.id } });
      if (!cliente) throw new NotFoundException('No existe un perfil de cliente para este usuario');
      clienteId = cliente.id;
    }
    if (!clienteId) throw new NotFoundException('Selecciona el cliente responsable de la mascota');
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`El cliente con ID ${clienteId} no existe`);
    }

    return this.prisma.mascota.create({
      data: {
        ...createMascotaDto,
        clienteId,
        historial: { create: {} },
        fechaNacimiento: createMascotaDto.fechaNacimiento
          ? new Date(createMascotaDto.fechaNacimiento)
          : null,
      },
      include: {
        cliente: true,
        historial: true,
      },
    });
  }

  async findAll(usuario: { id: number; rol: Rol }) {
    return this.prisma.mascota.findMany({
      where: usuario.rol === Rol.CLIENTE ? { cliente: { usuarioId: usuario.id } } : undefined,
      include: {
        cliente: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuario: { id: number; rol: Rol }) {
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
    this.assertOwner(mascota.cliente.usuarioId, usuario);

    return mascota;
  }

  async update(id: number, updateMascotaDto: UpdateMascotaDto, usuario: { id: number; rol: Rol }) {
    await this.findOne(id, usuario);
    if (usuario.rol === Rol.CLIENTE && updateMascotaDto.clienteId !== undefined) {
      throw new ForbiddenException('No puedes cambiar el responsable de tu mascota');
    }

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

  async remove(id: number, usuario: { id: number; rol: Rol }) {
    await this.findOne(id, usuario);

    return this.prisma.mascota.update({
      where: { id },
      data: { estado: false },
    });
  }

  private assertOwner(clienteUsuarioId: number, usuario: { id: number; rol: Rol }): void {
    if (usuario.rol === Rol.CLIENTE && clienteUsuarioId !== usuario.id) {
      throw new ForbiddenException('No tienes permiso para acceder a esta mascota');
    }
  }
}