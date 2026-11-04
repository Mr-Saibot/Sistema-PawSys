import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';

@Injectable()
export class IngresosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIngresoDto) {
    return this.prisma.ingreso.create({ data: dto });
  }

  async findAll() {
    return this.prisma.ingreso.findMany({ include: { caja: true } });
  }
}