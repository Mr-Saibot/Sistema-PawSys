import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('consultas')
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Post()
  create(@Body() createConsultaDto: CreateConsultaDto, @Req() req: AuthenticatedRequest) {
    return this.consultasService.create(createConsultaDto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.consultasService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.consultasService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsultaDto: UpdateConsultaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consultasService.update(id, updateConsultaDto, req.user);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.consultasService.remove(id, req.user);
  }
}
