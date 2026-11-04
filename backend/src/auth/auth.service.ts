import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
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

    const { passwordHash, ...usuarioSeguro } = registro.usuario;
    return { user: usuarioSeguro, cliente: registro.cliente };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
      include: {
        cliente: { select: { nombre: true, apellido: true } },
        veterinario: { select: { nombre: true, apellido: true } },
        administrador: { select: { nombre: true, apellido: true } },
      },
    });

    if (!usuario) {
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

    const { passwordHash, ...userWithoutPassword } = usuario;

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }
}