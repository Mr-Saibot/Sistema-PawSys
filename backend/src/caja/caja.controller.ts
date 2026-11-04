import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { CajaService } from './caja.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR)
@Controller('caja')
export class CajaController {
  constructor(private readonly service: CajaService) {}

  @Post('abrir')
  abrir(@Body() dto: CreateCajaDto, @Req() req: AuthenticatedRequest) {
    return this.service.abrir(dto, req.user.id);
  }

  @Post(':id/cerrar')
  cerrar(@Param('id', ParseIntPipe) id: number) {
    return this.service.cerrar(id);
  }

  @Get(':id/reporte-diario')
  reporteDiario(@Param('id', ParseIntPipe) id: number) {
    return this.service.reporteDiario(id);
  }

  @Get()
  listar() {
    return this.service.listar();
  }
}

@Controller('configuracion/pagos')
export class ConfiguracionPagosController {
  @Get()
  obtenerConfiguracion() {
    return {
      alias: process.env.PAYMENT_ALIAS ?? '',
      titular: process.env.PAYMENT_HOLDER ?? '',
      qrImageUrl: process.env.PAYMENT_QR_IMAGE_URL ?? '',
    };
  }
}