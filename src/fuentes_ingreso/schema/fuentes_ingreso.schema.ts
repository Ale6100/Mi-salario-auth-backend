// src\fuentes_ingreso\schema\fuentes_ingreso.schema.ts

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FuentesIngresoDocument = HydratedDocument<FuentesIngreso>;

@Schema({
  timestamps: true,
})
export class FuentesIngreso {
  @Prop({
    type: String,
    required: true,
  })
  sub!: string; // Identificador único del usuario

  @Prop({
    type: String,
    required: true,
  })
  nombre!: string;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  activo!: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  aguinaldo!: boolean; // Si corresponde o no a un aguinaldo

  @Prop({
    type: String,
    required: true,
  })
  color!: string; // Color en hex "#XXXXXX" (Todo: tantear si conviene este formato)
}

export const FuentesIngresoSchema =
  SchemaFactory.createForClass(FuentesIngreso);
