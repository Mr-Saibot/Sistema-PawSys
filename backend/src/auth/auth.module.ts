import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosController } from './usuarios.controller';
import { JwtStrategy } from './jwt.strategy';

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'CAMBIA_ESTA_CLAVE_POR_UNA_LARGA_Y_ALEATORIA') {
    throw new Error('Configura JWT_SECRET con un valor aleatorio y seguro antes de iniciar el backend.');
  }
  return secret;
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController, UsuariosController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}