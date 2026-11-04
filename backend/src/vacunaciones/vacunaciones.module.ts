import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { VacunacionesService } from './vacunaciones.service';
import { VacunacionesController } from './vacunaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VacunacionesController],
  providers: [VacunacionesService],
  exports: [VacunacionesService],
})
export class VacunacionesModule {}