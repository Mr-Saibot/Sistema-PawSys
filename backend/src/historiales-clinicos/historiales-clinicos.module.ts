import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HistorialesClinicosService } from './historiales-clinicos.service';
import { HistorialesClinicosController } from './historiales-clinicos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [HistorialesClinicosController],
  providers: [HistorialesClinicosService],
  exports: [HistorialesClinicosService],
})
export class HistorialesClinicosModule {}