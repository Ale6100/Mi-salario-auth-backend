// src\fuentes_ingresos\dto\create-fuentes_ingresos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFuentesIngresosDto {
  @ApiProperty({
    description: 'Identificador único del usuario (sub)',
  })
  @IsString()
  readonly sub!: string;

  @ApiProperty({
    description: 'Nombre de la fuente de ingreso',
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre!: string;

  @ApiProperty({
    description: 'Indica si la fuente de ingreso está activa',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly activo!: boolean;

  @ApiProperty({
    description: 'Indica si corresponde a un aguinaldo (SAC)',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly aguinaldo?: boolean;

  @ApiProperty({
    description: 'Color en formato hexadecimal (#XXXXXX o #XXXXXXXX)',
    example: '#3b82f6',
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, {
    message: 'El formato de color debe ser #XXXXXX o #XXXXXXXX',
  })
  readonly color!: string;
}
