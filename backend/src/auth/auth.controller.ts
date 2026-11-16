import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Rol } from '@prisma/client';
import { AuthService } from './auth.service';
import { ConfigurarPinDto } from './dto/configurar-pin.dto';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

interface SolicitudAutenticada extends Request {
  user: { id: number; rol: Rol };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/clientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  registrarClienteComoAdministrador(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('admin/pin/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  obtenerEstadoPin(@Req() solicitud: SolicitudAutenticada) {
    return this.authService.obtenerEstadoPin(solicitud.user.id);
  }

  @Put('admin/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  configurarPin(
    @Body() dto: ConfigurarPinDto,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.authService.configurarPin(solicitud.user.id, dto);
  }
}