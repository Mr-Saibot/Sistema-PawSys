import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto, UpdateTurnoDto } from './dto/create-turno.dto';

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTurnoDto, usuario: { id: number; rol: Rol }) {
    let veterinarioId = dto.veterinarioId;
    const mascota = await this.prisma.mascota.findUnique({
      where: { id: dto.mascotaId },
      include: { cliente: true },
    });
    if (!mascota) throw new NotFoundException(`La mascota con ID ${dto.mascotaId} no existe`);
    if (!mascota.estado) throw new BadRequestException('No se puede reservar un turno para una mascota inactiva');
    if (usuario.rol === Rol.CLIENTE && mascota.cliente.usuarioId !== usuario.id) {
      throw new ForbiddenException('Solo puedes solicitar turnos para tus mascotas');
    }
    if (usuario.rol === Rol.VETERINARIO) {
      const veterinario = await this.prisma.veterinario.findUnique({ where: { usuarioId: usuario.id } });
      if (!veterinario) throw new NotFoundException('No existe un perfil veterinario para este usuario');
      veterinarioId = veterinario.id;
    }
    const veterinarioExiste = await this.prisma.veterinario.findUnique({ where: { id: veterinarioId } });
    if (!veterinarioExiste) throw new NotFoundException(`El veterinario con ID ${veterinarioId} no existe`);
    const fecha = new Date(dto.fecha);
    const hoy = new Date().toISOString().slice(0, 10);
    if (fecha.toISOString().slice(0, 10) < hoy) throw new BadRequestException('No se puede solicitar un turno en el pasado');
    const turnoOcupado = await this.prisma.turno.findFirst({
      where: { veterinarioId, fecha, hora: dto.hora, estado: { not: 'CANCELADO' } },
      select: { id: true },
    });
    if (turnoOcupado) throw new ConflictException('El veterinario ya tiene un turno reservado en ese horario');
    return this.prisma.turno.create({
      data: {
        fecha,
        hora: dto.hora,
        motivo: dto.motivo,
        mascotaId: dto.mascotaId,
        veterinarioId,
        agendaId: dto.agendaId,
      },
      include: { mascota: true, veterinario: true },
    });
  }

  findAll(usuario: { id: number; rol: Rol }) {
    const where = usuario.rol === Rol.CLIENTE
      ? { mascota: { cliente: { usuarioId: usuario.id } } }
      : usuario.rol === Rol.VETERINARIO
        ? { veterinario: { usuarioId: usuario.id } }
        : undefined;
    return this.prisma.turno.findMany({ where, include: { mascota: true, veterinario: true }, orderBy: [{ fecha: 'asc' }, { hora: 'asc' }] });
  }

  async findOne(id: number, usuario: { id: number; rol: Rol }) {
    const turno = await this.prisma.turno.findUnique({ where: { id }, include: { mascota: { include: { cliente: true } }, veterinario: true } });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);
    this.assertCanAccess(turno, usuario);
    return turno;
  }

  async update(id: number, dto: UpdateTurnoDto, usuario: { id: number; rol: Rol }) {
    const turno = await this.findOne(id, usuario);
    if (usuario.rol === Rol.VETERINARIO && dto.veterinarioId !== undefined) {
      throw new ForbiddenException('No puedes reasignar el turno a otro veterinario');
    }
    if (dto.fecha) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (new Date(dto.fecha).toISOString().slice(0, 10) < hoy) {
        throw new BadRequestException('No se puede reprogramar un turno al pasado');
      }
    }
    if (dto.mascotaId !== undefined) {
      const mascota = await this.prisma.mascota.findUnique({
        where: { id: dto.mascotaId },
        select: { id: true, estado: true },
      });
      if (!mascota) throw new NotFoundException(`La mascota con ID ${dto.mascotaId} no existe`);
      if (!mascota.estado) throw new BadRequestException('No se puede asignar un turno a una mascota inactiva');
    }
    if (dto.veterinarioId !== undefined) {
      const veterinario = await this.prisma.veterinario.findUnique({
        where: { id: dto.veterinarioId },
        select: { id: true },
      });
      if (!veterinario) throw new NotFoundException(`El veterinario con ID ${dto.veterinarioId} no existe`);
    }
    if (dto.fecha !== undefined || dto.hora !== undefined || dto.veterinarioId !== undefined) {
      const fecha = dto.fecha ? new Date(dto.fecha) : turno.fecha;
      const hora = dto.hora ?? turno.hora;
      const veterinarioId = dto.veterinarioId ?? turno.veterinarioId;
      const turnoOcupado = await this.prisma.turno.findFirst({
        where: {
          id: { not: id },
          veterinarioId,
          fecha,
          hora,
          estado: { not: 'CANCELADO' },
        },
        select: { id: true },
      });
      if (turnoOcupado) throw new ConflictException('El veterinario ya tiene un turno reservado en ese horario');
    }
    return this.prisma.turno.update({
      where: { id },
      data: {
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        ...(dto.hora && { hora: dto.hora }),
        ...(dto.mascotaId && { mascotaId: dto.mascotaId }),
        ...(dto.veterinarioId && { veterinarioId: dto.veterinarioId }),
        ...(dto.agendaId && { agendaId: dto.agendaId }),
        ...(dto.motivo !== undefined && { motivo: dto.motivo }),
      },
      include: { mascota: true, veterinario: true },
    });
  }

  async cancelar(id: number, usuario: { id: number; rol: Rol }) {
    const turno = await this.findOne(id, usuario);
    if (turno.estado === 'CANCELADO') throw new BadRequestException('El turno ya está cancelado');
    return this.prisma.turno.update({
      where: { id },
      data: { estado: 'CANCELADO' },
    });
  }

  async reprogramar(id: number, nuevaFecha: string, nuevaHora: string, usuario: { id: number; rol: Rol }) {
    const turno = await this.findOne(id, usuario);
    if (turno.estado === 'CANCELADO') throw new BadRequestException('No se puede reprogramar un turno cancelado');
    const fecha = new Date(nuevaFecha);
    if (fecha.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)) throw new BadRequestException('No se puede reprogramar un turno al pasado');
    const ocupado = await this.prisma.turno.findFirst({
      where: { id: { not: id }, veterinarioId: turno.veterinarioId, fecha, hora: nuevaHora, estado: { not: 'CANCELADO' } },
      select: { id: true },
    });
    if (ocupado) throw new ConflictException('El veterinario ya tiene un turno reservado en ese horario');
    return this.prisma.turno.update({
      where: { id },
      data: {
        fecha,
        hora: nuevaHora,
        estado: 'PENDIENTE',
      },
    });
  }

  remove(id: number) {
    return this.prisma.turno.delete({ where: { id } });
  }

  private assertCanAccess(
    turno: { mascota: { cliente: { usuarioId: number } }; veterinario: { usuarioId: number } },
    usuario: { id: number; rol: Rol },
  ): void {
    if (usuario.rol === Rol.CLIENTE && turno.mascota.cliente.usuarioId !== usuario.id) {
      throw new ForbiddenException('No tienes permiso para acceder a este turno');
    }
    if (usuario.rol === Rol.VETERINARIO && turno.veterinario.usuarioId !== usuario.id) {
      throw new ForbiddenException('No tienes permiso para acceder a este turno');
    }
  }
}