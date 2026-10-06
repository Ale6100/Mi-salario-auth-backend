// src\utils\copiar-periodo.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { PERIODO_REGEX } from './periodo';

export class CopiarPeriodoDto {
  @ApiProperty({
    description:
      'Período en formato YYYY-MM al que se copian los conceptos del mes anterior',
    example: '2026-06',
  })
  @IsString()
  @Matches(PERIODO_REGEX, {
    message: 'El período debe cumplir con el formato YYYY-MM (ej. 2026-06)',
  })
  readonly periodo_destino!: string;
}
