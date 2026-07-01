// src\fuentes_gastos\fuentes_gastos.module.ts

import {
  FuentesGastos,
  FuentesGastosSchema,
} from './schema/fuentes_gastos.schema';
import { FuentesGastosController } from './fuentes_gastos.controller';
import { FuentesGastosService } from './fuentes_gastos.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConceptosGastos,
  ConceptosGastosSchema,
} from '../conceptos_gastos/schema/conceptos_gastos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FuentesGastos.name, schema: FuentesGastosSchema },
      { name: ConceptosGastos.name, schema: ConceptosGastosSchema },
    ]),
  ],
  controllers: [FuentesGastosController],
  providers: [FuentesGastosService],
})
export class FuentesGastosModule {}
