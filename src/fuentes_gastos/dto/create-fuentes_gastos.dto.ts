// src\fuentes_gastos\dto\create-fuentes_gastos.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFuentesGastosDto {
  @ApiProperty({
    description: 'Identificador único del usuario (sub)',
  })
  @IsString()
  readonly sub!: string;

  @ApiProperty({
    description: 'Nombre de la fuente de gastos',
  })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre!: string;

  @ApiProperty({
    description: 'Color en formato hexadecimal (#XXXXXX o #XXXXXXXX)',
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
