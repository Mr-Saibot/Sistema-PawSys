import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EgresosService } from './egresos.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR)
@Controller('egresos')
export class EgresosController {
  constructor(private readonly egresosService: EgresosService) {}

  @Post()
  create(@Body() dto: CreateEgresoDto) {
    return this.egresosService.create(dto);
  }

  @Get()
  findAll() {
    return this.egresosService.findAll();
  }
}