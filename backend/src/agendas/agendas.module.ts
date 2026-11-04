import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AgendasService } from './agendas.service';
import { AgendasController } from './agendas.controller';

@Module({
  imports: [AuthModule],
  controllers: [AgendasController],
  providers: [AgendasService],
  exports: [AgendasService],
})
export class AgendasModule {}