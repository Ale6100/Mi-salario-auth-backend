// src\conceptos_ingresos\schema\conceptos_ingresos.schema.ts

import { FuentesIngresos } from '../../fuentes_ingresos/schema/fuentes_ingresos.schema';
import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class ConceptosIngresos {
  @Prop({
    type: Types.ObjectId,
    ref: FuentesIngresos.name,
    required: true,
    index: true,
  })
  id_fuente_ingreso!: Types.ObjectId; // Identificador único de la fuente de ingreso | Todo: Realmente luego debería llamarla fuente_ingreso ya que le hago populate

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
    required: true,
    min: [0, 'El valor del ingreso no puede ser menor a 0'],
  })
  valor!: number;
}

export const ConceptosIngresosSchema =
  SchemaFactory.createForClass(ConceptosIngresos);

export type ConceptosIngresosDocument = HydratedDocument<ConceptosIngresos>;
