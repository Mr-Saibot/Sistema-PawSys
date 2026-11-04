import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EgresosService } from './egresos.service';
import { EgresosController } from './egresos.controller';

@Module({
  imports: [AuthModule],
  controllers: [EgresosController],
  providers: [EgresosService],
  exports: [EgresosService],
})
export class EgresosModule {}