import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacunacionDto } from './dto/create-vacunacione.dto';
import { UpdateVacunacionDto } from './dto/update-vacunacione.dto';

@Injectable()
export class VacunacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVacunacionDto: CreateVacunacionDto, usuario: { id: number; rol: Rol }) {
    const historialId = Number(createVacunacionDto.historialId);
    let veterinarioId = Number(createVacunacionDto.veterinarioId);
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
        ingreso: true,
      },
    });
  }

  async findAll(usuario: { id: number; rol: Rol }) {
    const where = usuario.rol === Rol.VETERINARIO
      ? { veterinario: { usuarioId: usuario.id } }
      : undefined;

    return this.prisma.vacunacion.findMany({
      where,
      include: {
        historial: {
          include: { mascota: true },
        },
        veterinario: true,
        ingreso: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number, usuario: UsuarioClinico) {
    const vacunacion = await this.prisma.vacunacion.findUnique({
      where: { id },
      include: {
        historial: {
          include: { mascota: true },
        },
        veterinario: true,
        ingreso: true,
      },
    });

    if (!vacunacion) {
      throw new NotFoundException(`Vacunación con ID ${id} no encontrada`);
    }

    this.validarAccesoVeterinario(vacunacion.veterinario.usuarioId, usuario);

    return vacunacion;
  }

  async update(
    id: number,
    updateVacunacionDto: UpdateVacunacionDto,
    usuario: UsuarioClinico,
  ) {
    const vacunacion = await this.findOne(id, usuario);
    if (vacunacion.ingreso && updateVacunacionDto.costo !== undefined
      && Number(updateVacunacionDto.costo) !== Number(vacunacion.costo)) {
      throw new BadRequestException('No se puede cambiar el costo de una vacunación ya cobrada');
    }

    return this.prisma.vacunacion.update({
      where: { id },
      data: {
        vacuna: updateVacunacionDto.vacuna,
        proximaDosis: updateVacunacionDto.proximaDosis ? new Date(updateVacunacionDto.proximaDosis) : undefined,
        costo: updateVacunacionDto.costo,
      },
    });
  }

  async remove(id: number, usuario: UsuarioClinico) {
    const vacunacion = await this.findOne(id, usuario);
    if (vacunacion.ingreso) {
      throw new BadRequestException('No se puede eliminar una vacunación con un cobro registrado');
    }

    return this.prisma.vacunacion.delete({
      where: { id },
    });
  }

  private validarAccesoVeterinario(
    propietarioId: number,
    usuario: UsuarioClinico,
  ): void {
    if (usuario.rol === Rol.VETERINARIO && propietarioId !== usuario.id) {
      throw new ForbiddenException(
        'No puedes acceder a una vacunación de otro veterinario',
      );
    }
  }
}

interface UsuarioClinico {
  id: number;
  rol: Rol;
}
