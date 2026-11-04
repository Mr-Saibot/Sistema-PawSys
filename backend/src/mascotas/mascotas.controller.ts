import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.CLIENTE, Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  create(@Body() createMascotaDto: CreateMascotaDto, @Req() req: AuthenticatedRequest) {
    return this.mascotasService.create(createMascotaDto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.mascotasService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.mascotasService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMascotaDto: UpdateMascotaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.mascotasService.update(id, updateMascotaDto, req.user);
  }

  @Delete(':id')
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.mascotasService.remove(id, req.user);
  }
}