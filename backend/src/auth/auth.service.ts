import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const correo = typeof dto.correo === 'string' ? dto.correo.trim().toLowerCase() : '';
    const cedulaIdentidad = typeof dto.cedulaIdentidad === 'string' ? dto.cedulaIdentidad.trim() : '';
    const nombre = typeof dto.nombre === 'string' ? dto.nombre.trim() : '';
    const apellido = typeof dto.apellido === 'string' ? dto.apellido.trim() : '';
    const password = typeof dto.password === 'string' ? dto.password : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new BadRequestException('El correo electrónico no es válido');
    }
    if (password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }
    if (!cedulaIdentidad || !nombre || !apellido) {
      throw new BadRequestException('Cédula, nombre y apellido son obligatorios');
    }
    if ((dto.telefono !== undefined && typeof dto.telefono !== 'string') || (dto.direccion !== undefined && typeof dto.direccion !== 'string')) {
      throw new BadRequestException('El teléfono y la dirección deben ser texto');
    }

    const existe = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (existe) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const [correoCliente, cedulaCliente] = await Promise.all([
      this.prisma.cliente.findUnique({ where: { correo } }),
      this.prisma.cliente.findUnique({ where: { cedulaIdentidad } }),
    ]);
    if (correoCliente) throw new BadRequestException('El correo ya está registrado');
    if (cedulaCliente) throw new BadRequestException('La cédula ya está registrada');

    const hashedPassword = await bcrypt.hash(password, 10);

    const registro = await this.prisma.$transaction(async (transaccion) => {
      const usuario = await transaccion.usuario.create({
        data: { correo, passwordHash: hashedPassword, rol: 'CLIENTE' },
      });
      const cliente = await transaccion.cliente.create({
        data: {
          cedulaIdentidad,
          nombre,
          apellido,
          correo,
          telefono: dto.telefono?.trim() || null,
          direccion: dto.direccion?.trim() || null,
          usuarioId: usuario.id,
        },
      });
      return { usuario, cliente };
    });

    const { passwordHash: _passwordHash, ...usuarioSeguro } = registro.usuario;
    return { user: usuarioSeguro, cliente: registro.cliente };
  }

  async login(dto: LoginDto) {
    const correo = dto.correo.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        cliente: { select: { nombre: true, apellido: true } },
        veterinario: { select: { nombre: true, apellido: true } },
        administrador: { select: { nombre: true, apellido: true } },
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValido = await bcrypt.compare(dto.password, usuario.passwordHash);

    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizamos el último acceso del usuario
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const payload = { sub: usuario.id, correo: usuario.correo, rol: usuario.rol };
    const token = this.jwtService.sign(payload);

    const { passwordHash: _passwordHash, ...userWithoutPassword } = usuario;

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async createStaff(dto: CreateStaffDto) {
    const correo = dto.correo.trim().toLowerCase();
    const nombre = dto.nombre.trim();
    const apellido = dto.apellido.trim();
    const especialidad = dto.especialidad?.trim();
    const nroMatricula = dto.nroMatricula?.trim();
    if (dto.rol === 'VETERINARIO' && (!especialidad || !nroMatricula)) {
      throw new BadRequestException('La especialidad y matrícula son obligatorias para el veterinario');
    }
    if (await this.prisma.usuario.findUnique({ where: { correo } })) {
      throw new BadRequestException('El correo ya está registrado');
    }
    if (dto.rol === 'VETERINARIO' && nroMatricula && await this.prisma.veterinario.findUnique({ where: { nroMatricula } })) {
      throw new BadRequestException('La matrícula ya está registrada');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.$transaction(async (transaction) => {
      const usuario = await transaction.usuario.create({
        data: { correo, passwordHash, rol: dto.rol },
      });
      if (dto.rol === 'VETERINARIO') {
        await transaction.veterinario.create({
          data: {
            especialidad: especialidad || '',
            nroMatricula: nroMatricula || '',
            nombre,
            apellido,
            correo,
            telefono: dto.telefono?.trim() || null,
            direccion: dto.direccion?.trim() || null,
            usuarioId: usuario.id,
          },
        });
      } else {
        await transaction.administrador.create({
          data: {
            nombre,
            apellido,
            telefono: dto.telefono?.trim() || null,
            direccion: dto.direccion?.trim() || null,
            correo,
            usuarioId: usuario.id,
          },
        });
      }
      return {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        estado: usuario.estado,
        fechaCreacion: usuario.fechaCreacion,
      };
    });
  }
}