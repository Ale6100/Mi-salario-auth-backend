// src\conceptos_gastos\dto\create-conceptos_gastos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsMinusOneOrPositive } from '../../utils/validators';

export class CreateConceptosGastosDto {
  @ApiProperty({
    description: 'Identificador único del usuario (sub)',
  })
  @IsString()
  readonly sub!: string;

  @ApiProperty({
    description:
      'Identificador único de la fuente de gasto (Mongoose ObjectId)',
  })
  @IsMongoId()
  readonly id_fuente_gasto!: string;

  @ApiProperty({
    description: 'Período correspondiente al gasto en formato YYYY-MM',
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El período debe cumplir con el formato YYYY-MM (ej. 2026-06)',
  })
  readonly periodo!: string;

  @ApiProperty({
    description:
      'Monto o valor numérico estimado del gasto. Si es -1 o indefinido, el front considera que se usa el porcentaje_total. Solo se acepta -1 (sentinela) o valores >= 0',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @IsMinusOneOrPositive({
    message:
      'El monto estimado debe ser -1 (para usar porcentaje) o un valor mayor o igual a 0',
  })
  readonly monto_estimado!: number;

  @ApiProperty({
    description:
      'Porcentaje total del gasto (debe ser un número entre 0 y 100). Si es -1 o indefinido, el front considera que se usa el monto_estimado. Solo se acepta -1 (sentinela) o valores >= 0',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @IsMinusOneOrPositive({
    message:
      'El porcentaje total debe ser -1 (para usar monto estimado) o un valor entre 0 y 100',
  })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  readonly porcentaje_total!: number;
}
