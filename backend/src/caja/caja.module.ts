import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CajaService } from './caja.service';
import { CajaController, ConfiguracionPagosController } from './caja.controller';

@Module({
  imports: [AuthModule],
  controllers: [CajaController, ConfiguracionPagosController],
  providers: [CajaService],
  exports: [CajaService],
})
export class CajaModule {}