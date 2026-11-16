import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { AuthService } from './auth.service';
import { ROLES_KEY } from './roles.decorator';

const INTENTOS_MAXIMOS_PIN = 5;
const BLOQUEO_PIN_MS = 15 * 60 * 1000;

interface SolicitudProtegida {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  user?: { id: number; rol: Rol };
}

interface IntentosPin {
  cantidad: number;
  bloqueadoHasta: number;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly intentosPin = new Map<number, IntentosPin>();

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }

    const solicitud = context
      .switchToHttp()
      .getRequest<SolicitudProtegida>();
    const usuario = solicitud.user;
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta operación.',
      );
    }

    if (this.requierePin(solicitud, usuario)) {
      await this.validarPin(solicitud, usuario.id);
    }

    return true;
  }

  private requierePin(
    solicitud: SolicitudProtegida,
    usuario: { rol: Rol },
  ): boolean {
    const metodoSeguro = ['GET', 'HEAD', 'OPTIONS'].includes(solicitud.method);
    const esConfiguracionPin =
      solicitud.path === '/auth/admin/pin'
      || solicitud.path.startsWith('/auth/admin/pin/');

    return usuario.rol === Rol.ADMINISTRADOR
      && !metodoSeguro
      && !esConfiguracionPin;
  }

  private async validarPin(
    solicitud: SolicitudProtegida,
    usuarioId: number,
  ): Promise<void> {
    this.validarBloqueo(usuarioId);
    const valorPin = solicitud.headers['x-admin-pin'];
    const pin = Array.isArray(valorPin) ? valorPin[0] : valorPin;

    if (!pin) {
      throw new ForbiddenException(
        'Ingresá tu PIN para confirmar esta modificación.',
      );
    }

    const correcto = await this.authService.verificarPin(usuarioId, pin);
    if (!correcto) {
      this.registrarIntentoFallido(usuarioId);
      throw new ForbiddenException(
        'El PIN ingresado no es correcto. Verificá e intentá de nuevo.',
      );
    }

    this.intentosPin.delete(usuarioId);
  }

  private validarBloqueo(usuarioId: number): void {
    const intento = this.intentosPin.get(usuarioId);
    if (intento && intento.bloqueadoHasta > Date.now()) {
      throw new HttpException(
        'Demasiados intentos. Espera 15 minutos antes de volver a probar.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (intento && intento.bloqueadoHasta > 0) {
      this.intentosPin.delete(usuarioId);
    }
  }

  private registrarIntentoFallido(usuarioId: number): void {
    const intentos = (this.intentosPin.get(usuarioId)?.cantidad ?? 0) + 1;
    const bloqueadoHasta = intentos >= INTENTOS_MAXIMOS_PIN
      ? Date.now() + BLOQUEO_PIN_MS
      : 0;
    this.intentosPin.set(usuarioId, { cantidad: intentos, bloqueadoHasta });

    if (bloqueadoHasta > 0) {
      throw new HttpException(
        'Se alcanzó el límite de intentos. Espera 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
