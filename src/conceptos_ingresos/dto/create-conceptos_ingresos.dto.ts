// src\conceptos_ingresos\dto\create-conceptos_ingresos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConceptosIngresosDto {
  @ApiProperty({
    description: 'Identificador único del usuario (sub)',
  })
  @IsString()
  readonly sub!: string;

  @ApiProperty({
    description:
      'Identificador único de la fuente de ingreso (Mongoose ObjectId)',
  })
  @IsMongoId()
  readonly id_fuente_ingreso!: string;

  @ApiProperty({
    description: 'Período correspondiente al ingreso en formato YYYY-MM',
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
      'Monto o valor numérico del ingreso (debe ser mayor o igual a 0)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El valor del ingreso no puede ser menor a 0' })
  readonly valor!: number;
}
