import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { EgresosService } from './egresos.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR)
@Controller('egresos')
export class EgresosController {
  constructor(private readonly egresosService: EgresosService) {}

  @Post()
  create(@Body() dto: CreateEgresoDto, @Req() req: AuthenticatedRequest) {
    return this.egresosService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.egresosService.findAll();
  }
}