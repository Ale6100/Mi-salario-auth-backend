// src\fuentes_gastos\schema\fuentes_gastos.schema.ts

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class FuentesGastos {
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  sub!: string; // Identificador único del usuario

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  nombre!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/,
      'El formato de color debe ser #XXXXXX o #XXXXXXXX',
    ],
  })
  color!: string; // Color en hex "#XXXXXX"
}

export const FuentesGastosSchema = SchemaFactory.createForClass(FuentesGastos);

export type FuentesGastosDocument = HydratedDocument<FuentesGastos>;
