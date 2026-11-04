import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const clavePrueba = 'PawSysDemo2026!';
const correosPrueba = [
  'cliente.demo@pawsys.local',
  'veterinario.demo@pawsys.local',
  'admin.demo@pawsys.local',
];

async function crearCuentasPrueba(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('No ejecutes las cuentas de prueba en producción.');
  }

  const existentes = await prisma.usuario.findMany({
    where: { correo: { in: correosPrueba } },
    select: { correo: true },
  });
  if (existentes.length) {
    throw new Error(`Ya existen cuentas de prueba (${existentes.map(({ correo }) => correo).join(', ')}). No se modificó ninguna.`);
  }

  const passwordHash = await bcrypt.hash(clavePrueba, 10);
  await prisma.$transaction(async (transaccion) => {
    const usuarioCliente = await transaccion.usuario.create({
      data: { correo: correosPrueba[0], passwordHash, rol: 'CLIENTE' },
    });
    const cliente = await transaccion.cliente.create({
      data: {
        cedulaIdentidad: 'PRUEBA-CLIENTE-001',
        nombre: 'María',
        apellido: 'Ríos',
        correo: correosPrueba[0],
        telefono: '+56 9 5555 0101',
        usuarioId: usuarioCliente.id,
      },
    });

    const usuarioVeterinario = await transaccion.usuario.create({
      data: { correo: correosPrueba[1], passwordHash, rol: 'VETERINARIO' },
    });
    const veterinario = await transaccion.veterinario.create({
      data: {
        especialidad: 'Medicina general',
        nroMatricula: 'PRUEBA-VET-001',
        nombre: 'Valentina',
        apellido: 'Cruz',
        correo: correosPrueba[1],
        usuarioId: usuarioVeterinario.id,
      },
    });

    const usuarioAdministrador = await transaccion.usuario.create({
      data: { correo: correosPrueba[2], passwordHash, rol: 'ADMINISTRADOR' },
    });
    await transaccion.administrador.create({
      data: {
        nombre: 'Camila',
        apellido: 'Herrera',
        correo: correosPrueba[2],
        usuarioId: usuarioAdministrador.id,
      },
    });

    const mascota = await transaccion.mascota.create({
      data: {
        nombre: 'Luna',
        especie: 'Perro',
        raza: 'Mestiza',
        peso: 12.5,
        clienteId: cliente.id,
      },
    });
    await transaccion.turno.create({
      data: {
        fecha: new Date(),
        hora: '10:30',
        motivo: 'Control general',
        estado: 'CONFIRMADO',
        mascotaId: mascota.id,
        veterinarioId: veterinario.id,
      },
    });
  });

  console.log('Cuentas de prueba creadas. Contraseña común:', clavePrueba);
  correosPrueba.forEach((correo) => console.log(correo));
}

void crearCuentasPrueba()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
