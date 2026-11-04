import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto, UpdateTurnoDto } from './dto/create-turno.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() dto: CreateTurnoDto) {
    return this.turnosService.create(dto);
  }

  @Get()
  findAll() {
    return this.turnosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurnoDto) {
    return this.turnosService.update(id, dto);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.cancelar(id);
  }

  @Patch(':id/reprogramar')
  reprogramar(
    @Param('id', ParseIntPipe) id: number,
    @Body('fecha') fecha: string,
    @Body('hora') hora: string,
  ) {
    return this.turnosService.reprogramar(id, fecha, hora);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.remove(id);
  }
}