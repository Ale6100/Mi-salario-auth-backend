// src\conceptos_ingresos\conceptos_ingresos.module.ts

import {
  ConceptosIngresos,
  ConceptosIngresosSchema,
} from './schema/conceptos_ingresos.schema';
import { ConceptosIngresosController } from './conceptos_ingresos.controller';
import { ConceptosIngresosService } from './conceptos_ingresos.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConceptosIngresos.name, schema: ConceptosIngresosSchema },
    ]),
  ],
  controllers: [ConceptosIngresosController],
  providers: [ConceptosIngresosService],
})
export class ConceptosIngresosModule {}
