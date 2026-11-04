import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';

@Module({
  imports: [AuthModule],
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService],
})
export class CajaModule {}