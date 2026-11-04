import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarioDto } from './dto/create-veterinario.dto';
import { UpdateVeterinarioDto } from './dto/update-veterinario.dto';

@Injectable()
export class VeterinariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVeterinarioDto: CreateVeterinarioDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: createVeterinarioDto.usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${createVeterinarioDto.usuarioId} no encontrado`);
    if (usuario.rol !== Rol.VETERINARIO || usuario.correo !== createVeterinarioDto.correo.trim().toLowerCase()) {
      throw new BadRequestException('El usuario debe tener rol VETERINARIO y coincidir con el correo del perfil');
    }
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
      data: { ...createVeterinarioDto, correo: createVeterinarioDto.correo.trim().toLowerCase() },
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.veterinario.findMany({
      where: { usuario: { is: { estado: true } } },
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findDisponibles() {
    return this.prisma.veterinario.findMany({
      where: { usuario: { is: { estado: true } } },
      select: { id: true, nombre: true, apellido: true, especialidad: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
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
    const veterinario = await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id: veterinario.usuarioId },
      data: { estado: false },
      select: { id: true, estado: true },
    });
  }
}