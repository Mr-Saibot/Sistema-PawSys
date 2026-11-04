import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ClientesService } from './clientes.service';

describe('ClientesService', () => {
  let service: ClientesService;
  const prisma = {
    cliente: { findUnique: jest.fn() },
    usuario: { update: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<ClientesService>(ClientesService);
  });

  it('deactivates the linked account instead of deleting the client profile', async () => {
    prisma.cliente.findUnique.mockResolvedValue({ id: 4, usuarioId: 12 });
    prisma.usuario.update.mockResolvedValue({ id: 12, estado: false });

    await service.remove(4);

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: { estado: false },
      select: { id: true, estado: true },
    });
  });
});
