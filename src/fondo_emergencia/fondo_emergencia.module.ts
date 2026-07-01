// src\fondo_emergencia\fondo_emergencia.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FondoEmergencia,
  FondoEmergenciaSchema,
} from './schema/fondo_emergencia.schema';
import { FondoEmergenciaController } from './fondo_emergencia.controller';
import { FondoEmergenciaService } from './fondo_emergencia.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FondoEmergencia.name, schema: FondoEmergenciaSchema },
    ]),
  ],
  controllers: [FondoEmergenciaController],
  providers: [FondoEmergenciaService],
})
export class FondoEmergenciaModule {}
