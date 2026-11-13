import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { IngresosService } from './ingresos.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { CreateCobroAtencionDto } from './dto/create-cobro-atencion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR)
@Controller('ingresos')
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  create(@Body() dto: CreateIngresoDto, @Req() req: AuthenticatedRequest) {
    return this.ingresosService.create(dto, req.user.id);
  }

  @Post('consultas/:id')
  cobrarConsulta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCobroAtencionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ingresosService.cobrarConsulta(id, dto, req.user.id);
  }

  @Post('vacunaciones/:id')
  cobrarVacunacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCobroAtencionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ingresosService.cobrarVacunacion(id, dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.ingresosService.findAll();
  }
}