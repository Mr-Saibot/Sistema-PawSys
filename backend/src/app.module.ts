import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { VeterinariosModule } from './veterinarios/veterinarios.module';
import { AdministradoresModule } from './administradores/administradores.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { AgendasModule } from './agendas/agendas.module';
import { TurnosModule } from './turnos/turnos.module';
import { HistorialesClinicosModule } from './historiales-clinicos/historiales-clinicos.module';
import { ConsultasModule } from './consultas/consultas.module';
import { VacunacionesModule } from './vacunaciones/vacunaciones.module';
import { CajaModule } from './caja/caja.module';
import { IngresosModule } from './ingresos/ingresos.module';
import { EgresosModule } from './egresos/egresos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClientesModule,
    VeterinariosModule,
    AdministradoresModule,
    MascotasModule,
    AgendasModule,
    TurnosModule,
    HistorialesClinicosModule,
    ConsultasModule,
    VacunacionesModule,
    CajaModule,
    IngresosModule,
    EgresosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}