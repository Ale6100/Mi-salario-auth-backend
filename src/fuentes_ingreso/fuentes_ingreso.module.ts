// src\fuentes_ingreso\fuentes_ingreso.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FuentesIngreso,
  FuentesIngresoSchema,
} from './schema/fuentes_ingreso.schema';
import { FuentesIngresoController } from './fuentes_ingreso.controller';
import { FuentesIngresoService } from './fuentes_ingreso.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FuentesIngreso.name, schema: FuentesIngresoSchema },
    ]),
  ],
  controllers: [FuentesIngresoController],
  providers: [FuentesIngresoService],
})
export class FuentesIngresoModule {}
