import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { IngresosService } from './ingresos.service';

describe('IngresosService', () => {
  let service: IngresosService;
  const transaction = {
    consulta: { findUnique: jest.fn() },
    vacunacion: { findUnique: jest.fn() },
    caja: { updateMany: jest.fn() },
    ingreso: { create: jest.fn() },
  };
  const prisma = {
    administrador: { findUnique: jest.fn() },
    $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) => callback(transaction)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.administrador.findUnique.mockResolvedValue({ nombre: 'Ana', apellido: 'Gómez' });
    transaction.caja.updateMany.mockResolvedValue({ count: 1 });
    transaction.ingreso.create.mockResolvedValue({ id: 8 });
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngresosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<IngresosService>(IngresosService);
  });

  it('records a confirmed consultation payment at its configured cost and links it to the consultation', async () => {
    transaction.consulta.findUnique.mockResolvedValue({
      id: 3,
      motivo: 'Control',
      costo: 150000,
      ingreso: null,
      historial: { mascota: { nombre: 'Luna' } },
    });

    await service.cobrarConsulta(3, { cajaId: 2, formaPago: 'EFECTIVO' }, 10);

    expect(transaction.caja.updateMany).toHaveBeenCalledWith({
      where: { id: 2, estado: 'ABIERTA' },
      data: { saldoActual: { increment: 150000 } },
    });
    expect(transaction.ingreso.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        monto: 150000,
        consultaId: 3,
        formaPago: 'EFECTIVO',
        origen: 'CONSULTA',
        responsable: 'Ana Gómez',
      }),
    });
  });

  it('records a confirmed vaccination payment and links it to the vaccination', async () => {
    transaction.vacunacion.findUnique.mockResolvedValue({
      id: 4,
      vacuna: 'Antirrábica',
      costo: 85000,
      ingreso: null,
      historial: { mascota: { nombre: 'Luna' } },
    });

    await service.cobrarVacunacion(4, { cajaId: 2, formaPago: 'TRANSFERENCIA_QR' }, 10);

    expect(transaction.caja.updateMany).toHaveBeenCalledWith({
      where: { id: 2, estado: 'ABIERTA' },
      data: { saldoActual: { increment: 85000 } },
    });
    expect(transaction.ingreso.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        monto: 85000,
        vacunacionId: 4,
        formaPago: 'TRANSFERENCIA_QR',
        origen: 'VACUNACION',
      }),
    });
  });

  it('does not register or add a second payment for an already charged consultation', async () => {
    transaction.consulta.findUnique.mockResolvedValue({
      id: 3,
      ingreso: { id: 5 },
      historial: { mascota: { nombre: 'Luna' } },
    });

    await expect(service.cobrarConsulta(3, { cajaId: 2, formaPago: 'EFECTIVO' }, 10))
      .rejects.toBeInstanceOf(ConflictException);
    expect(transaction.caja.updateMany).not.toHaveBeenCalled();
    expect(transaction.ingreso.create).not.toHaveBeenCalled();
  });
});
