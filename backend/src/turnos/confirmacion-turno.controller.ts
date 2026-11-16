import { Body, Controller, Post } from '@nestjs/common';
import { ConfirmarTurnoDto } from './dto/confirmar-turno.dto';
import { TurnosService } from './turnos.service';

@Controller('turnos')
export class ConfirmacionTurnoController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post('confirmar')
  confirmar(@Body() dto: ConfirmarTurnoDto) {
    return this.turnosService.confirmarAsistencia(dto.token);
  }
}
