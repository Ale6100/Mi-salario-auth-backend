// src\conceptos_gastos\dto\patch-monto_real-conceptos_gastos..dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PatchMontoRealConceptosGastosDto {
  @ApiProperty({
    description:
      'Monto o valor numérico real del gasto (debe ser mayor o igual a 0)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El valor del gasto no puede ser menor a 0' })
  readonly monto_real!: number;

  @ApiProperty({
    description: 'Aclaración o nota adicional sobre el gasto (opcional)',
    required: false,
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  readonly aclaracion?: string;
}
