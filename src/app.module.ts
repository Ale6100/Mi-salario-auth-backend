// src\app.module.ts

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConceptosGastosModule } from './conceptos_gastos/conceptos_gastos.module';
import { ConceptosIngresosModule } from './conceptos_ingresos/conceptos_ingresos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FondoEmergenciaModule } from './fondo_emergencia/fondo_emergencia.module';
import { FuentesGastosModule } from './fuentes_gastos/fuentes_gastos.module';
import { FuentesIngresosModule } from './fuentes_ingresos/fuentes_ingresos.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    FuentesIngresosModule,
    ConceptosIngresosModule,
    FuentesGastosModule,
    ConceptosGastosModule,
    FondoEmergenciaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
