import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministradorDto } from './dto/create-administradore.dto';
import { UpdateAdministradorDto } from './dto/update-administradore.dto';

@Injectable()
export class AdministradoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdministradorDto: CreateAdministradorDto) {
    const correoExiste = await this.prisma.administrador.findUnique({
      where: { correo: createAdministradorDto.correo },
    });

    if (correoExiste) {
      throw new BadRequestException('Ya existe un administrador registrado con este correo');
    }

    return this.prisma.administrador.create({
      data: createAdministradorDto,
      include: {
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.administrador.findMany({
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
    await this.findOne(id);

    return this.prisma.administrador.delete({
      where: { id },
    });
  }
}