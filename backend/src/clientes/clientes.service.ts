import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: createClienteDto.usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${createClienteDto.usuarioId} no encontrado`);
    if (usuario.rol !== Rol.CLIENTE || usuario.correo !== createClienteDto.correo.trim().toLowerCase()) {
      throw new BadRequestException('El usuario debe tener rol CLIENTE y coincidir con el correo del perfil');
    }
    const cedulaExiste = await this.prisma.cliente.findUnique({
      where: { cedulaIdentidad: createClienteDto.cedulaIdentidad },
    });

    if (cedulaExiste) {
      throw new BadRequestException('Ya existe un cliente con esta Cédula de Identidad');
    }

    const correoExiste = await this.prisma.cliente.findUnique({
      where: { correo: createClienteDto.correo },
    });

    if (correoExiste) {
      throw new BadRequestException('Ya existe un cliente registrado con este correo');
    }

    return this.prisma.cliente.create({
      data: { ...createClienteDto, correo: createClienteDto.correo.trim().toLowerCase() },
      include: {
        mascotas: true,
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.cliente.findMany({
      where: { usuario: { is: { estado: true } } },
      include: {
        mascotas: true,
        usuario: { select: { estado: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyPets(usuarioId: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
      select: { mascotas: true },
    });

    if (!cliente) {
      throw new NotFoundException('No existe un perfil de cliente para este usuario');
    }

    return cliente.mascotas;
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        mascotas: true,
        usuario: {
          select: { id: true, correo: true, rol: true, estado: true },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    await this.findOne(id);

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
      include: { mascotas: true },
    });
  }

  async remove(id: number) {
    const cliente = await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id: cliente.usuarioId },
      data: { estado: false },
      select: { id: true, estado: true },
    });
  }
}