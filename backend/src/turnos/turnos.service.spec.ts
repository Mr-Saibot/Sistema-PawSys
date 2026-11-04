import { Test, TestingModule } from '@nestjs/testing';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TurnosService } from './turnos.service';

describe('TurnosService', () => {
  let service: TurnosService;
  const prisma = {
    turno: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TurnosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<TurnosService>(TurnosService);
  });

  it('rejects an update that would occupy another non-cancelled turn slot', async () => {
    prisma.turno.findUnique.mockResolvedValue({
      id: 1,
      fecha: new Date('2099-05-10T00:00:00.000Z'),
      hora: '09:00',
      veterinarioId: 7,
      mascota: { cliente: { usuarioId: 20 } },
      veterinario: { usuarioId: 30 },
    });
    prisma.turno.findFirst.mockResolvedValue({ id: 2 });

    await expect(
      service.update(1, { hora: '10:00' }, { id: 40, rol: Rol.ADMINISTRADOR }),
    ).rejects.toThrow('El veterinario ya tiene un turno reservado en ese horario');
    expect(prisma.turno.update).not.toHaveBeenCalled();
  });
});
