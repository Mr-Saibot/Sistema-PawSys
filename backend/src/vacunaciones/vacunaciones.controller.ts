import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { VacunacionesService } from './vacunaciones.service';
import { CreateVacunacionDto } from './dto/create-vacunacione.dto';
import { UpdateVacunacionDto } from './dto/update-vacunacione.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('vacunaciones')
export class VacunacionesController {
  constructor(private readonly vacunacionesService: VacunacionesService) {}

  @Post()
  create(@Body() createVacunacionDto: CreateVacunacionDto, @Req() req: Request & { user: { id: number; rol: Rol } }) {
    return this.vacunacionesService.create(createVacunacionDto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.vacunacionesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.vacunacionesService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVacunacionDto: UpdateVacunacionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.vacunacionesService.update(id, updateVacunacionDto, req.user);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.vacunacionesService.remove(id, req.user);
  }
}
