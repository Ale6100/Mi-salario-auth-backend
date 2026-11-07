// src\conceptos_gastos\dto\create-cuotas-gastos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCuotasGastosDto {
  @ApiProperty({
    description:
      'Identificador único de la fuente de gasto (Mongoose ObjectId)',
  })
  @IsMongoId()
  readonly id_fuente_gasto!: string;

  @ApiProperty({
    description:
      'Período inicial a partir del cual se computan las cuotas (formato YYYY-MM)',
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El período debe cumplir con el formato YYYY-MM (ej. 2026-06)',
  })
  readonly periodo_inicio!: string;

  @ApiProperty({
    description: 'Monto de cada cuota individual',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El monto debe ser un valor mayor o igual a 0' })
  readonly monto!: number;

  @ApiProperty({
    description: 'Cantidad total de cuotas del plan o compra (ej. 6, 12)',
  })
  @IsInt()
  @Min(2, { message: 'El total de cuotas debe ser al menos 2' })
  @Max(120, { message: 'El total de cuotas no puede ser mayor a 120' })
  readonly total_cuotas!: number;

  @ApiProperty({
    description:
      'Número de cuota actual o inicial a registrar (por defecto 1, ej. 3 si ya se pagaron las primeras 2)',
    required: false,
    default: 1,
  })
  @IsInt()
  @Min(1, { message: 'La cuota inicial debe ser al menos 1' })
  @IsOptional()
  readonly cuota_actual?: number;

  @ApiProperty({
    description:
      'Aclaración o nombre de la compra a la que se le añadirá "(Cuota X/N)"',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly aclaracion?: string;
}
