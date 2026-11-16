import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { ConfirmacionTurnoController } from './confirmacion-turno.controller';
import { CorreoTurnosService } from './correo-turnos.service';
import { TurnosRecordatorioService } from './turnos-recordatorio.service';

@Module({
  imports: [AuthModule],
  controllers: [TurnosController, ConfirmacionTurnoController],
  providers: [
    TurnosService,
    CorreoTurnosService,
    TurnosRecordatorioService,
  ],
  exports: [TurnosService],
})
export class TurnosModule {}