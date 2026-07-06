// src\conceptos_gastos\dto\patch-pagado-conceptos_gastos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PatchPagadoConceptosGastosDto {
  @ApiProperty({
    description:
      'Monto final pagado (debe ser mayor o igual a 0). Si no se envía, se conserva el valor actual',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El monto no puede ser menor a 0' })
  @IsOptional()
  readonly monto?: number;

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
