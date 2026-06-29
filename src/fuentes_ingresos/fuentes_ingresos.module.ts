// src\fuentes_ingreso\fuentes_ingreso.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FuentesIngresos,
  FuentesIngresosSchema,
} from './schema/fuentes_ingreso.schema';
import { FuentesIngresosController } from './fuentes_ingresos.controller';
import { FuentesIngresosService } from './fuentes_ingresos.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FuentesIngresos.name, schema: FuentesIngresosSchema },
    ]),
  ],
  controllers: [FuentesIngresosController],
  providers: [FuentesIngresosService],
})
export class FuentesIngresosModule {}
