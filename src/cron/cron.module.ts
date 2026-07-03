import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import {
  ConceptosIngresos,
  ConceptosIngresosSchema,
} from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import {
  ConceptosGastos,
  ConceptosGastosSchema,
} from '../conceptos_gastos/schema/conceptos_gastos.schema';
import {
  FondoEmergencia,
  FondoEmergenciaSchema,
} from '../fondo_emergencia/schema/fondo_emergencia.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConceptosIngresos.name, schema: ConceptosIngresosSchema },
      { name: ConceptosGastos.name, schema: ConceptosGastosSchema },
      { name: FondoEmergencia.name, schema: FondoEmergenciaSchema },
    ]),
  ],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
