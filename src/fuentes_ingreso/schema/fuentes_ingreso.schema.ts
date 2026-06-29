// src\fuentes_ingreso\schema\fuentes_ingresos.schema.ts

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FuentesIngresosDocument = HydratedDocument<FuentesIngresos>;

@Schema({
  timestamps: true,
})
export class FuentesIngresos {
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
  color!: string; // Color en hex "#XXXXXX"
}

export const FuentesIngresosSchema =
  SchemaFactory.createForClass(FuentesIngresos);
