import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { ConfirmacionTurnoController } from './confirmacion-turno.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { TurnosRecordatorioService } from './turnos-recordatorio.service';

@Module({
  imports: [AuthModule, NotificacionesModule],
  controllers: [TurnosController, ConfirmacionTurnoController],
  providers: [
    TurnosService,
    TurnosRecordatorioService,
  ],
  exports: [TurnosService],
})
export class TurnosModule {}
