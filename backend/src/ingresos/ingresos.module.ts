import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';

@Module({
  imports: [AuthModule],
  controllers: [IngresosController],
  providers: [IngresosService],
  exports: [IngresosService],
})
export class IngresosModule {}