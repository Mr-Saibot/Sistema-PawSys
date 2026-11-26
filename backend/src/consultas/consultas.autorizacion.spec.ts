import { ForbiddenException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultasService } from './consultas.service';

describe('autorización de consultas', () => {
  it('rechaza una consulta perteneciente a otro veterinario', async () => {
    const prisma = {
      consulta: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          veterinario: { usuarioId: 20 },
        }),
      },
    };
    const service = new ConsultasService(prisma as unknown as PrismaService);

    await expect(
      service.findOne(1, { id: 30, rol: Rol.VETERINARIO }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
