// src\fuentes_ingresos\fuentes_ingreso.module.ts

import {
  ConceptosIngresos,
  ConceptosIngresosSchema,
} from 'src/conceptos_ingresos/schema/conceptos_ingresos.schema';
import {
  FuentesIngresos,
  FuentesIngresosSchema,
} from './schema/fuentes_ingresos.schema';
import { FuentesIngresosController } from './fuentes_ingresos.controller';
import { FuentesIngresosService } from './fuentes_ingresos.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FuentesIngresos.name, schema: FuentesIngresosSchema },
      { name: ConceptosIngresos.name, schema: ConceptosIngresosSchema },
    ]),
  ],
  controllers: [FuentesIngresosController],
  providers: [FuentesIngresosService],
})
export class FuentesIngresosModule {}
