import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly service: CajaService) {}

  @Post('abrir')
  abrir(@Body() dto: CreateCajaDto) {
    return this.service.abrir(dto);
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