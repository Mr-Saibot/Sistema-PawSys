import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaDto, UpdateAgendaDto } from './dto/create-agenda.dto';
import { ReservarTurnoDto } from './dto/reservar-turno.dto';
import {
  convertirFechaUtc,
  fechaHoraAgendaEsFutura,
  horariosSeSuperponen,
  obtenerFechaParaguay,
  validarHorarioAgenda,
} from './agendas.utilidades';

interface UsuarioAgenda {
  id: number;
  rol: Rol;
}

@Injectable()
export class AgendasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CreateAgendaDto, usuario: UsuarioAgenda) {
    const veterinarioId = await this.obtenerVeterinarioId(
      dto.veterinarioId,
      usuario,
    );
    const duracionMinutos = dto.duracionMinutos ?? 30;
    const fecha = convertirFechaUtc(dto.fecha);

    this.validarFechaFutura(fecha, dto.horario);
    validarHorarioAgenda(dto.horario, duracionMinutos);
    await this.validarSinSuperposicion(
      veterinarioId,
      fecha,
      dto.horario,
      duracionMinutos,
    );

    return this.prisma.agenda.create({
      data: {
        fecha,
        horario: dto.horario,
        duracionMinutos,
        veterinarioId,
      },
      include: { veterinario: true, turnos: true },
    });
  }

  async buscarTodos(usuario: UsuarioAgenda) {
    if (usuario.rol === Rol.CLIENTE) {
      return this.buscarDisponibles();
    }

    const veterinarioId = usuario.rol === Rol.VETERINARIO
      ? await this.obtenerVeterinarioId(undefined, usuario)
      : undefined;

    return this.prisma.agenda.findMany({
      where: veterinarioId ? { veterinarioId } : undefined,
      include: { veterinario: true, turnos: { include: { mascota: true } } },
      orderBy: [{ fecha: 'asc' }, { horario: 'asc' }],
    });
  }

  async buscarDisponibles() {
    const hoy = convertirFechaUtc(obtenerFechaParaguay());
    const limite = new Date(hoy);
    limite.setUTCDate(limite.getUTCDate() + 30);
    const agendas = await this.prisma.agenda.findMany({
      where: {
        fecha: { gte: hoy, lt: limite },
        veterinarioId: { not: null },
        turnos: null,
      },
      include: { veterinario: true },
      orderBy: [{ fecha: 'asc' }, { horario: 'asc' }],
    });

    return agendas.filter((agenda) =>
      fechaHoraAgendaEsFutura(agenda.fecha, agenda.horario));
  }

  async buscarUno(id: number, usuario: UsuarioAgenda) {
    const agenda = await this.obtenerAgenda(id);
    await this.validarPropietarioAgenda(agenda.veterinarioId, usuario);
    return agenda;
  }

  async actualizar(
    id: number,
    dto: UpdateAgendaDto,
    usuario: UsuarioAgenda,
  ) {
    const agenda = await this.obtenerAgenda(id);
    await this.validarPropietarioAgenda(agenda.veterinarioId, usuario);

    if (agenda.turnos) {
      throw new ConflictException(
        'No se puede cambiar un horario que ya tiene un turno reservado.',
      );
    }

    const veterinarioId = await this.obtenerVeterinarioId(
      dto.veterinarioId ?? agenda.veterinarioId ?? undefined,
      usuario,
    );
    const fecha = dto.fecha ? convertirFechaUtc(dto.fecha) : agenda.fecha;
    const horario = dto.horario ?? agenda.horario;
    const duracionMinutos = dto.duracionMinutos ?? agenda.duracionMinutos;

    this.validarFechaFutura(fecha, horario);
    validarHorarioAgenda(horario, duracionMinutos);
    await this.validarSinSuperposicion(
      veterinarioId,
      fecha,
      horario,
      duracionMinutos,
      id,
    );

    return this.prisma.agenda.update({
      where: { id },
      data: { fecha, horario, duracionMinutos, veterinarioId },
      include: { veterinario: true, turnos: true },
    });
  }

  async reservar(
    id: number,
    dto: ReservarTurnoDto,
    usuario: UsuarioAgenda,
  ) {
    if (usuario.rol !== Rol.CLIENTE) {
      throw new ForbiddenException('Solo un cliente puede reservar este horario.');
    }

    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId: usuario.id },
    });
    if (!cliente) {
      throw new NotFoundException('No existe un perfil de cliente para este usuario.');
    }

    const mascota = await this.prisma.mascota.findFirst({
      where: { id: dto.mascotaId, clienteId: cliente.id, estado: true },
      select: { id: true },
    });
    if (!mascota) {
      throw new NotFoundException('Selecciona una de tus mascotas activas.');
    }

    return this.crearTurnoParaAgenda(id, dto, mascota.id);
  }

  async eliminar(id: number, usuario: UsuarioAgenda) {
    const agenda = await this.obtenerAgenda(id);
    await this.validarPropietarioAgenda(agenda.veterinarioId, usuario);

    if (agenda.turnos) {
      throw new ConflictException(
        'Cancela primero el turno antes de eliminar este horario.',
      );
    }

    return this.prisma.agenda.delete({ where: { id } });
  }

  private async crearTurnoParaAgenda(
    id: number,
    dto: ReservarTurnoDto,
    mascotaId: number,
  ) {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id },
      include: { turnos: true },
    });

    if (!agenda || !agenda.veterinarioId) {
      throw new NotFoundException('El horario ya no está disponible.');
    }
    if (agenda.turnos) {
      throw new ConflictException('El horario ya fue reservado.');
    }
    this.validarFechaFutura(agenda.fecha, agenda.horario);

    try {
      return await this.prisma.turno.create({
        data: {
          fecha: agenda.fecha,
          hora: agenda.horario,
          motivo: dto.motivo?.trim() || null,
          mascotaId,
          veterinarioId: agenda.veterinarioId,
          agendaId: agenda.id,
        },
        include: { mascota: true, veterinario: true },
      });
    } catch (causa) {
      this.lanzarConflictoReserva(causa);
    }
  }

  private async obtenerVeterinarioId(
    solicitado: number | undefined,
    usuario: UsuarioAgenda,
  ): Promise<number> {
    if (usuario.rol === Rol.VETERINARIO) {
      const veterinario = await this.prisma.veterinario.findUnique({
        where: { usuarioId: usuario.id },
        select: { id: true },
      });
      if (!veterinario) {
        throw new NotFoundException('No existe un perfil veterinario para este usuario.');
      }
      return veterinario.id;
    }

    if (!solicitado) {
      throw new BadRequestException('Selecciona el veterinario del horario.');
    }

    const veterinario = await this.prisma.veterinario.findUnique({
      where: { id: solicitado },
      select: { id: true },
    });
    if (!veterinario) {
      throw new NotFoundException('El veterinario seleccionado no existe.');
    }
    return veterinario.id;
  }

  private async validarSinSuperposicion(
    veterinarioId: number,
    fecha: Date,
    horario: string,
    duracionMinutos: number,
    agendaIdExcluir?: number,
  ): Promise<void> {
    const agendas = await this.prisma.agenda.findMany({
      where: {
        veterinarioId,
        fecha,
        id: agendaIdExcluir ? { not: agendaIdExcluir } : undefined,
      },
      select: { horario: true, duracionMinutos: true },
    });

    const superpuesto = agendas.some((agenda) =>
      horariosSeSuperponen(
        horario,
        duracionMinutos,
        agenda.horario,
        agenda.duracionMinutos,
      ));

    if (superpuesto) {
      throw new ConflictException(
        'Ese horario se superpone con otro espacio del veterinario.',
      );
    }
  }

  private async obtenerAgenda(id: number) {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id },
      include: { turnos: true },
    });
    if (!agenda) {
      throw new NotFoundException(`El horario ${id} no existe.`);
    }
    return agenda;
  }

  private async validarPropietarioAgenda(
    veterinarioId: number | null,
    usuario: UsuarioAgenda,
  ): Promise<void> {
    if (usuario.rol === Rol.ADMINISTRADOR) {
      return;
    }

    const veterinario = await this.prisma.veterinario.findUnique({
      where: { usuarioId: usuario.id },
      select: { id: true },
    });
    if (!veterinario || veterinario.id !== veterinarioId) {
      throw new ForbiddenException('No puedes modificar la agenda de otro veterinario.');
    }
  }

  private validarFechaFutura(fecha: Date, horario: string): void {
    if (!fechaHoraAgendaEsFutura(fecha, horario)) {
      throw new BadRequestException('No se puede usar un horario pasado.');
    }
  }

  private lanzarConflictoReserva(causa: unknown): never {
    if (
      causa instanceof Prisma.PrismaClientKnownRequestError
      && causa.code === 'P2002'
    ) {
      throw new ConflictException('El horario ya fue reservado.');
    }
    throw causa;
  }
}
