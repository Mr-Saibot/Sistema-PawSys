import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'CAMBIA_ESTA_CLAVE_POR_UNA_LARGA_Y_ALEATORIA') {
    throw new Error('Configura JWT_SECRET con un valor aleatorio y seguro antes de iniciar el backend.');
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(),
    });
  }

  async validate(payload: { sub: number; correo: string; rol: string }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado');
    }

    const { passwordHash: _passwordHash, ...userWithoutPassword } = usuario;
    return userWithoutPassword;
  }
}