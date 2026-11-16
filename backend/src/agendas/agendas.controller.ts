import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AgendasService } from './agendas.service';
import { CreateAgendaDto, UpdateAgendaDto } from './dto/create-agenda.dto';
import { ReservarTurnoDto } from './dto/reservar-turno.dto';

interface SolicitudAutenticada extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.CLIENTE, Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('agendas')
export class AgendasController {
  constructor(private readonly agendasService: AgendasService) {}

  @Get('disponibles')
  disponibles() {
    return this.agendasService.buscarDisponibles();
  }

  @Get()
  buscarTodos(@Req() solicitud: SolicitudAutenticada) {
    return this.agendasService.buscarTodos(solicitud.user);
  }

  @Get(':id')
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  buscarUno(
    @Param('id', ParseIntPipe) id: number,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.agendasService.buscarUno(id, solicitud.user);
  }

  @Post()
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  crear(
    @Body() dto: CreateAgendaDto,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.agendasService.crear(dto, solicitud.user);
  }

  @Post(':id/reservar')
  @Roles(Rol.CLIENTE)
  reservar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReservarTurnoDto,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.agendasService.reservar(id, dto, solicitud.user);
  }

  @Patch(':id')
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendaDto,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.agendasService.actualizar(id, dto, solicitud.user);
  }

  @Delete(':id')
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.agendasService.eliminar(id, solicitud.user);
  }
}
