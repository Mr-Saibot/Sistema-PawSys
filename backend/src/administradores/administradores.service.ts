import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministradorDto } from './dto/create-administradore.dto';
import { UpdateAdministradorDto } from './dto/update-administradore.dto';

@Injectable()
export class AdministradoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdministradorDto: CreateAdministradorDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: createAdministradorDto.usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${createAdministradorDto.usuarioId} no encontrado`);
    if (usuario.rol !== Rol.ADMINISTRADOR || usuario.correo !== createAdministradorDto.correo.trim().toLowerCase()) {
      throw new BadRequestException('El usuario debe tener rol ADMINISTRADOR y coincidir con el correo del perfil');
    }
    const correoExiste = await this.prisma.administrador.findUnique({
      where: { correo: createAdministradorDto.correo },
    });

    if (correoExiste) {
      throw new BadRequestException('Ya existe un administrador registrado con este correo');
    }

    return this.prisma.administrador.create({
      data: { ...createAdministradorDto, correo: createAdministradorDto.correo.trim().toLowerCase() },
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.administrador.findMany({
      where: { usuario: { is: { estado: true } } },
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const admin = await this.prisma.administrador.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }

    return admin;
  }

  async update(id: number, updateAdministradorDto: UpdateAdministradorDto) {
    await this.findOne(id);

    return this.prisma.administrador.update({
      where: { id },
      data: updateAdministradorDto,
    });
  }

  async remove(id: number) {
    const administrador = await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id: administrador.usuarioId },
      data: { estado: false },
      select: { id: true, estado: true },
    });
  }
}