import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.VETERINARIO)
  findAll() {
    return this.clientesService.findAll();
  }

  @Get('me/mascotas')
  findMyPets(@Req() req: AuthenticatedRequest) {
    if (req.user.rol !== 'CLIENTE') {
      throw new ForbiddenException('Esta ruta está disponible solo para clientes');
    }

    return this.clientesService.findMyPets(req.user.id);
  }

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.VETERINARIO)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}