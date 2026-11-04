import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { VeterinariosService } from './veterinarios.service';
import { VeterinariosController } from './veterinarios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VeterinariosController],
  providers: [VeterinariosService],
  exports: [VeterinariosService],
})
export class VeterinariosModule {}