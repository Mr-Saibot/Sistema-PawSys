import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AgendasService } from './agendas.service';
import { CreateAgendaDto, UpdateAgendaDto } from './dto/create-agenda.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('agendas')
export class AgendasController {
  constructor(private readonly agendasService: AgendasService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR)
  create(@Body() dto: CreateAgendaDto) {
    return this.agendasService.create(dto);
  }

  @Get()
  findAll() {
    return this.agendasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAgendaDto) {
    return this.agendasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.agendasService.remove(id);
  }
}