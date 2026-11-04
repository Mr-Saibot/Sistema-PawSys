import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { VeterinariosService } from './veterinarios.service';
import { CreateVeterinarioDto } from './dto/create-veterinario.dto';
import { UpdateVeterinarioDto } from './dto/update-veterinario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR, Rol.VETERINARIO)
@Controller('veterinarios')
export class VeterinariosController {
  constructor(private readonly veterinariosService: VeterinariosService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR)
  create(@Body() createVeterinarioDto: CreateVeterinarioDto) {
    return this.veterinariosService.create(createVeterinarioDto);
  }

  @Get()
  findAll() {
    return this.veterinariosService.findAll();
  }

  @Get('disponibles')
  @Roles(Rol.CLIENTE, Rol.VETERINARIO, Rol.ADMINISTRADOR)
  findDisponibles() {
    return this.veterinariosService.findDisponibles();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.veterinariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVeterinarioDto: UpdateVeterinarioDto,
  ) {
    return this.veterinariosService.update(id, updateVeterinarioDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.veterinariosService.remove(id);
  }
}