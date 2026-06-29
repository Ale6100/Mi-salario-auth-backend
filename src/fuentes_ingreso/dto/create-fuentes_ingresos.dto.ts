// src\fuentes_ingreso\dto\create-fuentes_ingresos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateFuentesIngresosDto {
  @ApiProperty({
    description: 'Nombre de la fuente de ingreso',
  })
  @IsString()
  readonly nombre!: string;

  @ApiProperty({
    description: 'Indica si la fuente de ingreso está activa',
  })
  @IsBoolean()
  readonly activo!: boolean;

  @ApiProperty({
    description: 'Indica si corresponde a un aguinaldo',
    example: false,
  })
  @IsBoolean()
  readonly aguinaldo!: boolean;

  @ApiProperty({
    description: 'Color hexadecimal representativo',
  })
  @IsString()
  readonly color!: string;
}
