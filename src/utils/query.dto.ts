// src\utils\query.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryPeriodoDto {
  @ApiPropertyOptional({
    description:
      'Período en formato YYYY-MM para filtrar los conceptos (ej. 2026-06)',
    example: '2026-06',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El período debe cumplir con el formato YYYY-MM (ej. 2026-06)',
  })
  readonly periodo?: string;
}
