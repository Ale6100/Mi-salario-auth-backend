// src\conceptos_gastos\conceptos_gastos.module.ts

import {
  ConceptosGastos,
  ConceptosGastosSchema,
} from './schema/conceptos_gastos.schema';
import { ConceptosGastosController } from './conceptos_gastos.controller';
import { ConceptosGastosService } from './conceptos_gastos.service';
import {
  ConceptosIngresos,
  ConceptosIngresosSchema,
} from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import {
  FuentesGastos,
  FuentesGastosSchema,
} from '../fuentes_gastos/schema/fuentes_gastos.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConceptosGastos.name, schema: ConceptosGastosSchema },
      { name: ConceptosIngresos.name, schema: ConceptosIngresosSchema },
      { name: FuentesGastos.name, schema: FuentesGastosSchema },
    ]),
  ],
  controllers: [ConceptosGastosController],
  providers: [ConceptosGastosService],
})
export class ConceptosGastosModule {}
