import { Global, Module } from '@nestjs/common';
import { CorreoNotificacionesService } from './correo-notificaciones.service';

@Global()
@Module({
  providers: [CorreoNotificacionesService],
  exports: [CorreoNotificacionesService],
})
export class NotificacionesModule {}
