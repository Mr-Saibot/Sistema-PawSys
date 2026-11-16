import { Test, TestingModule } from '@nestjs/testing';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MascotasService } from './mascotas.service';

describe('MascotasService', () => {
  let service: MascotasService;
  const prisma = {
    cliente: { findUnique: jest.fn() },
    mascota: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.cliente.findUnique.mockResolvedValue({ id: 2 });
    prisma.mascota.create.mockResolvedValue({ id: 5, historial: { id: 9 } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [MascotasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<MascotasService>(MascotasService);
  });

  it('creates a clinical history together with a new pet', async () => {
    await service.create(
      { nombre: 'Luna', especie: 'Perro', clienteId: 2 },
      { id: 10, rol: Rol.ADMINISTRADOR },
    );

    expect(prisma.mascota.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        nombre: 'Luna',
        clienteId: 2,
        historial: { create: {} },
      }),
      include: { cliente: true, historial: true },
    }));
  });

  it('includes the clinical timeline and only necessary owner contact data', async () => {
    prisma.mascota.findUnique.mockResolvedValue({
      id: 5,
      nombre: 'Luna',
      cliente: {
        id: 2,
        nombre: 'Ana',
        apellido: 'Gómez',
        correo: 'ana@example.test',
        telefono: '0981000000',
        usuarioId: 10,
      },
      historial: {
        consultas: [{ id: 3, motivo: 'Control' }],
        vacunaciones: [{ id: 4, vacuna: 'Antirrábica' }],
      },
    });

    const resultado = await service.findOne(5, { id: 10, rol: Rol.CLIENTE });

    expect(prisma.mascota.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          historial: {
            include: expect.objectContaining({
              consultas: expect.any(Object),
              vacunaciones: expect.any(Object),
            }),
          },
        }),
      }),
    );
    expect(resultado.cliente).toEqual({
      id: 2,
      nombre: 'Ana',
      apellido: 'Gómez',
      correo: 'ana@example.test',
      telefono: '0981000000',
    });
  });
});
