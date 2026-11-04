import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto, ReprogramarTurnoDto, UpdateTurnoDto } from './dto/create-turno.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.CLIENTE, Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() dto: CreateTurnoDto, @Req() req: AuthenticatedRequest) {
    return this.turnosService.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.turnosService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.turnosService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurnoDto, @Req() req: AuthenticatedRequest) {
    return this.turnosService.update(id, dto, req.user);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.turnosService.cancelar(id, req.user);
  }

  @Patch(':id/reprogramar')
  reprogramar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReprogramarTurnoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.turnosService.reprogramar(id, dto.fecha, dto.hora, req.user);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.remove(id);
  }
}