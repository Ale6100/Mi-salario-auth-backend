// src\fuentes_ingresos\schema\fuentes_ingresos.schema.ts

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class FuentesIngresos {
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
    type: Boolean,
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
    trim: true,
    match: [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/,
      'El formato de color debe ser #XXXXXX o #XXXXXXXX',
    ],
  })
  color!: string; // Color en hex "#XXXXXX"
}

export const FuentesIngresosSchema =
  SchemaFactory.createForClass(FuentesIngresos);

export type FuentesIngresosDocument = HydratedDocument<FuentesIngresos>;
