// src\fondo_emergencia\dto\update-fondo_emergencia.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateFondoEmergenciaDto {
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
    default: false,
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

  @ApiProperty({
    description: 'Saldo real disponible del usuario en el día de hoy',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o: { saldo_real?: number | null }) => o.saldo_real != null)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El saldo real no puede ser menor a 0' })
  readonly saldo_real!: number | null;

  @ApiProperty({
    description:
      'Gastos adicionales mensuales que no se registran como fuente de gastos pero deberían considerarse para el cálculo del fondo de emergencia (ej: alquiler que paga un familiar)',
    required: false,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0, {
    message: 'El valor de gastos adicionales no puede ser menor a 0',
  })
  readonly gastos_adicionales!: number;
}
