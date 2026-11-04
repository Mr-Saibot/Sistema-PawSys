import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';

@Injectable()
export class EgresosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEgresoDto) {
    return this.prisma.egreso.create({ data: dto });
  }

  async findAll() {
    return this.prisma.egreso.findMany({ include: { caja: true } });
  }
}