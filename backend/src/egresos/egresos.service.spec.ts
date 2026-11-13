import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EgresosService } from './egresos.service';

describe('EgresosService', () => {
  let service: EgresosService;
  const transaction = {
    caja: { updateMany: jest.fn() },
    egreso: { create: jest.fn() },
  };
  const prisma = {
    administrador: { findUnique: jest.fn() },
    $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) => callback(transaction)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.administrador.findUnique.mockResolvedValue({ nombre: 'Ana', apellido: 'Gómez' });
    const module: TestingModule = await Test.createTestingModule({
      providers: [EgresosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<EgresosService>(EgresosService);
  });

  it('rejects an expense when the open cash balance is insufficient', async () => {
    transaction.caja.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.create({
      cajaId: 2,
      monto: 500,
      concepto: 'Insumos',
      categoria: 'Clínica',
    }, 10)).rejects.toBeInstanceOf(BadRequestException);

    expect(transaction.caja.updateMany).toHaveBeenCalledWith({
      where: { id: 2, estado: 'ABIERTA', saldoActual: { gte: 500 } },
      data: { saldoActual: { decrement: 500 } },
    });
    expect(transaction.egreso.create).not.toHaveBeenCalled();
  });
});
