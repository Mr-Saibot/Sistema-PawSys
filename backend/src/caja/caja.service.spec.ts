import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CajaService } from './caja.service';

describe('CajaService', () => {
  let service: CajaService;
  const prisma = {
    caja: { findUnique: jest.fn() },
    ingreso: { findMany: jest.fn() },
    egreso: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.caja.findUnique.mockResolvedValue({ id: 2, estado: 'ABIERTA' });
    prisma.ingreso.findMany.mockResolvedValue([{ monto: 100 }]);
    prisma.egreso.findMany.mockResolvedValue([{ monto: 25 }]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [CajaService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<CajaService>(CajaService);
  });

  it('returns only movements for the selected Paraguay calendar day', async () => {
    const reporte = await service.reporteDiario(2, '2025-04-15');

    expect(prisma.ingreso.findMany).toHaveBeenCalledWith({
      where: {
        cajaId: 2,
        fecha: { gte: new Date('2025-04-15T03:00:00.000Z'), lt: new Date('2025-04-16T03:00:00.000Z') },
      },
      orderBy: { fecha: 'asc' },
    });
    expect(reporte).toEqual(expect.objectContaining({
      fecha: '2025-04-15',
      totalIngresos: 100,
      totalEgresos: 25,
    }));
  });

  it('rejects malformed or impossible report dates', async () => {
    await expect(service.reporteDiario(2, '2025-02-31')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.reporteDiario(2, 'yesterday')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.ingreso.findMany).not.toHaveBeenCalled();
  });
});
