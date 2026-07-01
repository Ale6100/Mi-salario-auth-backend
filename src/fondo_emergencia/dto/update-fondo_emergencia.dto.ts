// src\fondo_emergencia\dto\update-fondo_emergencia.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateFondoEmergenciaDto {
  @ApiProperty({
    description: 'Identificador único del usuario (sub)',
  })
  @IsString()
  readonly sub!: string;

  @ApiProperty({
    description:
      'Monto o valor numérico del fondo en pesos (debe ser mayor o igual a 0)',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0, { message: 'El valor del fondo no puede ser menor a 0' })
  readonly monto_pesos!: number;

  @ApiProperty({
    description:
      'Monto o valor numérico de los dólares (debe ser mayor o igual a 0)',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0, { message: 'El valor de los dólares no puede ser menor a 0' })
  readonly monto_dolares!: number;

  @ApiProperty({
    description:
      'Indica si se deben incluir los dólares en el cálculo del fondo de emergencia',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly incluir_dolares!: boolean;

  @ApiProperty({
    description:
      'Porcentaje del total de ingresos destinado al fondo de emergencia que se estima reservar al mes',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0, { message: 'El porcentaje no puede ser menor a 0' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  readonly porcentaje_total!: number;
}
