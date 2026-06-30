// src\fuentes_gastos\fuentes_gastos.module.ts

import {
  FuentesGastos,
  FuentesGastosSchema,
} from './schema/fuentes_gastos.schema';
import { FuentesGastosController } from './fuentes_gastos.controller';
import { FuentesGastosService } from './fuentes_gastos.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FuentesGastos.name, schema: FuentesGastosSchema },
    ]),
  ],
  controllers: [FuentesGastosController],
  providers: [FuentesGastosService],
})
export class FuentesGastosModule {}
