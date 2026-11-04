import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';

@Module({
  imports: [AuthModule],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}