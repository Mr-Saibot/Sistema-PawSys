import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { AuthService } from './auth.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR)
@Controller('auth/usuarios')
export class UsuariosController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.authService.createStaff(dto);
  }
}
