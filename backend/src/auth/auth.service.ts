import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { ConfigurarPinDto } from './dto/configurar-pin.dto';
import * as bcrypt from 'bcrypt';
import { CorreoNotificacionesService } from '../notificaciones/correo-notificaciones.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly correo: CorreoNotificacionesService,
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
    await this.enviarSinBloquear(
      this.correo.enviarBienvenida(correo, `${nombre} ${apellido}`),
      `No se pudo enviar el correo de bienvenida a ${correo}.`,
    );
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

    const nombreUsuario = this.obtenerNombreUsuario(usuario);
    await this.enviarSinBloquear(
      this.correo.enviarAvisoInicioSesion(
        usuario.correo,
        nombreUsuario,
        new Date().toLocaleString('es-PY'),
      ),
      `No se pudo enviar el aviso de inicio de sesión a ${usuario.correo}.`,
    );

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  private obtenerNombreUsuario(usuario: {
    cliente: { nombre: string; apellido: string } | null;
    veterinario: { nombre: string; apellido: string } | null;
    administrador: { nombre: string; apellido: string } | null;
  }): string {
    const perfil = usuario.cliente || usuario.veterinario || usuario.administrador;

    if (!perfil) {
      return 'Usuario';
    }

    return `${perfil.nombre} ${perfil.apellido}`;
  }

  private async enviarSinBloquear(
    envio: Promise<void>,
    mensajeError: string,
  ): Promise<void> {
    try {
      await envio;
    } catch (causa: unknown) {
      this.logger.warn(`${mensajeError} ${this.obtenerDetalleError(causa)}`);
    }
  }

  private obtenerDetalleError(causa: unknown): string {
    if (causa instanceof Error) {
      return causa.message;
    }

    return 'Error desconocido.';
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

  async obtenerEstadoPin(usuarioId: number) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { usuarioId },
      select: { pinHash: true },
    });
    if (!administrador) {
      throw new NotFoundException('No existe un perfil de administrador.');
    }

    return { configurado: Boolean(administrador.pinHash) };
  }

  async configurarPin(usuarioId: number, dto: ConfigurarPinDto) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { usuarioId },
      include: { usuario: true },
    });
    if (!administrador) {
      throw new NotFoundException('No existe un perfil de administrador.');
    }

    await this.validarClaveAdministrador(dto.password, administrador.usuario.passwordHash);
    await this.validarPinActual(administrador.pinHash, dto.pinActual);
    const pinHash = await bcrypt.hash(dto.pinNuevo, 10);

    await this.prisma.administrador.update({
      where: { id: administrador.id },
      data: { pinHash },
    });

    return { configurado: true };
  }

  async verificarPin(usuarioId: number, pin: string): Promise<boolean> {
    const administrador = await this.prisma.administrador.findUnique({
      where: { usuarioId },
      select: { pinHash: true },
    });
    if (!administrador) {
      throw new ForbiddenException('No existe un perfil de administrador.');
    }
    if (!administrador.pinHash) {
      throw new ForbiddenException(
        'Configura tu PIN de administrador antes de modificar registros.',
      );
    }

    return bcrypt.compare(pin, administrador.pinHash);
  }

  private async validarClaveAdministrador(
    clave: string,
    claveHash: string,
  ): Promise<void> {
    const valida = await bcrypt.compare(clave, claveHash);
    if (!valida) {
      throw new UnauthorizedException('La contraseña actual no es correcta.');
    }
  }

  private async validarPinActual(
    pinHash: string | null,
    pinActual?: string,
  ): Promise<void> {
    if (!pinHash) {
      return;
    }
    if (!pinActual || !(await bcrypt.compare(pinActual, pinHash))) {
      throw new UnauthorizedException('El PIN actual no es correcto.');
    }
  }
}
