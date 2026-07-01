// src\conceptos_gastos\schema\conceptos_gastos.schema.ts

import { FuentesGastos } from '../../fuentes_gastos/schema/fuentes_gastos.schema';
import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class ConceptosGastos {
  @Prop({
    type: Types.ObjectId,
    ref: FuentesGastos.name,
    required: true,
    index: true,
  })
  id_fuente_gasto!: Types.ObjectId; // Identificador único de la fuente de gasto | Todo: Realmente luego debería llamarla fuente_gasto ya que le hago populate

  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  sub!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: [
      /^\d{4}-(0[1-9]|1[0-2])$/,
      'El período debe cumplir con el formato YYYY-MM (ej. 2026-06)',
    ],
  })
  periodo!: string;

  @Prop({
    type: Number,
    required: false,
    validate: {
      validator: (v: number) => v === -1 || v >= 0,
      message:
        'El monto estimado debe ser -1 (sentinela) o un valor mayor o igual a 0',
    },
  })
  monto_estimado!: number;

  @Prop({
    type: Number,
    required: false,
    validate: {
      validator: (v: number) => v === -1 || v >= 0,
      message:
        'El porcentaje total debe ser -1 (sentinela) o un valor entre 0 y 100',
    },
    max: [100, 'El valor del porcentaje total no puede ser mayor a 100'],
  })
  porcentaje_total!: number; // Un porcentaje de X% implicará que el monto estimado sea un X% de los ingresos totales de este mes

  @Prop({
    type: Number,
    required: false,
    min: [0, 'El valor del monto real no puede ser menor a 0'],
  })
  monto_real!: number; // Se considera pagado cuando tiene un valor

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  aclaracion!: string;
}

export const ConceptosGastosSchema =
  SchemaFactory.createForClass(ConceptosGastos);

export type ConceptosGastosDocument = HydratedDocument<ConceptosGastos>;
