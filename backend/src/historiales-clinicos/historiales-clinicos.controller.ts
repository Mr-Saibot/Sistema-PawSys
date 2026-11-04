import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HistorialesClinicosService } from './historiales-clinicos.service';
import { CreateHistorialClinicoDto } from './dto/create-historiales-clinico.dto';
import { UpdateHistorialClinicoDto } from './dto/update-historiales-clinico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('historiales-clinicos')
export class HistorialesClinicosController {
  constructor(private readonly historialesClinicosService: HistorialesClinicosService) {}

  @Post()
  create(@Body() createHistorialClinicoDto: CreateHistorialClinicoDto) {
    return this.historialesClinicosService.create(createHistorialClinicoDto);
  }

  @Get()
  findAll() {
    return this.historialesClinicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialesClinicosService.findOne(id);
  }

  @Get('mascota/:mascotaId')
  findByMascota(@Param('mascotaId', ParseIntPipe) mascotaId: number) {
    return this.historialesClinicosService.findByMascota(mascotaId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistorialClinicoDto: UpdateHistorialClinicoDto,
  ) {
    return this.historialesClinicosService.update(id, updateHistorialClinicoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialesClinicosService.remove(id);
  }
}