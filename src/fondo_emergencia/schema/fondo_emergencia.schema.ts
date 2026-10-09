// src\fondo_emergencia\schema\fondo_emergencia.schema.ts

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class FondoEmergencia {
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
    unique: true,
  })
  sub!: string; // Identificador único del usuario

  @Prop({
    type: Number,
    required: false,
    default: 0,
    min: [0, 'El monto en pesos no puede ser menor a 0'],
  })
  monto_pesos!: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
    min: [0, 'El monto en dólares no puede ser menor a 0'],
  })
  monto_dolares!: number;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  incluir_dolares!: boolean;

  @Prop({
    type: Number,
    required: false,
    default: 33.33,
    min: [0, 'El valor del porcentaje total no puede ser menor a 0'],
    max: [100, 'El valor del porcentaje total no puede ser mayor a 100'],
  })
  porcentaje_total!: number; // Un porcentaje de X% implicará que la plata reservada para el fondo es de un X% mensual

  @Prop({
    type: Number,
    required: false,
    default: null,
    min: [0, 'El saldo real no puede ser menor a 0'],
  })
  saldo_real!: number | null;

  @Prop({
    type: Number,
    required: false,
    default: 0,
    min: [0, 'El valor de gastos adicionales no puede ser menor a 0'],
  })
  gastos_adicionales!: number;
}

export const FondoEmergenciaSchema =
  SchemaFactory.createForClass(FondoEmergencia);

export type FondoEmergenciaDocument = HydratedDocument<FondoEmergencia>;
