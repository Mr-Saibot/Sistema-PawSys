import { ForbiddenException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VacunacionesService } from './vacunaciones.service';

describe('autorización de vacunaciones', () => {
  it('rechaza una vacunación perteneciente a otro veterinario', async () => {
    const prisma = {
      vacunacion: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          veterinario: { usuarioId: 20 },
        }),
      },
    };
    const service = new VacunacionesService(prisma as unknown as PrismaService);

    await expect(
      service.findOne(1, { id: 30, rol: Rol.VETERINARIO }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
